import { getAuth } from "firebase-admin/auth";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";

type PaidPlanId = "premium" | "business-pro";
type PaidPlanTargetKind = "listing" | "business";
type PaymentMethod = "bank" | "crypto";
type PaidPlanRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled";
type ReviewAction = "approve" | "reject" | "mark_expired" | "note";
type ManageAction = "extend" | "renew" | "deactivate";

type CreatePaidPlanRequestPayload = {
  submissionId?: unknown;
  customerName?: unknown;
  email?: unknown;
  phone?: unknown;
  planId?: unknown;
  paymentMethod?: unknown;
  paymentReference?: unknown;
  transactionId?: unknown;
  notes?: unknown;
  proofStoragePath?: unknown;
  proofFileName?: unknown;
  proofOriginalName?: unknown;
  proofContentType?: unknown;
  proofSize?: unknown;
  businessName?: unknown;
  listingId?: unknown;
};

type ReviewPaidPlanRequestPayload = {
  requestId?: unknown;
  action?: unknown;
  adminNote?: unknown;
  rejectionReason?: unknown;
  premiumOrder?: unknown;
  durationDays?: unknown;
};

type ManagePaidPlanRequestPayload = {
  requestId?: unknown;
  action?: unknown;
  adminNote?: unknown;
  durationDays?: unknown;
  premiumOrder?: unknown;
};

type PlanMeta = {
  id: PaidPlanId;
  label: string;
  amount: number;
  durationDays: number;
  durationLabel: string;
  targetKind: PaidPlanTargetKind;
  analyticsTier: "basic" | "advanced";
};

type RequestRecord = {
  id: string;
  userId: string;
  planId: PaidPlanId;
  paymentStatus: PaidPlanRequestStatus;
  durationDays: number;
  listingId: string;
  businessName: string;
  paymentReference: string;
  paymentMethod: PaymentMethod;
  premiumOrder: number | null;
  startsAt: Timestamp | null;
  expiresAt: Timestamp | null;
  activatedAt: Timestamp | null;
  createdAt: Timestamp | null;
};

const PLAN_META: Record<PaidPlanId, PlanMeta> = {
  premium: {
    id: "premium",
    label: "Premium",
    amount: 15,
    durationDays: 30,
    durationLabel: "30 dite",
    targetKind: "listing",
    analyticsTier: "basic",
  },
  "business-pro": {
    id: "business-pro",
    label: "Business Pro",
    amount: 90,
    durationDays: 90,
    durationLabel: "3 muaj",
    targetKind: "business",
    analyticsTier: "advanced",
  },
};

const PAID_PLAN_IDS: PaidPlanId[] = ["premium", "business-pro"];
const REQUEST_STATUSES: PaidPlanRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
  "expired",
  "cancelled",
];
const PAYMENT_METHODS: PaymentMethod[] = ["bank", "crypto"];
const REVIEW_ACTIONS: ReviewAction[] = [
  "approve",
  "reject",
  "mark_expired",
  "note",
];
const MANAGE_ACTIONS: ManageAction[] = ["extend", "renew", "deactivate"];

function getDb() {
  return getFirestore();
}

function getAdminAuth() {
  return getAuth();
}

function sanitizeString(value: unknown, fallback = "", max = 240): string {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, max);
}

function sanitizeOptionalString(value: unknown, max = 240): string {
  return sanitizeString(value, "", max);
}

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isPaidPlanId(value: unknown): value is PaidPlanId {
  return typeof value === "string" && PAID_PLAN_IDS.includes(value as PaidPlanId);
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && PAYMENT_METHODS.includes(value as PaymentMethod);
}

function isRequestStatus(value: unknown): value is PaidPlanRequestStatus {
  return typeof value === "string" && REQUEST_STATUSES.includes(value as PaidPlanRequestStatus);
}

function isReviewAction(value: unknown): value is ReviewAction {
  return typeof value === "string" && REVIEW_ACTIONS.includes(value as ReviewAction);
}

function isManageAction(value: unknown): value is ManageAction {
  return typeof value === "string" && MANAGE_ACTIONS.includes(value as ManageAction);
}

function timestampOrNull(value: unknown): Timestamp | null {
  return value instanceof Timestamp ? value : null;
}

function timestampToIso(value: Timestamp | null): string | null {
  return value ? value.toDate().toISOString() : null;
}

function resolveAnalyticsTier(planId: PaidPlanId | "free", isActive: boolean) {
  if (!isActive) return "locked";
  if (planId === "business-pro") return "advanced";
  if (planId === "premium") return "basic";
  return "locked";
}

