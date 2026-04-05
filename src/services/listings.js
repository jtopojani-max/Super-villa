import { auth, db } from "../firebase.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { normalizeListingFeatures } from "../utils/listingFeatures.js";

const listingsRef = collection(db, "listings");
const PREMIUM_FETCH_MULTIPLIER = 4;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const normalizePremiumOrder = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toTimestamp = (value) => {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortPremiumItems = (a, b) => {
  const aOrder = typeof a.premiumOrder === "number" ? a.premiumOrder : Number.MAX_SAFE_INTEGER;
  const bOrder = typeof b.premiumOrder === "number" ? b.premiumOrder : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
};

const resolvePremiumFetchLimit = (limitCount = 6) => {
  const parsed = Number(limitCount);
  const safeLimit = Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
  return Math.max(6, safeLimit) * PREMIUM_FETCH_MULTIPLIER;
};

const normalizeImageList = (payload = {}) => {
  const fromImages = Array.isArray(payload.images) ? payload.images : [];
  const fromSingle = normalizeString(payload.image);

  const normalized = fromImages
    .map((value) => normalizeString(value))
    .filter(Boolean)
    .slice(0, 10);

  if (!normalized.length && fromSingle) {
    normalized.push(fromSingle);
  }

  return normalized;
};

export const normalizeListingPayload = (payload = {}) => {
  const images = normalizeImageList(payload);
  const normalized = {
    title: normalizeString(payload.title),
    description: normalizeString(payload.description),
    location: normalizeString(payload.location),
    category: normalizeString(payload.category || "Villa") || "Villa",
    image: images[0] || "",
    images,
    whatsapp: normalizeString(payload.whatsapp).replace(/[^\d+]/g, ""),
    author: normalizeString(payload.author),
    createdBy: normalizeString(payload.createdBy),
    createdByUid: normalizeString(payload.createdByUid),
    userId: normalizeString(payload.userId || payload.createdByUid),
    createdByEmail: normalizeString(payload.createdByEmail),
    companyName: normalizeString(payload.companyName),
    isUserPost: Boolean(payload.isUserPost),
    isPremium: Boolean(payload.isPremium),
    premiumOrder: Boolean(payload.isPremium) ? normalizePremiumOrder(payload.premiumOrder) : null,
    price: toNumber(payload.price),
    rooms: toNumber(payload.rooms, toNumber(payload.beds)),
    beds: toNumber(payload.beds),
    baths: toNumber(payload.baths),
    area: toNumber(payload.area),
    guests: toNumber(payload.guests),
    features: normalizeListingFeatures(payload.features || payload.amenities, payload.category),
  };

  if (normalized.guests <= 0) {
    normalized.guests = Math.max(1, normalized.beds ? normalized.beds * 2 : 1);
  }

  return normalized;
};

const readPremiumDocs = async (collectionReference, mapper, limitCount = 6) => {
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
    return snap.docs.map(mapper).sort(sortPremiumItems);
  } catch (error) {
    if (error?.code !== "failed-precondition") throw error;

    // Premium section fallback: allows local/dev preview before the composite index exists.
    const snap = await getDocs(query(collectionReference, where("isPremium", "==", true), limit(fetchLimit)));
    return snap.docs.map(mapper).sort(sortPremiumItems);
  }
};

const toListing = (snapshotDoc) => {
  const data = snapshotDoc.data();
  const createdAt =
    typeof data.createdAt?.toDate === "function"
      ? data.createdAt.toDate().toISOString()
      : data.createdAt || null;
  const updatedAt =
    typeof data.updatedAt?.toDate === "function"
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt || null;

  const normalized = normalizeListingPayload(data);
  const rawDays = Number(data.premiumDays);
  return {
    id: snapshotDoc.id,
    ...normalized,
    premiumDays: normalized.isPremium && Number.isFinite(rawDays) && rawDays >= 1 ? Math.round(rawDays) : null,
    createdAt,
    updatedAt,
    lat: data.lat || null,
    lng: data.lng || null,
    address: data.address || "",
    city: data.city || "",
    country: data.country || "",
    hasAirbnb: Boolean(data.hasAirbnb),
    airbnbUrl: data.airbnbUrl || null,
  };
};

export const listListings = async () => {
  try {
    const snap = await getDocs(listingsRef);
    return snap.docs
      .map(toListing)
      .sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("Gabim ne ngarkimin e shpalljeve:", error);
    throw new Error("Nuk mund te ngarkohen shpalljet. Kontrolloni lidhjen me internetin.");
  }
};

export const listPremiumListings = async (limitCount = 6) => {
  try {
    return await readPremiumDocs(listingsRef, toListing, limitCount);
  } catch (error) {
    console.error("Gabim ne ngarkimin e shpalljeve premium:", error);
    throw new Error("Nuk mund te ngarkohen shpalljet premium. Kontrolloni lidhjen me internetin.");
  }
};

export const getListingById = async (listingId) => {
  if (!listingId) return null;
  try {
    // Try old listings collection first
    const snap = await getDoc(doc(db, "listings", listingId));
    if (snap.exists()) return toListing(snap);
    // Fallback: try posts_public (moderated posts)
    const pubSnap = await getDoc(doc(db, "posts_public", listingId));
    if (pubSnap.exists()) return toListing(pubSnap);
    return null;
  } catch (error) {
    console.error("Gabim ne ngarkimin e shpalljes:", error);
    throw new Error("Nuk mund te ngarkohet shpallja. Kontrolloni lidhjen me internetin.");
  }
};

export const getListingsByIds = async (ids = []) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (!uniqueIds.length) return [];
  try {
    const items = await Promise.all(uniqueIds.map((id) => getListingById(id)));
    return items.filter(Boolean);
  } catch (error) {
    console.error("Gabim ne ngarkimin e shpalljeve me ID:", error);
    throw new Error("Nuk mund te ngarkohen shpalljet. Kontrolloni lidhjen me internetin.");
  }
};

export const listListingsByUser = async (userId) => {
  try {
    const snap = await getDocs(query(listingsRef, where("createdByUid", "==", userId)));
    return snap.docs
      .map(toListing)
      .sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("Gabim ne ngarkimin e shpalljeve te perdoruesit:", error);
    throw new Error("Nuk mund te ngarkohen shpalljet tuaja. Kontrolloni lidhjen me internetin.");
  }
};

export const createListing = async (payload) => {
  const normalized = normalizeListingPayload(payload);
  const ownerUid = auth.currentUser?.uid;

  if (!normalized.title || !normalized.description || !normalized.location || !normalized.image) {
    throw new Error("Mungojne te dhenat kryesore te shpalljes.");
  }
  if (!ownerUid) {
    throw new Error("Perdorues i paautorizuar.");
  }
  if (normalized.images.length > 10) {
    throw new Error("Mund te shtohen maksimumi 10 foto.");
  }
  if (normalized.price <= 0 || normalized.rooms <= 0 || normalized.beds <= 0 || normalized.baths <= 0) {
    throw new Error("Vlerat numerike duhet te jene me te medha se zero.");
  }

  const created = await addDoc(listingsRef, {
    ...normalized,
    createdByUid: ownerUid,
    userId: ownerUid,
    createdAt: serverTimestamp(),
  });
  return created.id;
};

export const deleteListingById = async (listingId) => {
  await deleteDoc(doc(db, "listings", listingId));
};
