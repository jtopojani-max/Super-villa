import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as functions from "firebase-functions/v1";
export {
  backfillOwnerAnalyticsListingCounts,
  cleanupAnalyticsDedupe,
  expireElapsedSubscriptions,
  trackListingEvent,
  upsertUserSubscription,
} from "./analytics";
export {
  createPaidPlanRequest,
  reviewPaidPlanRequest,
  managePaidPlanRequest,
  expirePaidPlanRequests,
  notifyExpiringPaidPlans,
} from "./paidPlans";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const adminAuth = getAuth();

// ─── Helper: verify admin via custom claims ──────────────────────────
async function hasAdminAccess(uid: string): Promise<boolean> {
  const user = await adminAuth.getUser(uid);
  if (user.customClaims?.admin) return true;

  const userDoc = await db.doc(`users/${uid}`).get();
  return userDoc.exists && userDoc.data()?.role === "admin";
}

async function verifyAdmin(uid: string): Promise<void> {
  const isAdmin = await hasAdminAccess(uid);
  if (isAdmin) return;

  throw new functions.https.HttpsError(
    "permission-denied",
    "Vetem adminet mund ta bejne kete veprim."
  );
}

// ─── Helper: generate next idNumber from counters/posts ──────────────
async function getNextIdNumber(): Promise<number> {
  const counterRef = db.doc("counters/posts");
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists ? (snap.data()?.lastId ?? 1000) : 1000;
    const next = current + 1;
    tx.set(counterRef, { lastId: next }, { merge: true });
    return next;
  });
  return result;
}

// ─── Helper: get max sortOrder among active posts ────────────────────
async function getMaxSortOrder(): Promise<number> {
  const snap = await db
    .collection("posts_private")
    .where("status", "==", "active")
    .orderBy("sortOrder", "desc")
    .limit(1)
    .get();
  if (snap.empty) return 0;
  return snap.docs[0].data().sortOrder ?? 0;
}