function normalizeRequestRecord(id: string, source: FirebaseFirestore.DocumentData): RequestRecord {
  return {
    id,
    userId: sanitizeString(source.userId, "", 128),
    planId: isPaidPlanId(source.planId) ? source.planId : "premium",
    paymentStatus: isRequestStatus(source.paymentStatus) ? source.paymentStatus : "pending",
    durationDays: parsePositiveInt(source.durationDays) || PLAN_META.premium.durationDays,
    listingId: sanitizeString(source.listingId, "", 128),
    businessName: sanitizeString(source.businessName, "", 180),
    paymentReference: sanitizeString(source.paymentReference, "", 120),
    paymentMethod: isPaymentMethod(source.paymentMethod) ? source.paymentMethod : "bank",
    premiumOrder: parsePositiveInt(source.premiumOrder),
    startsAt: timestampOrNull(source.startsAt),
    expiresAt: timestampOrNull(source.expiresAt),
    activatedAt: timestampOrNull(source.activatedAt),
    createdAt: timestampOrNull(source.createdAt),
  };
}

function isApprovedAndActive(record: RequestRecord, now: Timestamp): boolean {
  return (
    record.paymentStatus === "approved"
    && record.expiresAt instanceof Timestamp
    && record.expiresAt.toMillis() > now.toMillis()
  );
}

function inferListingExperience(category: string): "villas" | "apartments" {
  const normalized = category.trim().toLowerCase();
  return normalized.includes("apart") ? "apartments" : "villas";
}

async function hasAdminAccess(uid: string): Promise<boolean> {
  const adminAuth = getAdminAuth();
  const user = await adminAuth.getUser(uid);
  if (user.customClaims?.admin) return true;

  const userDoc = await getDb().doc(`users/${uid}`).get();
  return userDoc.exists && userDoc.data()?.role === "admin";
}

async function verifyAdmin(uid: string): Promise<void> {
  if (await hasAdminAccess(uid)) return;

  throw new functions.https.HttpsError(
    "permission-denied",
    "Vetem adminet mund ta bejne kete veprim."
  );
}

async function loadUserSummary(userId: string) {
  const authUser = await getAdminAuth().getUser(userId);
  const userDoc = await getDb().doc(`users/${userId}`).get();
  const userData = userDoc.exists ? userDoc.data() || {} : {};

  return {
    userName: sanitizeString(
      userData.name || authUser.displayName || authUser.email?.split("@")[0] || "Perdorues",
      "Perdorues",
      160
    ),
    userEmail: sanitizeString(userData.email || authUser.email || "", "", 180),
    userPhone: sanitizeString(userData.phone || "", "", 48),
  };
}

async function resolveListingForRequest(listingId: string, ownerUserId: string) {
  const db = getDb();
  const [privateSnap, publicSnap] = await Promise.all([
    db.doc(`posts_private/${listingId}`).get(),
    db.doc(`posts_public/${listingId}`).get(),
  ]);

  const snap = privateSnap.exists ? privateSnap : publicSnap;
  if (!snap.exists) {
    throw new functions.https.HttpsError("not-found", "Listimi i zgjedhur nuk u gjet.");
  }

  const data = snap.data() || {};
  const listingOwnerId = sanitizeString(data.ownerUid || data.createdByUid, "", 128);
  if (!listingOwnerId || listingOwnerId !== ownerUserId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Listimi nuk i perket ketij perdoruesi."
    );
  }

  return {
    listingId,
    listingTitle: sanitizeString(data.title, "Listim", 180),
    listingLocation: sanitizeString(data.location, "", 160),
    listingCategory: sanitizeString(data.category, "", 80),
    listingExperience: inferListingExperience(sanitizeString(data.category, "Villa", 80)),
    listingIdNumber: parsePositiveInt(data.idNumber),
    listingStatus: sanitizeString(data.status, "", 40),
  };
}

async function addNotification(
  batch: FirebaseFirestore.WriteBatch,
  payload: {
    audience: "admin" | "user";
    recipientUserId: string;
    type: string;
    title: string;
    message: string;
    requestId: string;
    planId: PaidPlanId;
    listingId?: string;
  }
) {
  const notificationRef = getDb().collection("notifications").doc();
  batch.set(notificationRef, {
    notificationId: notificationRef.id,
    audience: payload.audience,
    recipientUserId: payload.recipientUserId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    requestId: payload.requestId,
    planId: payload.planId,
    listingId: sanitizeString(payload.listingId, "", 128),
    status: "unread",
    createdAt: Timestamp.now(),
    readAt: null,
  });
}

