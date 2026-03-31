import { createHash } from "node:crypto";
import { getAuth } from "firebase-admin/auth";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";

type AnalyticsEventType =
  | "listing_view"
  | "whatsapp_click"
  | "phone_click"
  | "contact_submit";

type AnalyticsPlanId = "free" | "premium" | "business-pro";
type AnalyticsTier = "locked" | "basic" | "advanced";
type SubscriptionStatus = "inactive" | "pending" | "active" | "expired" | "cancelled";

type Metrics = {
  views: number;
  uniqueViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  contactSubmits: number;
  leads: number;
};

type BreakdownMap = Record<string, number>;

type TrackListingEventPayload = {
  listingId?: unknown;
  eventType?: unknown;
  sessionId?: unknown;
  sourcePage?: unknown;
  sourceRoute?: unknown;
  referrer?: unknown;
  utm?: unknown;
  deviceType?: unknown;
};

type UpsertSubscriptionPayload = {
  userId?: unknown;
  planId?: unknown;
  status?: unknown;
  source?: unknown;
  paymentReference?: unknown;
  paymentMethod?: unknown;
  durationDays?: unknown;
};

type SubscriptionRecord = {
  userId: string;
  planId: AnalyticsPlanId;
  status: SubscriptionStatus;
  analyticsTier: AnalyticsTier;
  source: string;
  paymentReference: string;
  paymentMethod: string;
  startedAt: Timestamp | null;
  expiresAt: Timestamp | null;
  activatedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
};

const EVENT_TYPES: AnalyticsEventType[] = [
  "listing_view",
  "whatsapp_click",
  "phone_click",
  "contact_submit",
];

const TOTAL_WINDOWS_MINUTES: Record<AnalyticsEventType, number> = {
  listing_view: 20,
  whatsapp_click: 2,
  phone_click: 2,
  contact_submit: 5,
};

const UNIQUE_WINDOWS_HOURS: Record<AnalyticsEventType, number> = {
  listing_view: 24,
  whatsapp_click: 24,
  phone_click: 24,
  contact_submit: 24,
};

const LEAD_EVENT_TYPES = new Set<AnalyticsEventType>([
  "whatsapp_click",
  "phone_click",
  "contact_submit",
]);

const VALID_PLANS: AnalyticsPlanId[] = ["free", "premium", "business-pro"];
const VALID_STATUSES: SubscriptionStatus[] = [
  "inactive",
  "pending",
  "active",
  "expired",
  "cancelled",
];

const DEFAULT_PLAN_DURATIONS: Record<Exclude<AnalyticsPlanId, "free">, number> = {
  premium: 30,
  "business-pro": 90,
};

function getDb() {
  return getFirestore();
}

function getAdminAuth() {
  return getAuth();
}

function sanitizeString(value: unknown, fallback = "", max = 200): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.slice(0, max);
}

function sanitizeOptionalUrl(value: unknown, max = 300): string {
  const trimmed = sanitizeString(value, "", max);
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return "";
}

function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
  return typeof value === "string" && EVENT_TYPES.includes(value as AnalyticsEventType);
}

function isAnalyticsPlanId(value: unknown): value is AnalyticsPlanId {
  return typeof value === "string" && VALID_PLANS.includes(value as AnalyticsPlanId);
}

function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" && VALID_STATUSES.includes(value as SubscriptionStatus);
}

function resolveAnalyticsTier(planId: AnalyticsPlanId, status: SubscriptionStatus): AnalyticsTier {
  if (status !== "active") return "locked";
  if (planId === "business-pro") return "advanced";
  if (planId === "premium") return "basic";
  return "locked";
}

function resolveDefaultDurationDays(planId: AnalyticsPlanId): number | null {
  if (planId === "free") return null;
  return DEFAULT_PLAN_DURATIONS[planId];
}

function normalizeDeviceType(value: unknown): "mobile" | "tablet" | "desktop" | "unknown" {
  if (value === "mobile" || value === "tablet" || value === "desktop") return value;
  return "unknown";
}