function normalizePremiumOrder(value: unknown): number | null {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const FREE_PLAN_MAX_LISTINGS = 1;

// ─── Helper: check user's active subscription plan ──────────────────
async function getUserActivePlanId(uid: string): Promise<string> {
  try {
    const subSnap = await db.doc(`user_subscriptions/${uid}`).get();
    if (subSnap.exists) {
      const data = subSnap.data()!;
      const status = data.status;
      const expiresAt = data.expiresAt ? (data.expiresAt.toDate?.() ?? new Date(data.expiresAt)) : null;
      const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;
      if (status === "active" && !isExpired && (data.planId === "premium" || data.planId === "business-pro")) {
        return data.planId;
      }
    }
  } catch (_) {
    // fall through to payment_submissions check
  }

  try {
    const now = Date.now();
    const paymentsSnap = await db
      .collection("payment_submissions")
      .where("userId", "==", uid)
      .where("paymentStatus", "==", "approved")
      .get();

    for (const doc of paymentsSnap.docs) {
      const d = doc.data();
      const expiresAt = d.expiresAt ? (d.expiresAt.toDate?.() ?? new Date(d.expiresAt)) : null;
      if (!expiresAt || expiresAt.getTime() > now) {
        if (d.planId === "premium" || d.planId === "business-pro") {
          return d.planId;
        }
      }
    }
  } catch (_) {
    // ignore
  }

  return "free";
}

// ═══════════════════════════════════════════════════════════════════════
// 1. createPost — callable by any authenticated user
// ═══════════════════════════════════════════════════════════════════════
export const createPost = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kyçur."
    );
  }

  // Check free plan listing limit (skip for admins)
  const isAdmin = await hasAdminAccess(uid);
  if (!isAdmin) {
    const planId = await getUserActivePlanId(uid);
    if (planId === "free") {
      const existingSnap = await db
        .collection("posts_private")
        .where("ownerUid", "==", uid)
        .get();
      if (existingSnap.size >= FREE_PLAN_MAX_LISTINGS) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "Plani Falas lejon vetem 1 shpallje. Kalon ne nje plan me te larte per te postuar me shume."
        );
      }
    }
  }

  // Validate required fields
  const title = (data.title ?? "").trim();
  const description = (data.description ?? "").trim();
  const location = (data.location ?? "").trim();
  const image = (data.image ?? "").trim();
  const category = (data.category ?? "Villa").trim();

  if (!title || !description || !location || !image) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Mungojne te dhenat kryesore te shpalljes."
    );
  }

  const price = Number(data.price);
  const rooms = Number(data.rooms);
  const beds = Number(data.beds);
  const baths = Number(data.baths);
  const guests = Number(data.guests) || Math.max(1, beds * 2);
  const area = Number(data.area) || 0;

  if (price <= 0 || rooms <= 0 || beds <= 0 || baths <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Vlerat numerike duhet te jene me te medha se zero."
    );
  }

  // Normalize images
  const images: string[] = Array.isArray(data.images)
    ? data.images
        .filter((u: unknown) => typeof u === "string" && (u as string).trim())
        .slice(0, 10)
    : [image];

  // Generate unique idNumber
  const idNumber = await getNextIdNumber();

  // Get user info for author field
  const userRecord = await adminAuth.getUser(uid);
  const author =
    userRecord.displayName || userRecord.email?.split("@")[0] || "Perdorues";
  const canManagePremium = await hasAdminAccess(uid);
  const isPremium = canManagePremium ? Boolean(data.isPremium) : false;
  const premiumOrder = isPremium ? normalizePremiumOrder(data.premiumOrder) : null;

  const now = FieldValue.serverTimestamp();

  // Build posts_private document
  const privateDoc = {
    idNumber,
    ownerUid: uid,
    title,
    description,
    location,
    category,
    image: images[0] || image,
    images,
    price,
    rooms,
    beds,
    baths,
    guests,
    area,
    whatsapp: (data.whatsapp ?? "").replace(/[^\d+]/g, ""),
    features: Array.isArray(data.features) ? data.features : [],
    author,
    createdBy: userRecord.email || author,
    createdByEmail: userRecord.email || "",
    companyName: (data.companyName ?? "").trim(),
    isUserPost: true,
    isPremium,
    premiumStatus: isPremium ? "active" : "none",
    premiumPlanId: isPremium ? "premium" : "",
    premiumRequestId: "",
    premiumOrder,
    premiumDays: null,
    premiumStartedAt: null,
    premiumExpiresAt: null,
    premiumApprovedAt: null,
    premiumApprovedBy: null,
    premiumRejectedAt: null,
    premiumRejectedReason: "",
    // Moderation fields
    status: "pending",
    statusBadge: "Wait to confirm",
    sortOrder: null,
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
    approvedBy: null,
  };

  const docRef = await db.collection("posts_private").add(privateDoc);

  return {
    postId: docRef.id,
    idNumber,
    status: "pending",
    statusBadge: "Wait to confirm",
  };
});

// ═══════════════════════════════════════════════════════════════════════
// 2. approvePost — callable by admin only
// ═══════════════════════════════════════════════════════════════════════
export const approvePost = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kyçur."
    );
  }
  await verifyAdmin(uid);

  const postId: string = data.postId;
  if (!postId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Mungon postId."
    );
  }

  const postRef = db.doc(`posts_private/${postId}`);
  const postSnap = await postRef.get();

  if (!postSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Posti nuk u gjet.");
  }

  const postData = postSnap.data()!;

  if (postData.status === "active") {
    throw new functions.https.HttpsError(
      "already-exists",
      "Posti eshte tashme aktiv."
    );
  }

  // Calculate next sortOrder (put at end of active list)
  const maxSort = await getMaxSortOrder();
  const nextSort = maxSort + 1;
  const now = FieldValue.serverTimestamp();

  // Update posts_private
  await postRef.update({
    status: "active",
    statusBadge: "Active",
    sortOrder: nextSort,
    approvedAt: now,
    approvedBy: uid,
    updatedAt: now,
  });

  // Create posts_public document (no idNumber or statusBadge)
  const publicDoc = {
    title: postData.title,
    description: postData.description,
    location: postData.location,
    category: postData.category,
    image: postData.image,
    images: postData.images || [],
    price: postData.price,
    rooms: postData.rooms,
    beds: postData.beds,
    baths: postData.baths,
    guests: postData.guests,
    area: postData.area || 0,
    whatsapp: postData.whatsapp || "",
    features: postData.features || [],
    author: postData.author,
    createdBy: postData.createdBy,
    createdByUid: postData.ownerUid,
    createdByEmail: postData.createdByEmail || "",
    companyName: postData.companyName || "",
    isUserPost: postData.isUserPost ?? true,
    isPremium: Boolean(postData.isPremium),
    premiumStatus: postData.premiumStatus || (postData.isPremium ? "active" : "none"),
    premiumPlanId: postData.premiumPlanId || "",
    premiumRequestId: postData.premiumRequestId || "",
    premiumOrder: normalizePremiumOrder(postData.premiumOrder),
    premiumDays: postData.premiumDays ?? null,
    premiumStartedAt: postData.premiumStartedAt || null,
    premiumExpiresAt: postData.premiumExpiresAt || null,
    ownerUid: postData.ownerUid,
    sortOrder: nextSort,
    createdAt: postData.createdAt,
    approvedAt: now,
  };

  // Use same document ID in posts_public
  await db.doc(`posts_public/${postId}`).set(publicDoc);

  return { success: true, sortOrder: nextSort };
});

