import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref } from "firebase/storage";
import { db, functions, storage } from "../firebase.js";
import { PRICING_PLAN_META } from "../config/pricing.js";

const PLAN_LABELS = {
  premium: "Premium",
  "business-pro": "Business Pro",
};

export const PAID_PLAN_REQUEST_STATUS_META = {
  pending: { label: "Ne pritje", tone: "pending" },
  approved: { label: "Aprovuar", tone: "approved" },
  rejected: { label: "Refuzuar", tone: "rejected" },
  expired: { label: "Skaduar", tone: "expired" },
  cancelled: { label: "Anuluar", tone: "expired" },
};

const normalizeTimestamp = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
};

const normalizePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
};

const normalizeCurrency = (value) => {
  if (typeof value !== "string") return "€";
  const normalized = value.trim();
  if (!normalized || normalized.toLowerCase() === "eur") return "€";
  return normalized;
};

export const normalizePaidPlanRequest = (snapshotOrData) => {
  const raw = typeof snapshotOrData?.data === "function" ? snapshotOrData.data() : snapshotOrData || {};
  const requestId = raw.requestId || snapshotOrData?.id || "";
  const planId = raw.planId === "business-pro" ? "business-pro" : "premium";
  const status = PAID_PLAN_REQUEST_STATUS_META[raw.paymentStatus] ? raw.paymentStatus : "pending";
  const durationDays = normalizePositiveInt(raw.durationDays) || PRICING_PLAN_META[planId]?.durationDays || null;

  return {
    id: requestId,
    requestId,
    userId: raw.userId || "",
    userName: raw.userName || raw.customerName || "",
    userEmail: raw.userEmail || raw.email || "",
    userPhone: raw.userPhone || raw.phone || "",
    customerName: raw.customerName || "",
    email: raw.email || "",
    phone: raw.phone || "",
    planId,
    planLabel: raw.planLabel || PLAN_LABELS[planId],
    paymentStatus: status,
    statusLabel: PAID_PLAN_REQUEST_STATUS_META[status].label,
    statusTone: PAID_PLAN_REQUEST_STATUS_META[status].tone,
    paymentMethod: raw.paymentMethod || "bank",
    paymentReference: raw.paymentReference || "",
    transactionId: raw.transactionId || "",
    notes: raw.notes || "",
    targetKind: raw.targetKind || (planId === "premium" ? "listing" : "business"),
    listingId: raw.listingId || "",
    listingTitle: raw.listingTitle || "",
    listingLocation: raw.listingLocation || "",
    listingCategory: raw.listingCategory || "",
    listingExperience: raw.listingExperience || "",
    listingIdNumber: normalizePositiveInt(raw.listingIdNumber),
    businessName: raw.businessName || "",
    priceAmount: Number(raw.priceAmount) || PRICING_PLAN_META[planId]?.amount || 0,
    currency: normalizeCurrency(raw.currency),
    durationDays,
    durationLabel: raw.durationLabel || (durationDays ? `${durationDays} dite` : ""),
    proofStoragePath: raw.proofStoragePath || "",
    proofFileName: raw.proofFileName || "",
    proofOriginalName: raw.proofOriginalName || "",
    proofContentType: raw.proofContentType || "",
    proofSize: normalizePositiveInt(raw.proofSize),
    adminNote: raw.adminNote || "",
    rejectionReason: raw.rejectionReason || "",
    premiumOrder: normalizePositiveInt(raw.premiumOrder),
    createdAt: normalizeTimestamp(raw.createdAt),
    submittedAt: normalizeTimestamp(raw.submittedAt),
    updatedAt: normalizeTimestamp(raw.updatedAt),
    actionDate: normalizeTimestamp(raw.actionDate),
    actionBy: raw.actionBy || "",
    actionType: raw.actionType || "",
    activatedAt: normalizeTimestamp(raw.activatedAt),
    startsAt: normalizeTimestamp(raw.startsAt),
    expiresAt: normalizeTimestamp(raw.expiresAt),
    expiryReminderSentAt: normalizeTimestamp(raw.expiryReminderSentAt),
  };
};

export const listMyPaidPlanRequests = async (userId) => {
  if (!userId) return [];

  const snapshot = await getDocs(
    query(
      collection(db, "payment_submissions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
  );

  return snapshot.docs.map(normalizePaidPlanRequest);
};

export const listAdminPaidPlanRequests = async () => {
  const snapshot = await getDocs(
    query(collection(db, "payment_submissions"), orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map(normalizePaidPlanRequest);
};

export const listPaidPlanAuditEntries = async (requestId) => {
  if (!requestId) return [];

  const snapshot = await getDocs(
    query(
      collection(db, "paid_plan_audits"),
      where("requestId", "==", requestId),
      orderBy("actionDate", "desc")
    )
  );

  return snapshot.docs.map((docSnap) => {
    const raw = docSnap.data() || {};
    return {
      id: docSnap.id,
      requestId: raw.requestId || requestId,
      actionType: raw.actionType || "",
      actionBy: raw.actionBy || "",
      adminNote: raw.adminNote || "",
      previousStatus: raw.previousStatus || "",
      nextStatus: raw.nextStatus || "",
      actionDate: normalizeTimestamp(raw.actionDate),
    };
  });
};

export const listUserNotifications = async (userId, max = 5) => {
  if (!userId) return [];

  const snapshot = await getDocs(
    query(
      collection(db, "notifications"),
      where("recipientUserId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(max)
    )
  );

  return snapshot.docs.map((docSnap) => {
    const raw = docSnap.data() || {};
    return {
      id: docSnap.id,
      title: raw.title || "",
      message: raw.message || "",
      status: raw.status || "unread",
      type: raw.type || "",
      createdAt: normalizeTimestamp(raw.createdAt),
      requestId: raw.requestId || "",
      planId: raw.planId || "",
      listingId: raw.listingId || "",
    };
  });
};

export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) return;
  await updateDoc(doc(db, "notifications", notificationId), {
    status: "read",
    readAt: new Date(),
  });
};

export const dismissNotification = async (notificationId) => {
  if (!notificationId) return;
  await deleteDoc(doc(db, "notifications", notificationId));
};

export const reviewPaidPlanRequest = async (payload) => {
  const callable = httpsCallable(functions, "reviewPaidPlanRequest");
  const result = await callable(payload);
  return result.data;
};

export const managePaidPlanRequest = async (payload) => {
  const callable = httpsCallable(functions, "managePaidPlanRequest");
  const result = await callable(payload);
  return result.data;
};

export const getPaymentProofDownloadUrl = async (storagePath) => {
  if (!storagePath) return "";
  return getDownloadURL(ref(storage, storagePath));
};
