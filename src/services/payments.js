import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { auth, functions, storage } from "../firebase.js";
import { buildPaymentReference } from "../config/pricing.js";

export const PAYMENT_PROOF_MAX_BYTES = 8 * 1024 * 1024;
export const PAYMENT_PROOF_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
export const PAYMENT_PROOF_INPUT_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";

const createSubmissionId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `payment_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizeFileName = (value) =>
  value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

export async function submitPaymentProof(payload) {
  if (!auth.currentUser?.uid) {
    throw new Error("auth-required");
  }

  const submissionId = createSubmissionId();
  const proofFile = payload?.proofFile;
  let storagePath = "";
  let safeName = "";
  let originalName = "";

  if (proofFile instanceof File) {
    if (!PAYMENT_PROOF_ACCEPTED_TYPES.includes(proofFile.type)) {
      throw new Error("invalid-proof-type");
    }
    if (proofFile.size > PAYMENT_PROOF_MAX_BYTES) {
      throw new Error("proof-file-too-large");
    }
    originalName = normalizeText(proofFile.name) || "payment-proof";
    safeName = sanitizeFileName(originalName) || "payment-proof";
    storagePath = `payment-proofs/${auth.currentUser.uid}/${submissionId}/${Date.now()}-${safeName}`;

    await uploadBytes(ref(storage, storagePath), proofFile, {
      contentType: proofFile.type,
      customMetadata: {
        source: "pricing_section",
        requestOwnerUid: auth.currentUser.uid,
        submissionId,
      },
    });
  }

  const paymentReference =
    normalizeText(payload.paymentReference) || buildPaymentReference(payload.planId);

  try {
    const createPaidPlanRequest = httpsCallable(functions, "createPaidPlanRequest");
    const result = await createPaidPlanRequest({
      submissionId,
      customerName: normalizeText(payload.customerName),
      email: normalizeText(payload.email),
      phone: normalizeText(payload.phone),
      planId: normalizeText(payload.planId),
      paymentMethod: normalizeText(payload.paymentMethod),
      paymentReference,
      transactionId: normalizeText(payload.transactionId),
      businessName: normalizeText(payload.businessName),
      listingId: normalizeText(payload.listingId),
      notes: normalizeText(payload.notes),
      proofStoragePath: storagePath,
      proofFileName: safeName,
      proofOriginalName: originalName,
      proofContentType: proofFile?.type || "",
      proofSize: proofFile?.size || 0,
    });

    return {
      submissionId,
      paymentReference,
      paymentStatus: result.data?.paymentStatus || "pending",
    };
  } catch (error) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch (cleanupError) {
      console.warn("Failed to cleanup payment proof after request error:", cleanupError);
    }
    throw error;
  }
}