// ═══════════════════════════════════════════════════════════════════════
// 3. rejectPost — callable by admin only
// ═══════════════════════════════════════════════════════════════════════
export const rejectPost = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kyçur."
    );
  }
  await verifyAdmin(uid);

  const postId: string = data.postId;
  if (!postId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Mungon postId."
    );
  }

  const postRef = db.doc(`posts_private/${postId}`);
  const postSnap = await postRef.get();

  if (!postSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Posti nuk u gjet.");
  }

  const postData = postSnap.data()!;
  const now = FieldValue.serverTimestamp();

  // Update posts_private
  await postRef.update({
    status: "rejected",
    statusBadge: "Rejected",
    sortOrder: null,
    updatedAt: now,
  });

  // If it was previously active, remove from posts_public
  if (postData.status === "active") {
    await db.doc(`posts_public/${postId}`).delete();
  }

  return { success: true };
});

// ═══════════════════════════════════════════════════════════════════════
// createReview — callable by any authenticated user
// Uses Admin SDK so review submissions are validated server-side.
// ═══════════════════════════════════════════════════════════════════════
export const createReview = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kycur per te lene nje vleresim."
    );
  }

  const listingId =
    typeof data.listingId === "string" ? data.listingId.trim() : "";
  const comment =
    typeof data.comment === "string" ? data.comment.trim() : "";
  const rating = Number.parseInt(String(data.rating ?? ""), 10);

  if (!listingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Mungon listingId."
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Vleresimi duhet te jete ndermjet 1 dhe 5."
    );
  }

  if (!comment) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Komenti nuk mund te jete bosh."
    );
  }

  if (comment.length > 1000) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Komenti nuk mund te kaloje 1000 karaktere."
    );
  }

  const [legacyListingSnap, publicListingSnap] = await Promise.all([
    db.doc(`listings/${listingId}`).get(),
    db.doc(`posts_public/${listingId}`).get(),
  ]);

  if (!legacyListingSnap.exists && !publicListingSnap.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "Prona nuk u gjet."
    );
  }

  const userRecord = await adminAuth.getUser(uid);
  const userName =
    userRecord.displayName ||
    userRecord.email?.split("@")[0] ||
    "Perdorues";
  const userPhoto = userRecord.photoURL || "";

  const reviewRef = await db.collection("reviews").add({
    listingId,
    userId: uid,
    userName,
    userPhoto,
    rating,
    comment,
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    id: reviewRef.id,
    listingId,
    userId: uid,
    userName,
    userPhoto,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };
});