async function addAuditLog(
  batch: FirebaseFirestore.WriteBatch,
  payload: {
    requestId: string;
    userId: string;
    planId: PaidPlanId;
    actionType: string;
    actionBy: string;
    adminNote: string;
    previousStatus: string;
    nextStatus: string;
  }
) {
  const auditRef = getDb().collection("paid_plan_audits").doc();
  batch.set(auditRef, {
    auditId: auditRef.id,
    requestId: payload.requestId,
    userId: payload.userId,
    planId: payload.planId,
    actionType: payload.actionType,
    actionBy: payload.actionBy,
    adminNote: payload.adminNote,
    previousStatus: payload.previousStatus,
    nextStatus: payload.nextStatus,
    actionDate: Timestamp.now(),
  });
}

async function syncUserSubscriptionFromRequests(userId: string, actorUid: string) {
  const db = getDb();
  const now = Timestamp.now();
  const snapshot = await db
    .collection("payment_submissions")
    .where("userId", "==", userId)
    .where("paymentStatus", "==", "approved")
    .get();

  const activeRecords = snapshot.docs
    .map((docSnap) => normalizeRequestRecord(docSnap.id, docSnap.data()))
    .filter((record) => isApprovedAndActive(record, now));

  const activeBusiness = activeRecords
    .filter((record) => record.planId === "business-pro")
    .sort((a, b) => (b.expiresAt?.toMillis() || 0) - (a.expiresAt?.toMillis() || 0))[0];

  const activePremium = activeRecords
    .filter((record) => record.planId === "premium")
    .sort((a, b) => (b.expiresAt?.toMillis() || 0) - (a.expiresAt?.toMillis() || 0))[0];

  const winner = activeBusiness || activePremium || null;
  const subscriptionRef = db.doc(`user_subscriptions/${userId}`);
  const existingSnap = await subscriptionRef.get();
  const createdAt =
    existingSnap.exists && existingSnap.data()?.createdAt instanceof Timestamp
      ? existingSnap.data()?.createdAt
      : now;

  if (!winner) {
    await subscriptionRef.set(
      {
        userId,
        planId: "free",
        status: "inactive",
        analyticsTier: "locked",
        source: "paid_plan_request",
        paymentReference: "",
        paymentMethod: "",
        durationDays: null,
        startedAt: null,
        expiresAt: null,
        activatedAt: null,
        requestId: "",
        listingId: "",
        listingTitle: "",
        businessName: "",
        activatedBy: actorUid,
        updatedAt: now,
        createdAt,
      },
      { merge: true }
    );
    return;
  }

  const winnerDoc = snapshot.docs.find((docSnap) => docSnap.id === winner.id);
  const winnerData = winnerDoc?.data() || {};

  await subscriptionRef.set(
    {
      userId,
      planId: winner.planId,
      status: "active",
      analyticsTier: resolveAnalyticsTier(winner.planId, true),
      source: "paid_plan_request",
      paymentReference: winner.paymentReference,
      paymentMethod: winner.paymentMethod,
      durationDays: winner.durationDays,
      startedAt: winner.startsAt,
      expiresAt: winner.expiresAt,
      activatedAt: winner.activatedAt || winner.startsAt || now,
      requestId: winner.id,
      listingId: winner.listingId,
      listingTitle: sanitizeString(winnerData.listingTitle, "", 180),
      businessName: sanitizeString(winnerData.businessName, "", 180),
      activatedBy: actorUid,
      updatedAt: now,
      createdAt,
    },
    { merge: true }
  );
}

