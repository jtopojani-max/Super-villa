export const PRICING_PLAN_META = {
  basic: {
    id: "basic",
    amount: 0,
    durationDays: 0,
  },
  premium: {
    id: "premium",
    amount: 15,
    durationDays: 30,
  },
  "business-pro": {
    id: "business-pro",
    amount: 90,
    durationDays: 90,
  },
};

export const PAID_PLAN_IDS = ["premium", "business-pro"];

export const PAYMENT_CONFIG = {
  bank: {
    beneficiaryName:
      import.meta.env.VITE_PAYMENT_BANK_BENEFICIARY || "CONFIGURE_BENEFICIARY_NAME",
    iban: import.meta.env.VITE_PAYMENT_BANK_IBAN || "CONFIGURE_BANK_IBAN",
    bankName: import.meta.env.VITE_PAYMENT_BANK_NAME || "CONFIGURE_BANK_NAME",
    referencePrefix:
      import.meta.env.VITE_PAYMENT_BANK_REFERENCE_PREFIX || "SV",
  },
  crypto: {
    walletAddress:
      import.meta.env.VITE_PAYMENT_CRYPTO_WALLET_ADDRESS || "CONFIGURE_CRYPTO_WALLET_ADDRESS",
    network: import.meta.env.VITE_PAYMENT_CRYPTO_NETWORK || "CONFIGURE_CRYPTO_NETWORK",
    currency: import.meta.env.VITE_PAYMENT_CRYPTO_CURRENCY || "USDT",
  },
};

const isConfiguredValue = (value) =>
  typeof value === "string" && value.trim() && !value.startsWith("CONFIGURE_");

export const isPaymentConfigComplete = () =>
  isConfiguredValue(PAYMENT_CONFIG.bank.beneficiaryName) &&
  isConfiguredValue(PAYMENT_CONFIG.bank.iban) &&
  isConfiguredValue(PAYMENT_CONFIG.bank.bankName) &&
  isConfiguredValue(PAYMENT_CONFIG.crypto.walletAddress) &&
  isConfiguredValue(PAYMENT_CONFIG.crypto.network) &&
  isConfiguredValue(PAYMENT_CONFIG.crypto.currency);

export function buildPaymentReference(planId, now = new Date()) {
  const meta = PRICING_PLAN_META[planId] || PRICING_PLAN_META.premium;
  const prefix = PAYMENT_CONFIG.bank.referencePrefix || "SV";
  const planCode = meta.id === "business-pro" ? "BPRO" : meta.id === "premium" ? "PREM" : "FREE";
  const dateCode = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const timeCode = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  return `${prefix}-${planCode}-${dateCode}-${timeCode}`;
}
