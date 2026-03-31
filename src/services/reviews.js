import { auth, db, functions } from "../firebase.js";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

const reviewsRef = collection(db, "reviews");

const toDate = (value) => {
  if (!value) return new Date();
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
};

const toReview = (snap) => {
  const data = snap.data();
  return {
    id: snap.id,
    listingId: data.listingId || "",
    userId: data.userId || null,
    userName: data.userName || "Anonim",
    userPhoto: data.userPhoto || "",
    rating: Number(data.rating) || 0,
    comment: data.comment || "",
    createdAt: toDate(data.createdAt),
  };
};

/**
 * Fetch all reviews for a specific listing, ordered newest-first.
 * Falls back to client-side sort if composite index isn't deployed yet.
 */
export const getReviewsForListing = async (listingId) => {
  if (!listingId) return [];

  try {
    const q = query(
      reviewsRef,
      where("listingId", "==", listingId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(toReview);
  } catch (error) {
    if (error?.code === "failed-precondition") {
      console.warn("Reviews composite index not ready, using client-side sort.");
      const q = query(reviewsRef, where("listingId", "==", listingId));
      const snap = await getDocs(q);
      return snap.docs
        .map(toReview)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    throw error;
  }
};

/**
 * Compute average rating from a list of reviews.
 */
export const computeAverageRating = (reviews = []) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

/**
 * Add a new review for a listing.
 * Requires authenticated user.
 */
export const addReview = async (listingId, { rating, comment }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Duhet te jesh i kycur per te lene nje review.");

  const safeRating = Math.min(5, Math.max(1, Math.round(Number(rating))));
  if (!Number.isFinite(safeRating) || safeRating < 1 || safeRating > 5) {
    throw new Error("Vleresimi duhet te jete ndermjet 1 dhe 5.");
  }

  const safeComment = (comment || "").trim();
  if (!safeComment) {
    throw new Error("Komenti nuk mund te jete bosh.");
  }
  if (safeComment.length > 1000) {
    throw new Error("Komenti nuk mund te kaloje 1000 karaktere.");
  }

  try {
    const callCreateReview = httpsCallable(functions, "createReview");
    const result = await callCreateReview({
      listingId,
      rating: safeRating,
      comment: safeComment,
    });

    const data = result.data || {};
    return {
      id: data.id || "",
      listingId: data.listingId || listingId,
      userId: data.userId || user.uid,
      userName: data.userName || user.displayName || user.email?.split("@")[0] || "Perdorues",
      userPhoto: data.userPhoto || user.photoURL || "",
      rating: Number(data.rating) || safeRating,
      comment: data.comment || safeComment,
      createdAt: toDate(data.createdAt),
    };
  } catch (error) {
    throw new Error(
      error?.message || "Gabim gjate dergimit te vleresimit. Provo perseri."
    );
  }
};
