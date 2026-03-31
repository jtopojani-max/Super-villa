import { doc, getDoc } from "firebase/firestore";
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

export const resolveAnalyticsTier = (planId, status) => {
  if (status !== "active") return "locked";
  if (planId === "business-pro") return "advanced";
  if (planId === "premium") return "basic";
  return "locked";
};

export const normalizeSubscription = (snapshotOrData, userId = "") => {
  const raw = typeof snapshotOrData?.data === "function" ? snapshotOrData.data() : snapshotOrData;
  const planId = isKnownPlan(raw?.planId) ? raw.planId : "free";
  const status = isKnownStatus(raw?.status) ? raw.status : "inactive";
  const analyticsTier = resolveAnalyticsTier(planId, status);

  return {
    userId: raw?.userId || userId || "",
    planId,
    status,
    analyticsTier,
    planLabel: PLAN_META[planId]?.label || PLAN_META.free.label,
    startedAt: normalizeTimestamp(raw?.startedAt),
    expiresAt: normalizeTimestamp(raw?.expiresAt),
    activatedAt: normalizeTimestamp(raw?.activatedAt),
    updatedAt: normalizeTimestamp(raw?.updatedAt),
    createdAt: normalizeTimestamp(raw?.createdAt),
    durationDays: Number(raw?.durationDays) || null,
    paymentReference: raw?.paymentReference || "",
    paymentMethod: raw?.paymentMethod || "",
    source: raw?.source || "",
  };
};

export const getUserSubscription = async (userId) => {
  if (!userId) return normalizeSubscription(null, "");

  const snapshot = await getDoc(doc(db, "user_subscriptions", userId));
  if (!snapshot.exists()) {
    return normalizeSubscription(
      {
        userId,
        planId: "free",
        status: "inactive",
      },
      userId
    );
  }

  return normalizeSubscription(snapshot, userId);
};

export const hasBasicAnalyticsAccess = (subscription) =>
  subscription?.analyticsTier === "basic" || subscription?.analyticsTier === "advanced";

export const hasBusinessAnalyticsAccess = (subscription) =>
  subscription?.analyticsTier === "advanced";