function normalizeUtm(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};

  const sourceValue = value as Record<string, unknown>;
  const normalized: Record<string, string> = {};

  ["source", "medium", "campaign", "term", "content"].forEach((key) => {
    const next = sanitizeString(sourceValue[key], "", 120);
    if (next) normalized[key] = next;
  });

  return normalized;
}

function normalizeBreakdownKey(value: string, fallback = "unknown"): string {
  const normalized = value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return normalized || fallback;
}

function normalizeReferrerDomain(referrer: string): string {
  if (!referrer) return "direct";

  try {
    const url = new URL(referrer);
    return normalizeBreakdownKey(url.hostname || "direct", "direct");
  } catch (_) {
    return normalizeBreakdownKey(referrer, "direct");
  }
}

function normalizeSourcePage(value: string): string {
  return normalizeBreakdownKey(value || "listing_detail", "listing_detail");
}

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function dayKeyFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthKeyFromDate(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function bucketKey(date: Date, minutes: number): string {
  const totalMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const bucketIndex = Math.floor(totalMinutes / minutes);
  return `${dayKeyFromDate(date)}-${String(bucketIndex).padStart(3, "0")}`;
}

function emptyMetrics(): Metrics {
  return {
    views: 0,
    uniqueViews: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    contactSubmits: 0,
    leads: 0,
  };
}

function readMetrics(data: unknown): Metrics {
  if (!data || typeof data !== "object") return emptyMetrics();

  const source = data as Record<string, unknown>;

  return {
    views: Number(source.views) || 0,
    uniqueViews: Number(source.uniqueViews) || 0,
    whatsappClicks: Number(source.whatsappClicks) || 0,
    phoneClicks: Number(source.phoneClicks) || 0,
    contactSubmits: Number(source.contactSubmits) || 0,
    leads: Number(source.leads) || 0,
  };
}

function addMetrics(current: Metrics, delta: Partial<Metrics>): Metrics {
  return {
    views: current.views + (delta.views || 0),
    uniqueViews: current.uniqueViews + (delta.uniqueViews || 0),
    whatsappClicks: current.whatsappClicks + (delta.whatsappClicks || 0),
    phoneClicks: current.phoneClicks + (delta.phoneClicks || 0),
    contactSubmits: current.contactSubmits + (delta.contactSubmits || 0),
    leads: current.leads + (delta.leads || 0),
  };
}

function calculateConversionRate(views: number, leads: number): number {
  if (!views || views <= 0 || !leads) return 0;
  return Number(((leads / views) * 100).toFixed(2));
}

function readBreakdownMap(data: unknown): BreakdownMap {
  if (!data || typeof data !== "object") return {};

  const source = data as Record<string, unknown>;
  return Object.entries(source).reduce<BreakdownMap>((accumulator, [key, value]) => {
    const safeKey = normalizeBreakdownKey(key);
    const numericValue = Number(value) || 0;
    if (safeKey && numericValue > 0) {
      accumulator[safeKey] = numericValue;
    }
    return accumulator;
  }, {});
}

function incrementBreakdownMap(current: BreakdownMap, key: string): BreakdownMap {
  const safeKey = normalizeBreakdownKey(key);
  return {
    ...current,
    [safeKey]: (current[safeKey] || 0) + 1,
  };
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

async function resolveListingOwner(listingId: string): Promise<{
  ownerUserId: string;
  title: string;
  category: string;
  location: string;
  sourceCollection: "posts_public" | "listings";
}> {
  const db = getDb();
  const [publicSnap, legacySnap] = await Promise.all([
    db.doc(`posts_public/${listingId}`).get(),
    db.doc(`listings/${listingId}`).get(),
  ]);

  const snap = publicSnap.exists ? publicSnap : legacySnap;

  if (!snap.exists) {
    throw new functions.https.HttpsError("not-found", "Shpallja nuk u gjet.");
  }

  const data = snap.data() || {};
  const ownerUserId = sanitizeString(
    data.ownerUid || data.createdByUid || data.userId,
    "",
    128
  );

  if (!ownerUserId) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Shpallja nuk ka pronar te vlefshem per analytics."
    );
  }

  return {
    ownerUserId,
    title: sanitizeString(data.title, "Shpallje", 180),
    category: sanitizeString(data.category, "", 80),
    location: sanitizeString(data.location, "", 140),
    sourceCollection: publicSnap.exists ? "posts_public" : "listings",
  };
}