async function syncListingPremiumFromRequests(listingId: string, actorUid: string) {
  if (!listingId) return;

  const db = getDb();
  const now = Timestamp.now();
  const snapshot = await db
    .collection("payment_submissions")
    .where("listingId", "==", listingId)
    .where("planId", "==", "premium")
    .get();

  const records = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const normalized = normalizeRequestRecord(docSnap.id, data);
    return {
      ...normalized,
      listingTitle: sanitizeString(data.listingTitle, "", 180),
      paymentStatus: isRequestStatus(data.paymentStatus) ? data.paymentStatus : "pending",
      actionDate: timestampOrNull(data.actionDate),
      updatedAt: timestampOrNull(data.updatedAt),
      rejectionReason: sanitizeString(data.rejectionReason, "", 600),
    };
  });

  const activeApproved = records
    .filter((record) => isApprovedAndActive(record, now))
    .sort((a, b) => {
      const aExpires = a.expiresAt?.toMillis() || 0;
      const bExpires = b.expiresAt?.toMillis() || 0;
      if (aExpires !== bExpires) return bExpires - aExpires;
      return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
    })[0];

  const latestPending = records
    .filter((record) => record.paymentStatus === "pending")
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))[0];

  const latestResolved = records
    .filter((record) => record.paymentStatus !== "approved" && record.paymentStatus !== "pending")
    .sort((a, b) => {
      const aTime = a.actionDate?.toMillis() || a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
      const bTime = b.actionDate?.toMillis() || b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    })[0];

  const privateRef = db.doc(`posts_private/${listingId}`);
  const publicRef = db.doc(`posts_public/${listingId}`);
  const [privateSnap, publicSnap] = await Promise.all([privateRef.get(), publicRef.get()]);

  if (!privateSnap.exists && !publicSnap.exists) {
    return;
  }

  let nextStatus = "none";
  let nextPayload: Record<string, unknown> = {
    isPremium: false,
    premiumStatus: "none",
    premiumPlanId: "",
    premiumRequestId: "",
    premiumOrder: null,
    premiumDays: null,
    premiumStartedAt: null,
    premiumExpiresAt: null,
    premiumApprovedAt: null,
    premiumApprovedBy: null,
    premiumRejectedAt: null,
    premiumRejectedReason: "",
    updatedAt: now,
  };

  if (activeApproved) {
    nextStatus = "active";
    nextPayload = {
      ...nextPayload,
      isPremium: true,
      premiumStatus: "active",
      premiumPlanId: "premium",
      premiumRequestId: activeApproved.id,
      premiumOrder: activeApproved.premiumOrder,
      premiumDays: activeApproved.durationDays,
      premiumStartedAt: timestampToIso(activeApproved.startsAt),
      premiumExpiresAt: timestampToIso(activeApproved.expiresAt),
      premiumApprovedAt: timestampToIso(activeApproved.activatedAt || activeApproved.startsAt),
      premiumApprovedBy: actorUid,
      premiumRejectedAt: null,
      premiumRejectedReason: "",
      updatedAt: now,
    };
  } else if (latestPending) {
    nextStatus = "pending";
    nextPayload = {
      ...nextPayload,
      premiumStatus: "pending",
      premiumPlanId: "premium",
      premiumRequestId: latestPending.id,
      updatedAt: now,
    };
  } else if (latestResolved) {
    nextStatus = latestResolved.paymentStatus;
    nextPayload = {
      ...nextPayload,
      premiumStatus: latestResolved.paymentStatus,
      premiumPlanId: "premium",
      premiumRequestId: latestResolved.id,
      premiumRejectedAt:
        latestResolved.paymentStatus === "rejected"
          ? timestampToIso(latestResolved.actionDate || latestResolved.updatedAt || latestResolved.createdAt)
          : null,
      premiumRejectedReason:
        latestResolved.paymentStatus === "rejected"
          ? latestResolved.rejectionReason
          : "",
      updatedAt: now,
    };
  }

  if (privateSnap.exists) {
    await privateRef.set(nextPayload, { merge: true });
  }

  if (publicSnap.exists) {
    await publicRef.set(
      {
        isPremium: Boolean(nextPayload.isPremium),
        premiumStatus: nextStatus,
        premiumPlanId: nextPayload.premiumPlanId || "",
        premiumRequestId: nextPayload.premiumRequestId || "",
        premiumOrder: nextPayload.premiumOrder ?? null,
        premiumDays: nextPayload.premiumDays ?? null,
        premiumStartedAt: nextPayload.premiumStartedAt ?? null,
        premiumExpiresAt: nextPayload.premiumExpiresAt ?? null,
        updatedAt: now,
      },
      { merge: true }
    );
  }
}

async function resolveNextPremiumOrder(experience: "villas" | "apartments", currentRequestId: string) {
  const db = getDb();
  const snapshot = await db
    .collection("payment_submissions")
    .where("planId", "==", "premium")
    .where("paymentStatus", "==", "approved")
    .get();

  const orders = snapshot.docs
    .filter((docSnap) => docSnap.id !== currentRequestId)
    .map((docSnap) => docSnap.data())
    .filter((data) => sanitizeString(data.listingExperience, "", 24) === experience)
    .map((data) => parsePositiveInt(data.premiumOrder))
    .filter((value): value is number => typeof value === "number")
    .sort((a, b) => a - b);

  let next = 1;
  for (const current of orders) {
    if (current === next) {
      next += 1;
      continue;
    }
    if (current > next) break;
  }

  return next;
}

