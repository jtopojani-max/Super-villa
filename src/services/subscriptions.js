import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.js";

export const PLAN_META = {
  free: {
    id: "free",
    label: "Pa paketë aktive",
    analyticsTier: "locked",
  },
  premium: {
    id: "premium",
    label: "Premium",
    analyticsTier: "basic",
  },
  "business-pro": {
    id: "business-pro",
    label: "Business Pro",
    analyticsTier: "advanced",
  },
};

const normalizeTimestamp = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
};

const isKnownPlan = (value) => value === "premium" || value === "business-pro" || value === "free";
const isKnownStatus = (value) =>
  value === "active" ||
  value === "pending" ||
  value === "expired" ||
  value === "cancelled" ||
  value === "inactive";

const normalizeStatusByExpiry = (status, expiresAt) => {
  if (status !== "active" || !expiresAt) return status;
  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) return status;
  return expiresAtMs <= Date.now() ? "expired" : status;
};

const getTierRank = (analyticsTier) => {
  if (analyticsTier === "advanced") return 2;
  if (analyticsTier === "basic") return 1;
  return 0;
};

const pickBetterSubscription = (primary, fallback) => {
  if (!fallback) return primary;
  if (!primary) return fallback;

  const primaryRank = getTierRank(primary.analyticsTier);
  const fallbackRank = getTierRank(fallback.analyticsTier);

  if (fallbackRank > primaryRank) return fallback;
  if (primaryRank > fallbackRank) return primary;

  const primaryExpiresAt = Date.parse(primary.expiresAt || "");
  const fallbackExpiresAt = Date.parse(fallback.expiresAt || "");

  if (Number.isFinite(primaryExpiresAt) && Number.isFinite(fallbackExpiresAt) && fallbackExpiresAt > primaryExpiresAt) {
    return fallback;
  }

  if (
    (primary.status === "inactive" || primary.status === "expired" || primary.status === "cancelled") &&
    fallback.status !== "inactive"
  ) {
    return fallback;
  }

  return primary;
};

const normalizePaymentStatus = (value) =>
  value === "pending" ||
  value === "approved" ||
  value === "rejected" ||
  value === "expired" ||
  value === "cancelled"
    ? value
    : "pending";

export const resolveAnalyticsTier = (planId, status, expiresAt = null) => {
  if (normalizeStatusByExpiry(status, expiresAt) !== "active") return "locked";
  if (planId === "business-pro") return "advanced";
  if (planId === "premium") return "basic";
  return "locked";
};

export const normalizeSubscription = (snapshotOrData, userId = "") => {
  const raw = typeof snapshotOrData?.data === "function" ? snapshotOrData.data() : snapshotOrData;
  const planId = isKnownPlan(raw?.planId) ? raw.planId : "free";
  const expiresAt = normalizeTimestamp(raw?.expiresAt);
  const status = normalizeStatusByExpiry(isKnownStatus(raw?.status) ? raw.status : "inactive", expiresAt);
  const analyticsTier = resolveAnalyticsTier(planId, status, expiresAt);

  return {
    userId: raw?.userId || userId || "",
    planId,
    status,
    analyticsTier,
    planLabel: PLAN_META[planId]?.label || PLAN_META.free.label,
    startedAt: normalizeTimestamp(raw?.startedAt),
    expiresAt,
    activatedAt: normalizeTimestamp(raw?.activatedAt),
    updatedAt: normalizeTimestamp(raw?.updatedAt),
    createdAt: normalizeTimestamp(raw?.createdAt),
    durationDays: Number(raw?.durationDays) || null,
    paymentReference: raw?.paymentReference || "",
    paymentMethod: raw?.paymentMethod || "",
    source: raw?.source || "",
  };
};