async function resolveSubscription(userId: string): Promise<SubscriptionRecord> {
  const db = getDb();
  const now = Timestamp.now();
  const subscriptionRef = db.doc(`user_subscriptions/${userId}`);
  const subscriptionSnap = await subscriptionRef.get();

  if (!subscriptionSnap.exists) {
    return {
      userId,
      planId: "free",
      status: "inactive",
      analyticsTier: "locked",
      source: "system_default",
      paymentReference: "",
      paymentMethod: "",
      startedAt: null,
      expiresAt: null,
      activatedAt: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  const data = subscriptionSnap.data() || {};
  const planId = isAnalyticsPlanId(data.planId) ? data.planId : "free";
  let status: SubscriptionStatus = isSubscriptionStatus(data.status)
    ? data.status
    : "inactive";

  const expiresAt =
    data.expiresAt instanceof Timestamp ? data.expiresAt : null;

  if (
    status === "active" &&
    expiresAt &&
    expiresAt.toMillis() <= now.toMillis()
  ) {
    status = "expired";
  }

  return {
    userId,
    planId,
    status,
    analyticsTier: resolveAnalyticsTier(planId, status),
    source: sanitizeString(data.source, "manual", 80),
    paymentReference: sanitizeString(data.paymentReference, "", 120),
    paymentMethod: sanitizeString(data.paymentMethod, "", 40),
    startedAt: data.startedAt instanceof Timestamp ? data.startedAt : null,
    expiresAt,
    activatedAt: data.activatedAt instanceof Timestamp ? data.activatedAt : null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : now,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : now,
  };
}

function buildMetricDelta(
  eventType: AnalyticsEventType,
  isUniqueView: boolean
): Metrics {
  const delta = emptyMetrics();

  if (eventType === "listing_view") {
    delta.views = 1;
    delta.uniqueViews = isUniqueView ? 1 : 0;
    return delta;
  }

  if (eventType === "whatsapp_click") {
    delta.whatsappClicks = 1;
    delta.leads = 1;
    return delta;
  }

  if (eventType === "phone_click") {
    delta.phoneClicks = 1;
    delta.leads = 1;
    return delta;
  }

  delta.contactSubmits = 1;
  delta.leads = 1;
  return delta;
}

export const trackListingEvent = functions.https.onCall(
  async (rawData: TrackListingEventPayload, context) => {
    const listingId = sanitizeString(rawData?.listingId, "", 128);
    const eventType = rawData?.eventType;
    const sessionId = sanitizeString(rawData?.sessionId, "", 160);

    if (!listingId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Mungon listingId."
      );
    }

    if (!isAnalyticsEventType(eventType)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "eventType nuk eshte i vlefshem."
      );
    }

    if (!sessionId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Mungon sessionId."
      );
    }

    const viewerUid = context.auth?.uid || "";
    const viewerKey = viewerUid ? `auth:${viewerUid}` : `session:${sessionId}`;
    const viewerKeyHash = hashValue(viewerKey);
    const sessionIdHash = hashValue(`session:${sessionId}`);
    const referrer = sanitizeOptionalUrl(rawData?.referrer, 300);
    const sourcePage = normalizeSourcePage(sanitizeString(rawData?.sourcePage, "listing_detail", 120));
    const sourceRoute = sanitizeString(rawData?.sourceRoute, "", 200);
    const deviceType = normalizeDeviceType(rawData?.deviceType);
    const utm = normalizeUtm(rawData?.utm);
    const referrerDomain = normalizeReferrerDomain(referrer);
    const now = Timestamp.now();
    const nowDate = new Date(now.toMillis());
    const dayKey = dayKeyFromDate(nowDate);
    const monthKey = monthKeyFromDate(nowDate);

    const listing = await resolveListingOwner(listingId);

    if (viewerUid && viewerUid === listing.ownerUserId) {
      return {
        accepted: false,
        duplicate: false,
        ignored: true,
        reason: "owner_event_ignored",
      };
    }

    const subscription = await resolveSubscription(listing.ownerUserId);
    const db = getDb();

    const totalBucket = bucketKey(nowDate, TOTAL_WINDOWS_MINUTES[eventType]);
    const uniqueBucket = bucketKey(nowDate, UNIQUE_WINDOWS_HOURS[eventType] * 60);

    const totalLockId = hashValue(
      `total:${listingId}:${eventType}:${viewerKeyHash}:${totalBucket}`
    );
    const uniqueLockId = hashValue(
      `unique:${listingId}:${eventType}:${viewerKeyHash}:${uniqueBucket}`
    );

    const totalLockRef = db.doc(`analytics_dedupe/${totalLockId}`);
    const uniqueLockRef = db.doc(`analytics_dedupe/${uniqueLockId}`);
    const listingStatsRef = db.doc(`listing_stats/${listingId}`);
    const ownerStatsRef = db.doc(`owner_analytics/${listing.ownerUserId}`);
    const ownerDetailsRef = db.doc(`owner_analytics_details/${listing.ownerUserId}`);
    const dailyStatsRef = db.doc(`listing_daily_stats/${listingId}__${dayKey}`);
    const monthlyStatsRef = db.doc(`listing_monthly_stats/${listingId}__${monthKey}`);
    const eventRef = db.collection("listing_events").doc();
    const leadRef = db.collection("leads").doc();
    const totalExpiry = Timestamp.fromMillis(
      now.toMillis() + TOTAL_WINDOWS_MINUTES[eventType] * 60 * 1000
    );
    const uniqueExpiry = Timestamp.fromMillis(
      now.toMillis() + UNIQUE_WINDOWS_HOURS[eventType] * 60 * 60 * 1000
    );

    const result = await db.runTransaction(async (transaction) => {
      const [
        totalLockSnap,
        uniqueLockSnap,
        listingStatsSnap,
        ownerStatsSnap,
        ownerDetailsSnap,
        dailyStatsSnap,
        monthlyStatsSnap,
      ] = await Promise.all([
        transaction.get(totalLockRef),
        transaction.get(uniqueLockRef),
        transaction.get(listingStatsRef),
        transaction.get(ownerStatsRef),
        transaction.get(ownerDetailsRef),
        transaction.get(dailyStatsRef),
        transaction.get(monthlyStatsRef),
      ]);

      if (totalLockSnap.exists) {
        return {
          accepted: false,
          duplicate: true,
          ignored: false,
          isUnique: false,
          eventId: "",
        };
      }

      const isUnique = !uniqueLockSnap.exists && eventType === "listing_view";
      const delta = buildMetricDelta(eventType, isUnique);
      const isLeadEvent = LEAD_EVENT_TYPES.has(eventType);

      const currentListingTotals = readMetrics(
        listingStatsSnap.exists ? listingStatsSnap.data()?.totals : null
      );
      const currentOwnerTotals = readMetrics(
        ownerStatsSnap.exists ? ownerStatsSnap.data()?.totals : null
      );
      const currentDailyTotals = readMetrics(
        dailyStatsSnap.exists ? dailyStatsSnap.data()?.totals : null
      );
      const currentMonthlyTotals = readMetrics(
        monthlyStatsSnap.exists ? monthlyStatsSnap.data()?.totals : null
      );

      const nextListingTotals = addMetrics(currentListingTotals, delta);
      const nextOwnerTotals = addMetrics(currentOwnerTotals, delta);
      const nextDailyTotals = addMetrics(currentDailyTotals, delta);
      const nextMonthlyTotals = addMetrics(currentMonthlyTotals, delta);

      const currentOwnerSourceBreakdown = readBreakdownMap(
        ownerDetailsSnap.exists ? ownerDetailsSnap.data()?.sourceBreakdown : null
      );
      const currentOwnerDeviceBreakdown = readBreakdownMap(
        ownerDetailsSnap.exists ? ownerDetailsSnap.data()?.deviceBreakdown : null
      );
      const currentOwnerReferrerBreakdown = readBreakdownMap(
        ownerDetailsSnap.exists ? ownerDetailsSnap.data()?.referrerBreakdown : null
      );
      const currentOwnerLeadBreakdown = readBreakdownMap(
        ownerDetailsSnap.exists ? ownerDetailsSnap.data()?.leadBreakdown : null
      );

      const nextListingData: Record<string, unknown> = {
        listingId,
        ownerUserId: listing.ownerUserId,
        listingTitle: listing.title,
        category: listing.category,
        location: listing.location,
        activePlanId: subscription.planId,
        analyticsTier: subscription.analyticsTier,
        totals: nextListingTotals,
        conversionRate: calculateConversionRate(
          nextListingTotals.views,
          nextListingTotals.leads
        ),
        lastUpdatedAt: now,
        lastUpdatedAtMs: now.toMillis(),
        recentEventAt: now,
        recentEventAtMs: now.toMillis(),
      };

      const nextOwnerData: Record<string, unknown> = {
        ownerUserId: listing.ownerUserId,
        activePlanId: subscription.planId,
        analyticsTier: subscription.analyticsTier,
        totals: nextOwnerTotals,
        conversionRate: calculateConversionRate(
          nextOwnerTotals.views,
          nextOwnerTotals.leads
        ),
        listingCount:
          (Number(ownerStatsSnap.exists ? ownerStatsSnap.data()?.listingCount : 0) ||
            0) + (listingStatsSnap.exists ? 0 : 1),
        lastUpdatedAt: now,
        lastUpdatedAtMs: now.toMillis(),
        recentEventAt: now,
        recentEventAtMs: now.toMillis(),
      };

      const nextOwnerDetailsData: Record<string, unknown> = {
        ownerUserId: listing.ownerUserId,
        activePlanId: subscription.planId,
        analyticsTier: subscription.analyticsTier,
        sourceBreakdown: incrementBreakdownMap(
          currentOwnerSourceBreakdown,
          sourcePage
        ),
        deviceBreakdown: incrementBreakdownMap(
          currentOwnerDeviceBreakdown,
          deviceType
        ),
        referrerBreakdown: incrementBreakdownMap(
          currentOwnerReferrerBreakdown,
          referrerDomain
        ),
        lastUpdatedAt: now,
        lastUpdatedAtMs: now.toMillis(),
        recentEventAt: now,
        recentEventAtMs: now.toMillis(),
      };

      if (isLeadEvent) {
        nextListingData.recentLeadAt = now;
        nextListingData.recentLeadAtMs = now.toMillis();
        nextOwnerData.recentLeadAt = now;
        nextOwnerData.recentLeadAtMs = now.toMillis();
        nextOwnerDetailsData.leadBreakdown = incrementBreakdownMap(
          currentOwnerLeadBreakdown,
          eventType
        );
        nextOwnerDetailsData.recentLeadAt = now;
        nextOwnerDetailsData.recentLeadAtMs = now.toMillis();
      }

      transaction.set(totalLockRef, {
        keyType: "total_window",
        listingId,
        ownerUserId: listing.ownerUserId,
        eventType,
        viewerKeyHash,
        expiresAt: totalExpiry,
        createdAt: now,
      });

      if (!uniqueLockSnap.exists) {
        transaction.set(uniqueLockRef, {
          keyType: "unique_window",
          listingId,
          ownerUserId: listing.ownerUserId,
          eventType,
          viewerKeyHash,
          expiresAt: uniqueExpiry,
          createdAt: now,
        });
      }

      transaction.set(
        eventRef,
        {
          eventId: eventRef.id,
          listingId,
          ownerUserId: listing.ownerUserId,
          listingTitle: listing.title,
          eventType,
          occurredAt: now,
          occurredAtMs: now.toMillis(),
          viewerKeyHash,
          sessionIdHash,
          isUnique,
          sourcePage,
          sourceRoute,
          referrer,
          referrerDomain,
          utm,
          deviceType,
          locationCountry: "",
          locationCity: "",
          activePlanId: subscription.planId,
          analyticsTier: subscription.analyticsTier,
        },
        { merge: false }
      );

      if (isLeadEvent) {
        transaction.set(
          leadRef,
          {
            leadId: leadRef.id,
            listingId,
            ownerUserId: listing.ownerUserId,
            listingTitle: listing.title,
            eventType,
            leadType: eventType === "contact_submit" ? "hard" : "soft",
            occurredAt: now,
            occurredAtMs: now.toMillis(),
            viewerKeyHash,
            sessionIdHash,
            sourcePage,
            sourceRoute,
            referrerDomain,
            deviceType,
            activePlanId: subscription.planId,
          },
          { merge: false }
        );
      }

      transaction.set(
        listingStatsRef,
        nextListingData,
        { merge: true }
      );

      transaction.set(
        ownerStatsRef,
        nextOwnerData,
        { merge: true }
      );

      transaction.set(
        ownerDetailsRef,
        nextOwnerDetailsData,
        { merge: true }
      );

      transaction.set(
        dailyStatsRef,
        {
          docId: `${listingId}__${dayKey}`,
          listingId,
          ownerUserId: listing.ownerUserId,
          listingTitle: listing.title,
          category: listing.category,
          location: listing.location,
          dateKey: dayKey,
          monthKey,
          totals: nextDailyTotals,
          conversionRate: calculateConversionRate(
            nextDailyTotals.views,
            nextDailyTotals.leads
          ),
          activePlanId: subscription.planId,
          analyticsTier: subscription.analyticsTier,
          lastUpdatedAt: now,
          lastUpdatedAtMs: now.toMillis(),
        },
        { merge: true }
      );

      transaction.set(
        monthlyStatsRef,
        {
          docId: `${listingId}__${monthKey}`,
          listingId,
          ownerUserId: listing.ownerUserId,
          listingTitle: listing.title,
          category: listing.category,
          location: listing.location,
          monthKey,
          totals: nextMonthlyTotals,
          conversionRate: calculateConversionRate(
            nextMonthlyTotals.views,
            nextMonthlyTotals.leads
          ),
          activePlanId: subscription.planId,
          analyticsTier: subscription.analyticsTier,
          lastUpdatedAt: now,
          lastUpdatedAtMs: now.toMillis(),
        },
        { merge: true }
      );

      return {
        accepted: true,
        duplicate: false,
        ignored: false,
        isUnique,
        eventId: eventRef.id,
      };
    });

    return result;
  }
);