export const createPaidPlanRequest = functions.https.onCall(
  async (rawData: CreatePaidPlanRequestPayload, context) => {
    const callerUid = context.auth?.uid;
    if (!callerUid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Duhet te jesh i kycur per te derguar kerkesen."
      );
    }

    const submissionId = sanitizeString(rawData?.submissionId, "", 128);
    const planId = rawData?.planId;
    const paymentMethod = rawData?.paymentMethod;

    if (!submissionId) {
      throw new functions.https.HttpsError("invalid-argument", "Mungon submissionId.");
    }

    if (!isPaidPlanId(planId)) {
      throw new functions.https.HttpsError("invalid-argument", "Plani nuk eshte i vlefshem.");
    }

    if (!isPaymentMethod(paymentMethod)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Metoda e pageses nuk eshte e vlefshme."
      );
    }

    const proofStoragePath = sanitizeString(rawData?.proofStoragePath, "", 500);
    if (!proofStoragePath || !proofStoragePath.startsWith(`payment-proofs/${callerUid}/${submissionId}/`)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Path i deshmise se pageses nuk eshte i vlefshem."
      );
    }

    const customerName = sanitizeString(rawData?.customerName, "", 120);
    const email = sanitizeString(rawData?.email, "", 180);
    const phone = sanitizeString(rawData?.phone, "", 48);
    const paymentReference = sanitizeString(rawData?.paymentReference, "", 120);
    const transactionId = sanitizeOptionalString(rawData?.transactionId, 120);
    const notes = sanitizeOptionalString(rawData?.notes, 1200);
    const businessName = sanitizeOptionalString(rawData?.businessName, 180);
    const proofFileName = sanitizeString(rawData?.proofFileName, "", 180);
    const proofOriginalName = sanitizeString(rawData?.proofOriginalName, "", 240);
    const proofContentType = sanitizeString(rawData?.proofContentType, "", 120);
    const proofSize = parsePositiveInt(rawData?.proofSize);
    const listingId = sanitizeOptionalString(rawData?.listingId, 128);

    if (!customerName || !email || !phone || !paymentReference || !proofFileName || !proofOriginalName || !proofContentType || !proofSize) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Mungojne te dhenat kryesore te kerkeses."
      );
    }

    const db = getDb();
    const requestRef = db.doc(`payment_submissions/${submissionId}`);
    const existingSnap = await requestRef.get();
    if (existingSnap.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        "Ekziston tashme nje kerkese me kete reference."
      );
    }

    const planMeta = PLAN_META[planId];
    const userSummary = await loadUserSummary(callerUid);
    const now = Timestamp.now();

    let listingSummary = {
      listingId: "",
      listingTitle: "",
      listingLocation: "",
      listingCategory: "",
      listingExperience: "",
      listingIdNumber: null as number | null,
      listingStatus: "",
    };

    if (planMeta.targetKind === "listing") {
      if (!listingId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Plani Premium kerkon nje listim te zgjedhur."
        );
      }
      listingSummary = await resolveListingForRequest(listingId, callerUid);
    }

    const batch = db.batch();

    batch.set(requestRef, {
      requestId: submissionId,
      userId: callerUid,
      userName: userSummary.userName,
      userEmail: userSummary.userEmail,
      userPhone: userSummary.userPhone,
      customerName,
      email,
      phone,
      planId,
      planLabel: planMeta.label,
      paymentMethod,
      paymentReference,
      transactionId,
      notes,
      targetKind: planMeta.targetKind,
      listingId: listingSummary.listingId,
      listingTitle: listingSummary.listingTitle,
      listingLocation: listingSummary.listingLocation,
      listingCategory: listingSummary.listingCategory,
      listingExperience: listingSummary.listingExperience,
      listingIdNumber: listingSummary.listingIdNumber,
      businessName: planMeta.targetKind === "business" ? businessName || customerName : "",
      priceAmount: planMeta.amount,
      currency: "EUR",
      durationDays: planMeta.durationDays,
      durationLabel: planMeta.durationLabel,
      paymentStatus: "pending",
      source: "pricing_section",
      proofStoragePath,
      proofFileName,
      proofOriginalName,
      proofContentType,
      proofSize,
      adminNote: "",
      rejectionReason: "",
      premiumOrder: null,
      createdAt: now,
      submittedAt: now,
      updatedAt: now,
      actionBy: callerUid,
      actionType: "submitted",
      actionDate: now,
      activatedAt: null,
      startsAt: null,
      expiresAt: null,
    });

    await addAuditLog(batch, {
      requestId: submissionId,
      userId: callerUid,
      planId,
      actionType: "submitted",
      actionBy: callerUid,
      adminNote: "",
      previousStatus: "draft",
      nextStatus: "pending",
    });

    await addNotification(batch, {
      audience: "admin",
      recipientUserId: "",
      type: "paid_plan_request_created",
      title: "Kerkese e re per plan me pagese",
      message:
        planMeta.targetKind === "listing"
          ? `${userSummary.userName} dergoi kerkese ${planMeta.label} per listimin ${listingSummary.listingTitle || "e zgjedhur"}.`
          : `${userSummary.userName} dergoi kerkese ${planMeta.label} per profil biznesi.`,
      requestId: submissionId,
      planId,
      listingId: listingSummary.listingId,
    });

    await batch.commit();

    if (listingSummary.listingId) {
      await syncListingPremiumFromRequests(listingSummary.listingId, callerUid);
    }

    return {
      success: true,
      submissionId,
      paymentReference,
      paymentStatus: "pending",
    };
  }
);

