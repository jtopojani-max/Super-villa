import { auth, db, functions } from "../firebase.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getListingExperience } from "../utils/experience.js";

const PREMIUM_FETCH_MULTIPLIER = 4;

// ─── Timestamp helper ────────────────────────────────────────────────
const toISO = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
};

const normalizePremiumOrder = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortPremiumItems = (a, b) => {
  const aOrder = typeof a.premiumOrder === "number" ? a.premiumOrder : Number.MAX_SAFE_INTEGER;
  const bOrder = typeof b.premiumOrder === "number" ? b.premiumOrder : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return toMillis(b.createdAt) - toMillis(a.createdAt);
};

const resolvePremiumFetchLimit = (limitCount = 6) => {
  const parsed = Number(limitCount);
  const safeLimit = Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
  return Math.max(6, safeLimit) * PREMIUM_FETCH_MULTIPLIER;
};

const resolvePremiumPayload = (payload = {}) => {
  const isPremium = Boolean(payload.isPremium);
  const rawDays = Number(payload.premiumDays);
  const premiumDays = isPremium && Number.isFinite(rawDays) && rawDays >= 1 ? Math.round(rawDays) : null;
  const now = new Date();
  const premiumStartedAt = isPremium ? now.toISOString() : null;
  const premiumExpiresAt = isPremium && premiumDays
    ? new Date(now.getTime() + premiumDays * 24 * 60 * 60 * 1000).toISOString()
    : null;
  return {
    isPremium,
    premiumStatus: isPremium ? "active" : "none",
    premiumPlanId: isPremium ? "premium" : "",
    premiumRequestId: "",
    premiumOrder: isPremium ? normalizePremiumOrder(payload.premiumOrder) : null,
    premiumDays,
    premiumStartedAt,
    premiumExpiresAt,
    premiumApprovedAt: isPremium ? now.toISOString() : null,
    premiumApprovedBy: auth.currentUser?.uid || null,
    premiumRejectedAt: null,
    premiumRejectedReason: "",
  };
};

const isCurrentUserAdmin = async () => {
  if (!auth.currentUser) return false;

  try {
    const tokenResult = await auth.currentUser.getIdTokenResult();
    if (tokenResult?.claims?.admin) return true;
  } catch (error) {
    console.warn("Failed to inspect admin claims:", error);
  }

  try {
    const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    return userSnap.exists() && userSnap.data()?.role === "admin";
  } catch (error) {
    console.warn("Failed to inspect admin role document:", error);
    return false;
  }
};

const toPost = (snap) => {
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    isPremium: Boolean(data.isPremium),
    premiumStatus: data.premiumStatus || (data.isPremium ? "active" : "none"),
    premiumPlanId: data.premiumPlanId || "",
    premiumRequestId: data.premiumRequestId || "",
    premiumOrder: normalizePremiumOrder(data.premiumOrder),
    premiumDays: data.premiumDays ?? null,
    premiumStartedAt: toISO(data.premiumStartedAt),
    premiumExpiresAt: toISO(data.premiumExpiresAt),
    premiumApprovedAt: toISO(data.premiumApprovedAt),
    premiumApprovedBy: data.premiumApprovedBy || "",
    premiumRejectedAt: toISO(data.premiumRejectedAt),
    premiumRejectedReason: data.premiumRejectedReason || "",
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    approvedAt: toISO(data.approvedAt),
  };
};