export const upsertUserSubscription = functions.https.onCall(
  async (rawData: UpsertSubscriptionPayload, context) => {
    const callerUid = context.auth?.uid;
    if (!callerUid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Duhet te jesh i kycur."
      );
    }

    await verifyAdmin(callerUid);

    const userId = sanitizeString(rawData?.userId, "", 128);
    const planId = rawData?.planId;
    const status = rawData?.status;

    if (!userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Mungon userId."
      );
    }

    if (!isAnalyticsPlanId(planId)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "planId nuk eshte i vlefshem."
      );
    }

    if (!isSubscriptionStatus(status)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "status nuk eshte i vlefshem."
      );
    }

    const durationDays =
      Number(rawData?.durationDays) > 0
        ? Math.round(Number(rawData?.durationDays))
        : resolveDefaultDurationDays(planId);

    const now = Timestamp.now();
    const shouldBeActive = status === "active" && planId !== "free";
    const startedAt = shouldBeActive ? now : null;
    const expiresAt =
      shouldBeActive && durationDays
        ? Timestamp.fromMillis(
            now.toMillis() + durationDays * 24 * 60 * 60 * 1000
          )
        : null;

    const subscriptionRef = getDb().doc(`user_subscriptions/${userId}`);
    const existingSnap = await subscriptionRef.get();

    await subscriptionRef.set(
      {
        userId,
        planId,
        status,
        analyticsTier: resolveAnalyticsTier(planId, status),
        source: sanitizeString(rawData?.source, "manual_admin", 80),
        paymentReference: sanitizeString(rawData?.paymentReference, "", 120),
        paymentMethod: sanitizeString(rawData?.paymentMethod, "", 40),
        durationDays: durationDays || null,
        startedAt,
        expiresAt,
        activatedAt: shouldBeActive ? now : null,
        activatedBy: callerUid,
        updatedAt: now,
        createdAt:
          existingSnap.exists && existingSnap.data()?.createdAt instanceof Timestamp
            ? existingSnap.data()?.createdAt
            : now,
      },
      { merge: true }
    );

    return {
      success: true,
      userId,
      planId,
      status,
      analyticsTier: resolveAnalyticsTier(planId, status),
      expiresAt: expiresAt ? expiresAt.toDate().toISOString() : null,
    };
  }
);

