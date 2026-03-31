import { httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, functions } from "../firebase.js";

export const ANALYTICS_TIMEFRAMES = [
  { id: "today", label: "Sot" },
  { id: "7d", label: "7 ditë" },
  { id: "30d", label: "30 ditë" },
  { id: "all", label: "Gjithë kohës" },
];

export const ANALYTICS_EVENT_LABELS = {
  listing_view: "Shikim i listing-ut",
  whatsapp_click: "Klikim në WhatsApp",
  phone_click: "Klikim në telefon",
  contact_submit: "Dërgim kontakti",
};

const ANALYTICS_SESSION_KEY = "sv_analytics_session";

const emptyMetrics = () => ({
  views: 0,
  uniqueViews: 0,
  whatsappClicks: 0,
  phoneClicks: 0,
  contactSubmits: 0,
  leads: 0,
});

const normalizeTimestamp = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
};

const normalizeMetrics = (value) => ({
  views: Number(value?.views) || 0,
  uniqueViews: Number(value?.uniqueViews) || 0,
  whatsappClicks: Number(value?.whatsappClicks) || 0,
  phoneClicks: Number(value?.phoneClicks) || 0,
  contactSubmits: Number(value?.contactSubmits) || 0,
  leads: Number(value?.leads) || 0,
});

const sumMetrics = (items = []) =>
  items.reduce(
    (accumulator, item) => ({
      views: accumulator.views + (item.views || 0),
      uniqueViews: accumulator.uniqueViews + (item.uniqueViews || 0),
      whatsappClicks: accumulator.whatsappClicks + (item.whatsappClicks || 0),
      phoneClicks: accumulator.phoneClicks + (item.phoneClicks || 0),
      contactSubmits: accumulator.contactSubmits + (item.contactSubmits || 0),
      leads: accumulator.leads + (item.leads || 0),
    }),
    emptyMetrics()
  );

const calculateConversionRate = (views, leads) => {
  if (!views || views <= 0 || !leads) return 0;
  return Number(((leads / views) * 100).toFixed(2));
};