const deriveSubscriptionFromPaidPlans = async (userId) => {
  if (!userId) return null;

  const snapshot = await getDocs(query(collection(db, "payment_submissions"), where("userId", "==", userId)));
  if (snapshot.empty) return null;

  const now = Date.now();
  const requests = snapshot.docs.map((item) => {
    const raw = item.data() || {};
    const planId = isKnownPlan(raw.planId) ? raw.planId : "free";
    const expiresAt = normalizeTimestamp(raw.expiresAt);
    const paymentStatus = normalizePaymentStatus(raw.paymentStatus);

    return {
      planId,
      paymentStatus,
      createdAt: normalizeTimestamp(raw.createdAt),
      updatedAt: normalizeTimestamp(raw.updatedAt),
      startedAt: normalizeTimestamp(raw.startsAt),
      activatedAt: normalizeTimestamp(raw.activatedAt),
      expiresAt,
      paymentReference: raw.paymentReference || "",
      paymentMethod: raw.paymentMethod || "",
      source: raw.source || "payment_submission",
      durationDays: Number(raw.durationDays) || null,
      tierRank: planId === "business-pro" ? 2 : planId === "premium" ? 1 : 0,
      isActive:
        paymentStatus === "approved" &&
        (!expiresAt || !Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) > now),
    };
  });

  const activeRequest = requests
    .filter((request) => request.isActive)
    .sort((left, right) => {
      if (right.tierRank !== left.tierRank) return right.tierRank - left.tierRank;

      const leftExpiresAt = Number.isFinite(Date.parse(left.expiresAt || "")) ? Date.parse(left.expiresAt || "") : 0;
      const rightExpiresAt = Number.isFinite(Date.parse(right.expiresAt || "")) ? Date.parse(right.expiresAt || "") : 0;
      return rightExpiresAt - leftExpiresAt;
    })[0];

  if (activeRequest) {
    return normalizeSubscription(
      {
        userId,
        planId: activeRequest.planId,
        status: "active",
        startedAt: activeRequest.startedAt,
        activatedAt: activeRequest.activatedAt,
        expiresAt: activeRequest.expiresAt,
        updatedAt: activeRequest.updatedAt,
        createdAt: activeRequest.createdAt,
        durationDays: activeRequest.durationDays,
        paymentReference: activeRequest.paymentReference,
        paymentMethod: activeRequest.paymentMethod,
        source: activeRequest.source,
      },
      userId
    );
  }

  const pendingRequest = requests
    .filter((request) => request.paymentStatus === "pending" && request.tierRank > 0)
    .sort(
      (left, right) =>
        Date.parse(right.updatedAt || right.createdAt || "") - Date.parse(left.updatedAt || left.createdAt || "")
    )[0];

  if (!pendingRequest) return null;

  return normalizeSubscription(
    {
      userId,
      planId: pendingRequest.planId,
      status: "pending",
      startedAt: pendingRequest.startedAt,
      activatedAt: pendingRequest.activatedAt,
      expiresAt: pendingRequest.expiresAt,
      updatedAt: pendingRequest.updatedAt,
      createdAt: pendingRequest.createdAt,
      durationDays: pendingRequest.durationDays,
      paymentReference: pendingRequest.paymentReference,
      paymentMethod: pendingRequest.paymentMethod,
      source: pendingRequest.source,
    },
    userId
  );
};

export const getUserSubscription = async (userId) => {
  if (!userId) return normalizeSubscription(null, "");

  const snapshot = await getDoc(doc(db, "user_subscriptions", userId));
  const storedSubscription = snapshot.exists()
    ? normalizeSubscription(snapshot, userId)
    : normalizeSubscription(
        {
          userId,
          planId: "free",
          status: "inactive",
        },
        userId
      );

  try {
    const planDerivedSubscription = await deriveSubscriptionFromPaidPlans(userId);
    return pickBetterSubscription(storedSubscription, planDerivedSubscription);
  } catch (error) {
    console.warn("Failed to derive subscription from paid plan requests:", error);
    return storedSubscription;
  }
};

export const hasBasicAnalyticsAccess = (subscription) =>
  subscription?.analyticsTier === "basic" || subscription?.analyticsTier === "advanced";

export const hasBusinessAnalyticsAccess = (subscription) =>
  subscription?.analyticsTier === "advanced";