export const expireElapsedSubscriptions = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("Europe/Budapest")
  .onRun(async () => {
    const db = getDb();
    const now = Timestamp.now();
    let processed = 0;

    const snapshot = await db
      .collection("user_subscriptions")
      .where("status", "==", "active")
      .where("expiresAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return null;
    }

    let batch = db.batch();
    let batchSize = 0;

    for (const docSnap of snapshot.docs) {
      batch.update(docSnap.ref, {
        status: "expired",
        analyticsTier: "locked",
        updatedAt: now,
      });
      batchSize += 1;
      processed += 1;

      if (batchSize === 400) {
        await batch.commit();
        batch = db.batch();
        batchSize = 0;
      }
    }

    if (batchSize > 0) {
      await batch.commit();
    }

    return { processed };
  });

export const cleanupAnalyticsDedupe = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("Europe/Budapest")
  .onRun(async () => {
    const db = getDb();
    const now = Timestamp.now();
    let removed = 0;
    let keepDeleting = true;

    while (keepDeleting) {
      const snapshot = await db
        .collection("analytics_dedupe")
        .where("expiresAt", "<=", now)
        .limit(400)
        .get();

      if (snapshot.empty) {
        keepDeleting = false;
        continue;
      }

      const batch = db.batch();
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
      removed += snapshot.size;
      keepDeleting = snapshot.size === 400;
    }

    return { removed };
  });