// ═══════════════════════════════════════════════════════════════════════
// 4. reorderPosts — callable by admin only (drag-and-drop)
// ═══════════════════════════════════════════════════════════════════════
export const reorderPosts = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kyçur."
    );
  }
  await verifyAdmin(uid);

  const orderedIds: string[] = data.orderedIds;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "orderedIds duhet te jete nje array jo-bosh."
    );
  }

  if (orderedIds.length > 500) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Maksimumi 500 postime mund te rirenditen njeheresh."
    );
  }

  // Batch update sortOrder for both collections atomically
  const batch = db.batch();

  orderedIds.forEach((postId, index) => {
    const sortOrder = index + 1;
    batch.update(db.doc(`posts_private/${postId}`), {
      sortOrder,
      updatedAt: FieldValue.serverTimestamp(),
    });
    batch.update(db.doc(`posts_public/${postId}`), { sortOrder });
  });

  await batch.commit();

  return { success: true, count: orderedIds.length };
});

// ═══════════════════════════════════════════════════════════════════════
// 5. setAdminClaim — callable by existing admin to set custom claims
// ═══════════════════════════════════════════════════════════════════════
export const setAdminClaim = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kyçur."
    );
  }
  await verifyAdmin(uid);

  const targetUid: string = data.targetUid;
  const isAdmin: boolean = data.isAdmin;

  if (!targetUid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Mungon targetUid."
    );
  }

  await adminAuth.setCustomUserClaims(targetUid, { admin: isAdmin });

  return { success: true, targetUid, isAdmin };
});

// ═══════════════════════════════════════════════════════════════════════
// 6. adminDeletePost — callable by admin only (server-side cleanup)
// ═══════════════════════════════════════════════════════════════════════
export const adminDeletePostFn = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kyçur."
    );
  }
  await verifyAdmin(uid);

  const postId: string = data.postId;
  if (!postId || typeof postId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Mungon postId."
    );
  }

  const postRef = db.doc(`posts_private/${postId}`);
  const postSnap = await postRef.get();

  if (!postSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Posti nuk u gjet.");
  }

  const postData = postSnap.data()!;

  // Delete from posts_public if it was active
  if (postData.status === "active") {
    try {
      await db.doc(`posts_public/${postId}`).delete();
    } catch (_) {
      // posts_public doc may not exist — safe to ignore
    }
  }

  // Delete from posts_private
  await postRef.delete();

  return { success: true, postId };
});

// ═══════════════════════════════════════════════════════════════════════
// 7. deleteUser — callable by admin only
//    Disables Firebase Auth account + deletes Firestore user doc +
//    cleans up user's posts (sets them to rejected / removes from public)
// ═══════════════════════════════════════════════════════════════════════
export const deleteUser = functions.https.onCall(async (data, context) => {
  const callerUid = context.auth?.uid;
  if (!callerUid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Duhet te jesh i kyçur."
    );
  }
  await verifyAdmin(callerUid);

  const targetUid: string = data.targetUid;
  if (!targetUid || typeof targetUid !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Mungon targetUid."
    );
  }

  // Safety: prevent admin from deleting themselves
  if (targetUid === callerUid) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Nuk mund te fshish veten."
    );
  }

  // 1. Disable the Firebase Auth account (soft-delete — preserves data for audit)
  try {
    await adminAuth.updateUser(targetUid, { disabled: true });
  } catch (authError: unknown) {
    const code = (authError as { code?: string })?.code;
    // If user doesn't exist in Auth, continue with Firestore cleanup
    if (code !== "auth/user-not-found") {
      throw new functions.https.HttpsError(
        "internal",
        "Gabim gjate çaktivizimit te llogarise Auth."
      );
    }
  }

  // 2. Clean up user's posts: reject active ones, remove from posts_public
  const userPostsSnap = await db
    .collection("posts_private")
    .where("ownerUid", "==", targetUid)
    .get();

  if (!userPostsSnap.empty) {
    const batch = db.batch();
    for (const postDoc of userPostsSnap.docs) {
      const postData = postDoc.data();
      // Remove from public feed if active
      if (postData.status === "active") {
        batch.delete(db.doc(`posts_public/${postDoc.id}`));
      }
      // Mark as rejected in posts_private (keep for audit)
      batch.update(postDoc.ref, {
        status: "rejected",
        statusBadge: "User disabled",
        sortOrder: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  // 3. Delete the Firestore user document
  const userDocRef = db.doc(`users/${targetUid}`);
  if ((await userDocRef.get()).exists) {
    await userDocRef.delete();
  }

  return { success: true, targetUid, action: "disabled_and_cleaned" };
});