export const reviewPaidPlanRequest = functions.https.onCall(
  async (rawData: ReviewPaidPlanRequestPayload, context) => {
    const callerUid = context.auth?.uid;
    if (!callerUid) {
      throw new functions.https.HttpsError("unauthenticated", "Duhet te jesh i kycur.");
    }

    await verifyAdmin(callerUid);

    const requestId = sanitizeString(rawData?.requestId, "", 128);
    const action = rawData?.action;

    if (!requestId) {
      throw new functions.https.HttpsError("invalid-argument", "Mungon requestId.");
    }

    if (!isReviewAction(action)) {
      throw new functions.https.HttpsError("invalid-argument", "Veprimi nuk eshte i vlefshem.");
    }

    const db = getDb();
    const requestRef = db.doc(`payment_submissions/${requestId}`);
    const requestSnap = await requestRef.get();
    if (!requestSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Kerkesa nuk u gjet.");
    }

    const requestData = requestSnap.data() || {};
    const request = normalizeRequestRecord(requestSnap.id, requestData);
    const adminNote = sanitizeOptionalString(rawData?.adminNote, 1200);
    const rejectionReason = sanitizeOptionalString(rawData?.rejectionReason, 900);
    const now = Timestamp.now();

    if (action === "approve" && request.paymentStatus !== "pending") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Vetem kerkesat ne pritje mund te aprovohen."
      );
    }

    if (action === "reject" && request.paymentStatus !== "pending") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Vetem kerkesat ne pritje mund te refuzohen."
      );
    }

    const nextDurationDays =
      parsePositiveInt(rawData?.durationDays) || request.durationDays || PLAN_META[request.planId].durationDays;
    const nextPremiumOrderRaw = parsePositiveInt(rawData?.premiumOrder);
    let nextPremiumOrder = request.premiumOrder;

    if (action === "approve" && request.planId === "premium") {
      const listingExperience = sanitizeString(requestData.listingExperience, "villas", 24) as "villas" | "apartments";
      nextPremiumOrder =
        nextPremiumOrderRaw
        || request.premiumOrder
        || await resolveNextPremiumOrder(listingExperience, request.id);
    }

    const batch = db.batch();
    const nextStatus =
      action === "approve"
        ? "approved"
        : action === "reject"
        ? "rejected"
        : action === "mark_expired"
        ? "expired"
        : request.paymentStatus;

    const nextUpdate: Record<string, unknown> = {
      updatedAt: now,
      actionBy: callerUid,
      actionType:
        action === "approve"
          ? "approved"
          : action === "reject"
          ? "rejected"
          : action === "mark_expired"
          ? "expired"
          : "note",
      actionDate: now,
      adminNote,
    };

    if (action === "approve") {
      const startsAt = now;
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + nextDurationDays * 24 * 60 * 60 * 1000
      );
      Object.assign(nextUpdate, {
        paymentStatus: "approved",
        activatedAt: now,
        startsAt,
        expiresAt,
        durationDays: nextDurationDays,
        durationLabel: `${nextDurationDays} dite`,
        premiumOrder: nextPremiumOrder ?? null,
        rejectionReason: "",
      });
    }

    if (action === "reject") {
      Object.assign(nextUpdate, {
        paymentStatus: "rejected",
        rejectionReason: rejectionReason || "Pagesa nuk u verifikua.",
      });
    }

    if (action === "mark_expired") {
      Object.assign(nextUpdate, {
        paymentStatus: "expired",
      });
    }

    batch.set(requestRef, nextUpdate, { merge: true });

    await addAuditLog(batch, {
      requestId: request.id,
      userId: request.userId,
      planId: request.planId,
      actionType: String(nextUpdate.actionType || action),
      actionBy: callerUid,
      adminNote: adminNote || rejectionReason,
      previousStatus: request.paymentStatus,
      nextStatus,
    });

    if (action === "approve") {
      await addNotification(batch, {
        audience: "user",
        recipientUserId: request.userId,
        type: "paid_plan_request_approved",
        title: "Plani u aprovua",
        message: `Kerkesa juaj per ${PLAN_META[request.planId].label} u aprovua dhe plani u aktivizua.`,
        requestId: request.id,
        planId: request.planId,
        listingId: request.listingId,
      });
    }

    if (action === "reject") {
      await addNotification(batch, {
        audience: "user",
        recipientUserId: request.userId,
        type: "paid_plan_request_rejected",
        title: "Kerkesa u refuzua",
        message: rejectionReason || "Kerkesa juaj u refuzua pas verifikimit te pageses.",
        requestId: request.id,
        planId: request.planId,
        listingId: request.listingId,
      });
    }

    if (action === "mark_expired") {
      await addNotification(batch, {
        audience: "user",
        recipientUserId: request.userId,
        type: "paid_plan_request_expired",
        title: "Plani ka skaduar",
        message: `Plani ${PLAN_META[request.planId].label} ka skaduar.`,
        requestId: request.id,
        planId: request.planId,
        listingId: request.listingId,
      });
    }

    await batch.commit();
    await syncUserSubscriptionFromRequests(request.userId, callerUid);
    if (request.listingId) {
      await syncListingPremiumFromRequests(request.listingId, callerUid);
    }

    return {
      success: true,
      requestId: request.id,
      paymentStatus: nextStatus,
      premiumOrder: action === "approve" ? nextPremiumOrder : request.premiumOrder,
    };
  }
);