export const backfillOwnerAnalyticsListingCounts = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("Europe/Budapest")
  .onRun(async () => {
    const db = getDb();
    const statsSnapshot = await db.collection("listing_stats").get();
    const listingCountByOwner = new Map<string, number>();

    statsSnapshot.docs.forEach((docSnap) => {
      const ownerUserId = sanitizeString(docSnap.data()?.ownerUserId, "", 128);
      if (!ownerUserId) return;
      listingCountByOwner.set(
        ownerUserId,
        (listingCountByOwner.get(ownerUserId) || 0) + 1
      );
    });

    if (!listingCountByOwner.size) {
      return { processed: 0 };
    }

    let processed = 0;
    let batch = db.batch();
    let batchSize = 0;
    const now = Timestamp.now();

    for (const [ownerUserId, listingCount] of listingCountByOwner.entries()) {
      batch.set(
        db.doc(`owner_analytics/${ownerUserId}`),
        {
          ownerUserId,
          listingCount,
          updatedAt: now,
          updatedAtMs: now.toMillis(),
        },
        { merge: true }
      );
      batchSize += 1;
      processed += 1;

      if (batchSize === 400) {
        await batch.commit();
        batch = db.batch();
        batchSize = 0;
      }
    }

    if (batchSize > 0) {
      await batch.commit();
    }

    return { processed };
  });
