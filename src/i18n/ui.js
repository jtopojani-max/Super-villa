export const getLocaleFromLang = (lang = "sq") => (lang === "en" ? "en-US" : "sq-AL");

const CATEGORY_TRANSLATION_KEYS = {
  villa: "common.villa",
  apartament: "common.apartment",
  apartment: "common.apartment",
  studio: "common.studio",
  penthouse: "common.penthouse",
  duplex: "common.duplex",
  "apartament panoramik": "common.panoramic",
};

const FEATURE_TRANSLATION_KEYS = {
  wifi: "features.wifi",
  kondicioner: "features.airConditioning",
  "pishine e jashtme": "features.outdoorPool",
  "pishine e brendshme": "features.indoorPool",
  xhakuzi: "features.hotTub",
  "parking privat": "features.privateParking",
  "pamje nga mali": "features.mountainView",
  "pamje nga deti": "features.seaView",
  bbq: "features.bbq",
  ballkon: "features.balcony",
  ashensor: "features.elevator",
  "pamje nga qyteti": "features.cityView",
  parking: "features.parking",
};

export const getCategoryTranslationKey = (category = "") =>
  CATEGORY_TRANSLATION_KEYS[String(category || "").trim().toLowerCase()] || null;

export const translateCategory = (category, t) => {
  const key = getCategoryTranslationKey(category);
  return key ? t(key) : category;
};

export const getFeatureTranslationKey = (feature = "") =>
  FEATURE_TRANSLATION_KEYS[String(feature || "").trim().toLowerCase()] || null;

export const translateFeature = (feature, t) => {
  const key = getFeatureTranslationKey(feature);
  return key ? t(key) : feature;
};

export const formatUiDate = (value, lang = "sq", options) => {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString(getLocaleFromLang(lang), options);
  } catch (_) {
    return "";
  }
};

export const formatUiDateOnly = (value, lang = "sq", options) => {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString(getLocaleFromLang(lang), options);
  } catch (_) {
    return "";
  }
};

export const formatRelativeTime = (value, t) => {
  if (!value) return "";

  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) return t("messages.now");
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} ${t("messages.minuteShort")}`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} ${t("messages.hourShort")}`;
  return `${Math.floor(diffSeconds / 86400)} ${t("messages.dayShort")}`;
};
