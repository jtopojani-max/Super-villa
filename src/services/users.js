import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase.js";

const userDocRef = (uid) => doc(db, "users", uid);
const savedListingsCollection = (uid) => collection(db, "users", uid, "savedListings");
const savedListingDocRef = (uid, listingId) => doc(db, "users", uid, "savedListings", listingId);

const normalizeString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const normalizeFavorites = (value) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((item) => normalizeString(item)).filter(Boolean)))
    : [];

const sanitizeProfileFields = (payload = {}) => {
  const next = {};

  if ("name" in payload) next.name = normalizeString(payload.name);
  if ("phone" in payload) next.phone = normalizeString(payload.phone);
  if ("address" in payload) next.address = normalizeString(payload.address);
  if ("photoURL" in payload) next.photoURL = normalizeString(payload.photoURL);
  if ("provider" in payload) next.provider = normalizeString(payload.provider);
  if ("favorites" in payload) next.favorites = normalizeFavorites(payload.favorites);

  return next;
};

const resolveProvider = (firebaseUser) => {
  const providerId = normalizeString(firebaseUser?.providerData?.[0]?.providerId);

  if (providerId === "google.com") return "google";
  if (providerId === "password") return "password";
  return providerId;
};

const getAuthSyncedFields = (firebaseUser = auth.currentUser) => {
  const user = firebaseUser || auth.currentUser;

  if (!user) {
    return {};
  }

  return {
    uid: user.uid,
    email: user.email || "",
    emailVerified: Boolean(user.emailVerified),
    photoURL: user.photoURL || "",
    provider: resolveProvider(user),
  };
};

export const createUserProfileIfMissing = async (firebaseUser, extra = {}) => {
  const ref = userDocRef(firebaseUser.uid);
  const snap = await getDoc(ref);
  const safeExtra = sanitizeProfileFields(extra);

  if (snap.exists()) {
    return snap.data();
  }

  const profileData = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Perdorues",
    role: "user",
    phone: "",
    address: "",
    favorites: [],
    ...getAuthSyncedFields(firebaseUser),
    ...safeExtra,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(ref, profileData);
  return profileData;
};

export const ensureUserProfile = async (firebaseUser, extra = {}) => {
  const ref = userDocRef(firebaseUser.uid);
  const snap = await getDoc(ref);
  const safeExtra = sanitizeProfileFields(extra);
  const authFields = getAuthSyncedFields(firebaseUser);

  const baseData = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Perdorues",
    role: "user",
    phone: "",
    address: "",
    favorites: [],
    ...authFields,
    lastLoginAt: serverTimestamp(),
    ...safeExtra,
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...baseData,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      ...authFields,
      lastLoginAt: serverTimestamp(),
      ...safeExtra,
      updatedAt: serverTimestamp(),
    });
  }

  const latestSnap = await getDoc(ref);
  return latestSnap.exists() ? latestSnap.data() : baseData;
};

export const updateUserProfile = async (uid, payload) => {
  const currentUid = auth.currentUser?.uid;

  if (!currentUid || currentUid !== uid) {
    throw new Error("Unauthorized profile update.");
  }

  const ref = userDocRef(uid);
  const safePayload = sanitizeProfileFields(payload);
  await updateDoc(ref, {
    ...safePayload,
    ...getAuthSyncedFields(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(userDocRef(uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Gabim ne ngarkimin e profilit:", error);
    throw new Error("Nuk mund te ngarkohet profili. Kontrolloni lidhjen me internetin.");
  }
};

export const getFavoriteIds = async (uid) => {
  const profile = await getUserProfile(uid);
  return Array.isArray(profile?.favorites) ? profile.favorites : [];
};

export const addFavorite = async (uid, listingId) => {
  await updateDoc(userDocRef(uid), {
    favorites: arrayUnion(listingId),
    updatedAt: serverTimestamp(),
  });
};

export const removeFavorite = async (uid, listingId) => {
  await updateDoc(userDocRef(uid), {
    favorites: arrayRemove(listingId),
    updatedAt: serverTimestamp(),
  });
};

export const listSavedListingIds = async (uid) => {
  try {
    const snap = await getDocs(query(savedListingsCollection(uid), orderBy("createdAt", "desc")));
    return snap.docs.map((docSnap) => docSnap.id);
  } catch (error) {
    console.error("Gabim ne ngarkimin e shpalljeve te ruajtura:", error);
    throw new Error("Nuk mund te ngarkohen shpalljet e ruajtura.");
  }
};

export const isListingSaved = async (uid, listingId) => {
  try {
    const snap = await getDoc(savedListingDocRef(uid, listingId));
    return snap.exists();
  } catch (error) {
    console.error("Gabim ne kontrollin e shpalljes se ruajtur:", error);
    return false;
  }
};

export const saveListing = async (uid, listingId) => {
  const batch = writeBatch(db);
  batch.set(
    userDocRef(uid),
    {
      favorites: arrayUnion(listingId),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  batch.set(savedListingDocRef(uid, listingId), {
    listingId,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
};

export const removeSavedListing = async (uid, listingId) => {
  const batch = writeBatch(db);
  batch.set(
    userDocRef(uid),
    {
      favorites: arrayRemove(listingId),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  batch.delete(savedListingDocRef(uid, listingId));
  await batch.commit();
};

export const toggleSavedListing = async (uid, listingId) => {
  const exists = await isListingSaved(uid, listingId);
  if (exists) {
    await removeSavedListing(uid, listingId);
    return false;
  }
  await saveListing(uid, listingId);
  return true;
};