export const managePaidPlanRequest = functions.https.onCall(
  async (rawData: ManagePaidPlanRequestPayload, context) => {
    const callerUid = context.auth?.uid;
    if (!callerUid) {
      throw new functions.https.HttpsError("unauthenticated", "Duhet te jesh i kycur.");
    }

    await verifyAdmin(callerUid);

    const requestId = sanitizeString(rawData?.requestId, "", 128);
    const action = rawData?.action;

    if (!requestId) {
      throw new functions.https.HttpsError("invalid-argument", "Mungon requestId.");
    }

    if (!isManageAction(action)) {
      throw new functions.https.HttpsError("invalid-argument", "Veprimi nuk eshte i vlefshem.");
    }

    const db = getDb();
    const requestRef = db.doc(`payment_submissions/${requestId}`);
    const requestSnap = await requestRef.get();
    if (!requestSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Kerkesa nuk u gjet.");
    }

    const requestData = requestSnap.data() || {};
    const request = normalizeRequestRecord(requestSnap.id, requestData);
    const now = Timestamp.now();
    const adminNote = sanitizeOptionalString(rawData?.adminNote, 1200);
    const requestedDurationDays =
      parsePositiveInt(rawData?.durationDays) || request.durationDays || PLAN_META[request.planId].durationDays;
    const requestedPremiumOrder =
      parsePositiveInt(rawData?.premiumOrder) || request.premiumOrder;

    const batch = db.batch();
    let nextStatus: PaidPlanRequestStatus = request.paymentStatus;
    let actionType: string = action;

    if (action === "extend") {
      if (request.paymentStatus !== "approved") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Vetem planet e aprovuara mund te zgjaten."
        );
      }

      const baseTime = request.expiresAt && request.expiresAt.toMillis() > now.toMillis()
        ? request.expiresAt.toMillis()
        : now.toMillis();
      const nextExpiresAt = Timestamp.fromMillis(
        baseTime + requestedDurationDays * 24 * 60 * 60 * 1000
      );

      batch.set(
        requestRef,
        {
          expiresAt: nextExpiresAt,
          durationDays: requestedDurationDays,
          durationLabel: `${requestedDurationDays} dite`,
          premiumOrder: requestedPremiumOrder ?? null,
          updatedAt: now,
          actionBy: callerUid,
          actionType: "extended",
          actionDate: now,
          adminNote,
        },
        { merge: true }
      );

      nextStatus = "approved";
      actionType = "extended";
    }

    if (action === "renew") {
      const nextExpiresAt = Timestamp.fromMillis(
        now.toMillis() + requestedDurationDays * 24 * 60 * 60 * 1000
      );

      batch.set(
        requestRef,
        {
          paymentStatus: "approved",
          startsAt: now,
          activatedAt: now,
          expiresAt: nextExpiresAt,
          durationDays: requestedDurationDays,
          durationLabel: `${requestedDurationDays} dite`,
          premiumOrder: requestedPremiumOrder ?? null,
          updatedAt: now,
          actionBy: callerUid,
          actionType: "renewed",
          actionDate: now,
          adminNote,
          rejectionReason: "",
        },
        { merge: true }
      );

      nextStatus = "approved";
      actionType = "renewed";
    }

    if (action === "deactivate") {
      batch.set(
        requestRef,
        {
          paymentStatus: "cancelled",
          updatedAt: now,
          actionBy: callerUid,
          actionType: "cancelled",
          actionDate: now,
          adminNote,
        },
        { merge: true }
      );

      nextStatus = "cancelled";
      actionType = "cancelled";
    }

    await addAuditLog(batch, {
      requestId: request.id,
      userId: request.userId,
      planId: request.planId,
      actionType,
      actionBy: callerUid,
      adminNote,
      previousStatus: request.paymentStatus,
      nextStatus,
    });

    await addNotification(batch, {
      audience: "user",
      recipientUserId: request.userId,
      type:
        action === "extend"
          ? "paid_plan_extended"
          : action === "renew"
          ? "paid_plan_renewed"
          : "paid_plan_deactivated",
      title:
        action === "extend"
          ? "Plani u zgjat"
          : action === "renew"
          ? "Plani u rinovua"
          : "Plani u caktivizua",
      message:
        action === "extend"
          ? `Plani ${PLAN_META[request.planId].label} u zgjat me sukses.`
          : action === "renew"
          ? `Plani ${PLAN_META[request.planId].label} u rinovua me sukses.`
          : `Plani ${PLAN_META[request.planId].label} u caktivizua nga administratori.`,
      requestId: request.id,
      planId: request.planId,
      listingId: request.listingId,
    });

    await batch.commit();
    await syncUserSubscriptionFromRequests(request.userId, callerUid);
    if (request.listingId) {
      await syncListingPremiumFromRequests(request.listingId, callerUid);
    }

    return {
      success: true,
      requestId: request.id,
      paymentStatus: nextStatus,
    };
  }
);