const parseBreakdown = (value) =>
  Object.entries(value || {})
    .map(([key, count]) => ({
      key,
      count: Number(count) || 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

const decodeBreakdownLabel = (value) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const getAnalyticsSessionId = () => {
  if (typeof window === "undefined") return "server-session";

  try {
    const existing = window.localStorage.getItem(ANALYTICS_SESSION_KEY);
    if (existing) return existing;

    const next =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `sv-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(ANALYTICS_SESSION_KEY, next);
    return next;
  } catch (_) {
    return `sv-${Date.now()}`;
  }
};

export const detectDeviceType = () => {
  if (typeof window === "undefined") return "unknown";
  const width = window.innerWidth || 0;
  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
};

export const readUtmParams = () => {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
  };
};

export const trackListingEvent = async ({
  listingId,
  eventType,
  sourcePage = "listing_detail",
  sourceRoute,
}) => {
  if (!listingId || !eventType) return null;

  const callTrack = httpsCallable(functions, "trackListingEvent");

  try {
    const result = await callTrack({
      listingId,
      eventType,
      sessionId: getAnalyticsSessionId(),
      sourcePage,
      sourceRoute:
        sourceRoute ||
        (typeof window !== "undefined" ? window.location.pathname : ""),
      referrer:
        typeof document !== "undefined" ? document.referrer || "" : "",
      utm: readUtmParams(),
      deviceType: detectDeviceType(),
    });

    return result.data || null;
  } catch (error) {
    console.warn("Analytics tracking failed:", error);
    return null;
  }
};

export const trackListingView = async (listingId, sourceRoute) =>
  trackListingEvent({
    listingId,
    eventType: "listing_view",
    sourcePage: "listing_detail",
    sourceRoute,
  });

export const trackLeadAction = async (listingId, eventType, sourceRoute) =>
  trackListingEvent({
    listingId,
    eventType,
    sourcePage: "listing_contact",
    sourceRoute,
  });

const normalizeAnalyticsDoc = (snapshotDoc) => {
  const data = snapshotDoc.data();

  return {
    id: snapshotDoc.id,
    listingId: data.listingId || snapshotDoc.id,
    ownerUserId: data.ownerUserId || "",
    listingTitle: data.listingTitle || "Shpallje",
    category: data.category || "",
    location: data.location || "",
    activePlanId: data.activePlanId || "free",
    analyticsTier: data.analyticsTier || "locked",
    totals: normalizeMetrics(data.totals),
    conversionRate:
      typeof data.conversionRate === "number"
        ? data.conversionRate
        : calculateConversionRate(
            Number(data?.totals?.views) || 0,
            Number(data?.totals?.leads) || 0
          ),
    sourceBreakdown: parseBreakdown(data.sourceBreakdown),
    deviceBreakdown: parseBreakdown(data.deviceBreakdown),
    referrerBreakdown: parseBreakdown(data.referrerBreakdown),
    leadBreakdown: parseBreakdown(data.leadBreakdown),
    lastUpdatedAt: normalizeTimestamp(data.lastUpdatedAt),
    lastUpdatedAtMs: Number(data.lastUpdatedAtMs) || 0,
    recentEventAt: normalizeTimestamp(data.recentEventAt),
    recentEventAtMs: Number(data.recentEventAtMs) || 0,
    recentLeadAt: normalizeTimestamp(data.recentLeadAt),
    recentLeadAtMs: Number(data.recentLeadAtMs) || 0,
    dateKey: data.dateKey || "",
    monthKey: data.monthKey || "",
    listingCount: Number(data.listingCount) || 0,
  };
};

export const getOwnerAnalyticsSummary = async (userId) => {
  if (!userId) return null;
  const snapshot = await getDoc(doc(db, "owner_analytics", userId));
  return snapshot.exists()
    ? normalizeAnalyticsDoc(snapshot)
    : {
        id: userId,
        ownerUserId: userId,
        listingCount: 0,
        totals: emptyMetrics(),
        conversionRate: 0,
        sourceBreakdown: [],
        deviceBreakdown: [],
        referrerBreakdown: [],
        leadBreakdown: [],
        lastUpdatedAt: null,
        lastUpdatedAtMs: 0,
        recentEventAt: null,
        recentEventAtMs: 0,
        recentLeadAt: null,
        recentLeadAtMs: 0,
        analyticsTier: "locked",
        activePlanId: "free",
      };
};

export const getOwnerAnalyticsDetails = async (userId) => {
  if (!userId) {
    return {
      ownerUserId: "",
      sourceBreakdown: [],
      deviceBreakdown: [],
      referrerBreakdown: [],
      leadBreakdown: [],
      recentEventAt: null,
      recentEventAtMs: 0,
      recentLeadAt: null,
      recentLeadAtMs: 0,
    };
  }

  const snapshot = await getDoc(doc(db, "owner_analytics_details", userId));
  if (!snapshot.exists()) {
    return {
      ownerUserId: userId,
      sourceBreakdown: [],
      deviceBreakdown: [],
      referrerBreakdown: [],
      leadBreakdown: [],
      recentEventAt: null,
      recentEventAtMs: 0,
      recentLeadAt: null,
      recentLeadAtMs: 0,
    };
  }

  const data = snapshot.data();
  return {
    ownerUserId: data.ownerUserId || userId,
    sourceBreakdown: parseBreakdown(data.sourceBreakdown),
    deviceBreakdown: parseBreakdown(data.deviceBreakdown),
    referrerBreakdown: parseBreakdown(data.referrerBreakdown),
    leadBreakdown: parseBreakdown(data.leadBreakdown),
    recentEventAt: normalizeTimestamp(data.recentEventAt),
    recentEventAtMs: Number(data.recentEventAtMs) || 0,
    recentLeadAt: normalizeTimestamp(data.recentLeadAt),
    recentLeadAtMs: Number(data.recentLeadAtMs) || 0,
  };
};

export const listOwnerListingStats = async (userId) => {
  if (!userId) return [];
  const snapshot = await getDocs(
    query(
      collection(db, "listing_stats"),
      where("ownerUserId", "==", userId),
      orderBy("lastUpdatedAtMs", "desc")
    )
  );

  return snapshot.docs.map(normalizeAnalyticsDoc);
};

export const listOwnerDailyStats = async (userId, startDateKey) => {
  if (!userId) return [];
  const filters = [
    where("ownerUserId", "==", userId),
    orderBy("dateKey", "asc"),
  ];

  if (startDateKey) {
    filters.unshift(where("dateKey", ">=", startDateKey));
  }

  const snapshot = await getDocs(
    query(collection(db, "listing_daily_stats"), ...filters)
  );

  return snapshot.docs.map(normalizeAnalyticsDoc);
};

export const listOwnerRecentActivity = async (userId, limitCount = 15) => {
  if (!userId) return [];
  const snapshot = await getDocs(
    query(
      collection(db, "listing_events"),
      where("ownerUserId", "==", userId),
      orderBy("occurredAtMs", "desc"),
      limit(limitCount)
    )
  );

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      listingId: data.listingId || "",
      listingTitle: data.listingTitle || "Shpallje",
      ownerUserId: data.ownerUserId || "",
      eventType: data.eventType || "listing_view",
      eventLabel: ANALYTICS_EVENT_LABELS[data.eventType] || "Aktivitet",
      occurredAt: normalizeTimestamp(data.occurredAt),
      occurredAtMs: Number(data.occurredAtMs) || 0,
      sourcePage: data.sourcePage || "",
      sourceRoute: data.sourceRoute || "",
      referrerDomain: data.referrerDomain || "direct",
      deviceType: data.deviceType || "unknown",
      isUnique: Boolean(data.isUnique),
    };
  });
};

export const listOwnerRecentLeads = async (userId, limitCount = 10) => {
  if (!userId) return [];
  const snapshot = await getDocs(
    query(
      collection(db, "leads"),
      where("ownerUserId", "==", userId),
      orderBy("occurredAtMs", "desc"),
      limit(limitCount)
    )
  );

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      listingId: data.listingId || "",
      listingTitle: data.listingTitle || "Shpallje",
      eventType: data.eventType || "whatsapp_click",
      eventLabel: ANALYTICS_EVENT_LABELS[data.eventType] || "Lead",
      leadType: data.leadType || "soft",
      occurredAt: normalizeTimestamp(data.occurredAt),
      occurredAtMs: Number(data.occurredAtMs) || 0,
      sourcePage: data.sourcePage || "",
      sourceRoute: data.sourceRoute || "",
      referrerDomain: data.referrerDomain || "direct",
      deviceType: data.deviceType || "unknown",
    };
  });
};

export const formatBreakdownLabel = decodeBreakdownLabel;

export const getDateKeyDaysAgo = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const isWithinTimeframe = (dateKey, timeframe) => {
  if (!dateKey) return false;
  if (timeframe === "all") return true;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const subject = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(subject.getTime())) return false;

  const diffInDays = Math.floor((now.getTime() - subject.getTime()) / (24 * 60 * 60 * 1000));
  if (timeframe === "today") return diffInDays === 0;
  if (timeframe === "7d") return diffInDays >= 0 && diffInDays < 7;
  if (timeframe === "30d") return diffInDays >= 0 && diffInDays < 30;
  return true;
};

export const buildOwnerTotalsForTimeframe = (summary, dailyStats, timeframe) => {
  if (timeframe === "all") {
    const totals = normalizeMetrics(summary?.totals);
    return {
      ...totals,
      conversionRate: calculateConversionRate(totals.views, totals.leads),
    };
  }

  const totals = sumMetrics(
    dailyStats
      .filter((item) => isWithinTimeframe(item.dateKey, timeframe))
      .map((item) => item.totals)
  );

  return {
    ...totals,
    conversionRate: calculateConversionRate(totals.views, totals.leads),
  };
};

export const buildListingBreakdownForTimeframe = (listingStats, dailyStats, timeframe) => {
  if (timeframe === "all") {
    return listingStats.map((item) => ({
      ...item,
      metrics: item.totals,
      conversionRate: calculateConversionRate(item.totals.views, item.totals.leads),
    }));
  }

  const listingMap = new Map(
    listingStats.map((item) => [
      item.listingId,
      {
        ...item,
        metrics: emptyMetrics(),
        conversionRate: 0,
      },
    ])
  );

  dailyStats
    .filter((item) => isWithinTimeframe(item.dateKey, timeframe))
    .forEach((item) => {
      const current =
        listingMap.get(item.listingId) ||
        {
          listingId: item.listingId,
          listingTitle: item.listingTitle || "Shpallje",
          category: item.category || "",
          location: item.location || "",
          activePlanId: item.activePlanId || "free",
          analyticsTier: item.analyticsTier || "locked",
          metrics: emptyMetrics(),
          conversionRate: 0,
        };

      current.metrics = sumMetrics([current.metrics, item.totals]);
      current.conversionRate = calculateConversionRate(
        current.metrics.views,
        current.metrics.leads
      );
      listingMap.set(item.listingId, current);
    });

  return Array.from(listingMap.values()).sort(
    (a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0)
  );
};

export const buildOwnerTimeline = (dailyStats, days = 30) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slots = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const next = new Date(today);
    next.setDate(today.getDate() - index);
    slots.push({
      dateKey: next.toISOString().slice(0, 10),
      label: next.toLocaleDateString("sq-AL", {
        day: "2-digit",
        month: "short",
      }),
      views: 0,
      leads: 0,
    });
  }

  const slotMap = new Map(slots.map((item) => [item.dateKey, item]));

  dailyStats.forEach((item) => {
    const slot = slotMap.get(item.dateKey);
    if (!slot) return;
    slot.views += item.totals.views || 0;
    slot.leads += item.totals.leads || 0;
  });

  return slots;
};