const readPremiumDocs = async (collectionReference, limitCount = 6) => {
  const fetchLimit = resolvePremiumFetchLimit(limitCount);

  try {
    const snap = await getDocs(
      query(
        collectionReference,
        where("isPremium", "==", true),
        orderBy("premiumOrder", "asc"),
        orderBy("createdAt", "desc"),
        limit(fetchLimit)
      )
    );
    return snap.docs.map(toPost).sort(sortPremiumItems);
  } catch (error) {
    if (error?.code !== "failed-precondition") throw error;

    // Premium section fallback: keeps local/dev working before indexes are deployed.
    const snap = await getDocs(query(collectionReference, where("isPremium", "==", true), limit(fetchLimit)));
    return snap.docs.map(toPost).sort(sortPremiumItems);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// CREATE POST — calls Cloud Function (counter access is admin-only)
// ═══════════════════════════════════════════════════════════════════════
export const createPost = async (payload) => {
  if (!auth.currentUser?.uid) throw new Error("Duhet te jesh i kyçur.");

  const images = Array.isArray(payload.images)
    ? payload.images.filter(Boolean).slice(0, 10)
    : [payload.image];

  const callCreatePost = httpsCallable(functions, "createPost");
  const premiumPayload = resolvePremiumPayload(payload);
  const result = await callCreatePost({
    title: (payload.title || "").trim(),
    description: (payload.description || "").trim(),
    location: (payload.location || "").trim(),
    category: (payload.category || "Villa").trim(),
    image: images[0] || (payload.image || "").trim(),
    images,
    price: Number(payload.price) || 0,
    rooms: Number(payload.rooms) || 0,
    beds: Number(payload.beds) || 0,
    baths: Number(payload.baths) || 0,
    guests: Number(payload.guests) || Math.max(1, (Number(payload.beds) || 1) * 2),
    area: Number(payload.area) || 0,
    whatsapp: (payload.whatsapp || "").replace(/[^\d+]/g, ""),
    features: Array.isArray(payload.features) ? payload.features : [],
    companyName: (payload.companyName || "").trim(),
    isPremium: premiumPayload.isPremium,
    premiumOrder: premiumPayload.premiumOrder,
  });

  // Save location data to posts_private separately (Cloud Function doesn't handle these)
  const postId = result.data?.postId;
  if (postId && (payload.lat || payload.address || payload.placeId)) {
    try {
      await updateDoc(doc(db, "posts_private", postId), {
        lat: payload.lat || null,
        lng: payload.lng || null,
        address: (payload.address || "").trim(),
        city: (payload.city || "").trim(),
        country: (payload.country || "").trim(),
        placeId: (payload.placeId || "").trim(),
        placeName: (payload.placeName || "").trim(),
        street: (payload.street || "").trim(),
        postalCode: (payload.postalCode || "").trim(),
        placeType: (payload.placeType || "").trim(),
      });
    } catch (locationErr) {
      // Location save failed — post was still created successfully
      // Log for debugging but don't block the user
      console.warn("Location save failed (non-critical):", locationErr);
    }
  }

  return result.data;
};

// ═══════════════════════════════════════════════════════════════════════
// APPROVE POST — admin sets status=active and creates posts_public doc
// ═══════════════════════════════════════════════════════════════════════
export const approvePost = async (postId) => {
  const postRef = doc(db, "posts_private", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) throw new Error("Posti nuk u gjet.");

  const postData = postSnap.data();

  // Get max sortOrder from active posts of the SAME experience (villas or apartments)
  const postExperience = getListingExperience(postData);
  const activeQ = query(
    collection(db, "posts_private"),
    where("status", "==", "active")
  );
  const activeSnap = await getDocs(activeQ);
  let maxSort = 0;
  activeSnap.docs.forEach((d) => {
    const data = d.data();
    if (getListingExperience(data) !== postExperience) return;
    const s = data.sortOrder;
    if (typeof s === "number" && s > maxSort) maxSort = s;
  });
  const nextSort = maxSort + 1;

  // Update posts_private
  await updateDoc(postRef, {
    status: "active",
    statusBadge: "Active",
    sortOrder: nextSort,
    approvedAt: serverTimestamp(),
    approvedBy: auth.currentUser?.uid || "",
    updatedAt: serverTimestamp(),
  });

  // Create posts_public doc (no idNumber, no statusBadge)
  // Ensure no undefined values — Firestore rejects them
  await setDoc(doc(db, "posts_public", postId), {
    title: postData.title || "",
    description: postData.description || "",
    location: postData.location || "",
    category: postData.category || "Villa",
    image: postData.image || "",
    images: postData.images || [],
    price: postData.price || 0,
    rooms: postData.rooms || 0,
    beds: postData.beds || 0,
    baths: postData.baths || 0,
    guests: postData.guests || 0,
    area: postData.area || 0,
    whatsapp: postData.whatsapp || "",
    features: postData.features || [],
    author: postData.author || "",
    createdBy: postData.createdBy || "",
    createdByUid: postData.ownerUid || "",
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
    ownerUid: postData.ownerUid || "",
    sortOrder: nextSort,
    createdAt: postData.createdAt || serverTimestamp(),
    approvedAt: serverTimestamp(),
    lat: postData.lat || null,
    lng: postData.lng || null,
    address: postData.address || "",
    city: postData.city || "",
    country: postData.country || "",
    placeId: postData.placeId || "",
    placeName: postData.placeName || "",
    street: postData.street || "",
    postalCode: postData.postalCode || "",
    placeType: postData.placeType || "",
  });

  return { success: true, sortOrder: nextSort };
};

// ═══════════════════════════════════════════════════════════════════════
// REJECT POST — admin sets status=rejected, removes from posts_public
// ═══════════════════════════════════════════════════════════════════════
export const rejectPost = async (postId) => {
  const postRef = doc(db, "posts_private", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) throw new Error("Posti nuk u gjet.");

  const postData = postSnap.data();

  await updateDoc(postRef, {
    status: "rejected",
    statusBadge: "Rejected",
    sortOrder: null,
    updatedAt: serverTimestamp(),
  });

  // If previously active, remove from posts_public
  if (postData.status === "active") {
    await deleteDoc(doc(db, "posts_public", postId));
  }

  return { success: true };
};

// ═══════════════════════════════════════════════════════════════════════
// REORDER POSTS — admin batch-updates sortOrder
// ═══════════════════════════════════════════════════════════════════════
export const reorderPosts = async (orderedIds) => {
  const batch = writeBatch(db);

  orderedIds.forEach((postId, index) => {
    const sortOrder = index + 1;
    batch.update(doc(db, "posts_private", postId), {
      sortOrder,
      updatedAt: serverTimestamp(),
    });
    // Use set+merge so it won't fail if posts_public doc doesn't exist yet
    batch.set(doc(db, "posts_public", postId), { sortOrder }, { merge: true });
  });

  await batch.commit();
  return { success: true, count: orderedIds.length };
};

// ─── Firestore reads ────────────────────────────────────────────────

// Public feed: read from posts_public, ordered by sortOrder
export const listPublicPosts = async () => {
  try {
    const snap = await getDocs(collection(db, "posts_public"));
    return snap.docs
      .map(toPost)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (error) {
    console.error("Gabim ne ngarkimin e posteve publike:", error);
    throw new Error("Nuk mund te ngarkohen postimet. Kontrolloni lidhjen me internetin.");
  }
};

export const listPremiumPublicPosts = async (limitCount = 6) => {
  try {
    return await readPremiumDocs(collection(db, "posts_public"), limitCount);
  } catch (error) {
    console.error("Gabim ne ngarkimin e posteve premium:", error);
    throw new Error("Nuk mund te ngarkohen postimet premium. Kontrolloni lidhjen me internetin.");
  }
};

// My posts: read own posts from posts_private
export const listMyPosts = async (uid) => {
  try {
    const q = query(
      collection(db, "posts_private"),
      where("ownerUid", "==", uid)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(toPost)
      .sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("Gabim ne ngarkimin e posteve tuaja:", error);
    throw new Error("Nuk mund te ngarkohen postimet tuaja. Kontrolloni lidhjen me internetin.");
  }
};

// Admin: read all posts from posts_private
export const listAllPrivatePosts = async () => {
  try {
    const snap = await getDocs(collection(db, "posts_private"));
    return snap.docs
      .map(toPost)
      .sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("Gabim ne ngarkimin e posteve private:", error);
    throw new Error("Nuk mund te ngarkohen postimet. Kontrolloni lidhjen me internetin.");
  }
};

// Admin: real-time listener for pending posts count
export const onPendingCount = (callback) => {
  const q = query(
    collection(db, "posts_private"),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => callback(snap.size));
};

// ═══════════════════════════════════════════════════════════════════════
// UPDATE POST — owner edits their own post (resets to pending)
// Uses transaction to prevent race conditions on ownership check
// ═══════════════════════════════════════════════════════════════════════
export const updatePost = async (postId, payload) => {
  const canManagePremium = await isCurrentUserAdmin();
  const premiumUpdate =
    canManagePremium && Object.prototype.hasOwnProperty.call(payload, "isPremium")
      ? resolvePremiumPayload(payload)
      : null;
  const ownerUid = auth.currentUser?.uid;
  if (!ownerUid) throw new Error("Duhet te jesh i kyçur.");

  const images = Array.isArray(payload.images)
    ? payload.images.filter(Boolean).slice(0, 10)
    : [payload.image];

  const postRef = doc(db, "posts_private", postId);

  const wasActive = await runTransaction(db, async (tx) => {
    const postSnap = await tx.get(postRef);
    if (!postSnap.exists()) throw new Error("Posti nuk u gjet.");

    const postData = postSnap.data();
    if (postData.ownerUid !== ownerUid) throw new Error("Nuk keni leje ta editoni kete post.");

    tx.update(postRef, {
      title: (payload.title || "").trim(),
      description: (payload.description || "").trim(),
      location: (payload.location || "").trim(),
      category: (payload.category || "Villa").trim(),
      image: images[0] || "",
      images,
      price: Number(payload.price) || 0,
      rooms: Number(payload.rooms) || 0,
      beds: Number(payload.beds) || 0,
      baths: Number(payload.baths) || 0,
      guests: Number(payload.guests) || Math.max(1, (Number(payload.beds) || 1) * 2),
      whatsapp: (payload.whatsapp || "").replace(/[^\d+]/g, ""),
      features: Array.isArray(payload.features) ? payload.features : [],
      companyName: (payload.companyName || "").trim(),
      lat: payload.lat || null,
      lng: payload.lng || null,
      address: (payload.address || "").trim(),
      city: (payload.city || "").trim(),
      country: (payload.country || "").trim(),
      status: "pending",
      statusBadge: "Wait to confirm",
      sortOrder: null,
      ...(premiumUpdate || {}),
      updatedAt: serverTimestamp(),
      approvedAt: null,
      approvedBy: null,
    });

    return postData.status === "active";
  });

  // If it was active, remove from posts_public (needs re-approval)
  if (wasActive) {
    await deleteDoc(doc(db, "posts_public", postId));
  }

  return { success: true, status: "pending" };
};

// ═══════════════════════════════════════════════════════════════════════
// DELETE POST — owner deletes their own post
// ═══════════════════════════════════════════════════════════════════════
export const updatePostPremium = async (postId, payload) => {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) throw new Error("Vetem admini mund te menaxhoje premium.");

  const premiumUpdate = resolvePremiumPayload(payload);
  const postRef = doc(db, "posts_private", postId);
  const publicRef = doc(db, "posts_public", postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error("Posti nuk u gjet.");
  }

  const postData = postSnap.data();

  await updateDoc(postRef, {
    ...premiumUpdate,
    updatedAt: serverTimestamp(),
  });

  if (postData.status === "active") {
    const publicSnap = await getDoc(publicRef);
    if (publicSnap.exists()) {
      await updateDoc(publicRef, premiumUpdate);
    }
  }

  return premiumUpdate;
};

export const deletePost = async (postId) => {
  const ownerUid = auth.currentUser?.uid;
  if (!ownerUid) throw new Error("Duhet te jesh i kyçur.");

  const postRef = doc(db, "posts_private", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) throw new Error("Posti nuk u gjet.");

  const postData = postSnap.data();
  if (postData.ownerUid !== ownerUid) throw new Error("Nuk keni leje ta fshini kete post.");

  // Delete from posts_public if it was active
  if (postData.status === "active") {
    await deleteDoc(doc(db, "posts_public", postId));
  }

  // Delete from posts_private
  await deleteDoc(postRef);

  return { success: true };
};

// ═══════════════════════════════════════════════════════════════════════
// ADMIN DELETE POST — routed through Cloud Function for server-side
// verification and atomic cleanup of both collections
// ═══════════════════════════════════════════════════════════════════════
export const adminDeletePost = async (postId) => {
  const callAdminDelete = httpsCallable(functions, "adminDeletePostFn");
  const result = await callAdminDelete({ postId });
  return result.data;
};

// ─── Get single post by ID (for edit page) ──────────────────────────
export const getPostById = async (postId) => {
  try {
    const postRef = doc(db, "posts_private", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return null;
    return toPost(postSnap);
  } catch (error) {
    console.error("Gabim ne ngarkimin e postit:", error);
    throw new Error("Nuk mund te ngarkohet postimi. Kontrolloni lidhjen me internetin.");
  }
};

// Admin: read active posts sorted by sortOrder (for drag-and-drop)
export const listActivePostsSorted = async () => {
  try {
    const q = query(
      collection(db, "posts_private"),
      where("status", "==", "active")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(toPost)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (error) {
    console.error("Gabim ne ngarkimin e posteve aktive:", error);
    throw new Error("Nuk mund te ngarkohen postimet aktive. Kontrolloni lidhjen me internetin.");
  }
};