export const expirePaidPlanRequests = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("Europe/Budapest")
  .onRun(async () => {
    const db = getDb();
    const now = Timestamp.now();
    const snapshot = await db
      .collection("payment_submissions")
      .where("paymentStatus", "==", "approved")
      .get();

    let processed = 0;
    const affectedUsers = new Set<string>();
    const affectedListings = new Set<string>();

    for (const docSnap of snapshot.docs) {
      const record = normalizeRequestRecord(docSnap.id, docSnap.data());
      if (!record.expiresAt || record.expiresAt.toMillis() > now.toMillis()) {
        continue;
      }

      const batch = db.batch();
      batch.set(
        docSnap.ref,
        {
          paymentStatus: "expired",
          updatedAt: now,
          actionType: "expired",
          actionDate: now,
        },
        { merge: true }
      );

      await addAuditLog(batch, {
        requestId: record.id,
        userId: record.userId,
        planId: record.planId,
        actionType: "expired",
        actionBy: "system",
        adminNote: "Skadim automatik ditor.",
        previousStatus: "approved",
        nextStatus: "expired",
      });

      await addNotification(batch, {
        audience: "user",
        recipientUserId: record.userId,
        type: "paid_plan_request_expired",
        title: "Plani ka skaduar",
        message: `Plani ${PLAN_META[record.planId].label} ka skaduar automatikisht.`,
        requestId: record.id,
        planId: record.planId,
        listingId: record.listingId,
      });

      await batch.commit();
      affectedUsers.add(record.userId);
      if (record.listingId) affectedListings.add(record.listingId);
      processed += 1;
    }

    for (const userId of affectedUsers) {
      await syncUserSubscriptionFromRequests(userId, "system");
    }

    for (const listingId of affectedListings) {
      await syncListingPremiumFromRequests(listingId, "system");
    }

    return { processed };
  });

export const notifyExpiringPaidPlans = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("Europe/Budapest")
  .onRun(async () => {
    const db = getDb();
    const now = Timestamp.now();
    const threshold = Timestamp.fromMillis(now.toMillis() + 3 * 24 * 60 * 60 * 1000);
    const snapshot = await db
      .collection("payment_submissions")
      .where("paymentStatus", "==", "approved")
      .get();

    let notified = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const record = normalizeRequestRecord(docSnap.id, data);
      const expiresAt = record.expiresAt;
      const reminderSentAt = timestampOrNull(data.expiryReminderSentAt);

      if (!expiresAt) continue;
      if (expiresAt.toMillis() <= now.toMillis()) continue;
      if (expiresAt.toMillis() > threshold.toMillis()) continue;
      if (reminderSentAt) continue;

      const batch = db.batch();
      batch.set(
        docSnap.ref,
        {
          expiryReminderSentAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      await addNotification(batch, {
        audience: "user",
        recipientUserId: record.userId,
        type: "paid_plan_expiring_soon",
        title: "Plani skadon se shpejti",
        message: `Plani ${PLAN_META[record.planId].label} skadon brenda 3 diteve.`,
        requestId: record.id,
        planId: record.planId,
        listingId: record.listingId,
      });

      await addNotification(batch, {
        audience: "admin",
        recipientUserId: "",
        type: "paid_plan_expiring_soon_admin",
        title: "Plan qe skadon se shpejti",
        message: `${PLAN_META[record.planId].label} per ${sanitizeString(data.userName, "perdorues", 160)} skadon brenda 3 diteve.`,
        requestId: record.id,
        planId: record.planId,
        listingId: record.listingId,
      });

      await batch.commit();
      notified += 1;
    }

    return { notified };
  });
