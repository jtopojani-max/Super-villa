export const FEATURE_ICONS = {
  "WiFi": "wifi",
  "Kondicioner": "snowflake",
  "Pishine e jashtme": "water-ladder",
  "Pishine e brendshme": "person-swimming",
  "Xhakuzi": "hot-tub-person",
  "Parking Privat": "square-parking",
  "Pamje nga Mali": "mountain-sun",
  "Pamje nga Deti": "water",
  "BBQ": "fire-burner",
  "Ballkon": "building",
  "Ashensor": "elevator",
  "Pamje nga Qyteti": "city",
  "Parking": "square-parking",
};

export const FEATURE_OPTIONS_BY_CATEGORY = {
  Villa: [
    "WiFi",
    "Kondicioner",
    "Pishine e jashtme",
    "Pishine e brendshme",
    "Xhakuzi",
    "Parking Privat",
    "Pamje nga Mali",
    "Pamje nga Deti",
    "BBQ",
  ],
  Apartament: [
    "Ballkon",
    "Ashensor",
    "WiFi",
    "Kondicioner",
    "Pamje nga Qyteti",
    "Pamje nga Deti",
    "Parking",
  ],
};

const FEATURE_CATEGORY_ALIASES = new Map([
  ["villa", "Villa"],
  ["apartament", "Apartament"],
  ["apartment", "Apartament"],
]);

const normalizeFeatureValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const resolveFeatureCategory = (category = "") =>
  FEATURE_CATEGORY_ALIASES.get(String(category || "").trim().toLowerCase()) || null;

export const getFeatureOptionsForCategory = (category = "") => {
  const resolvedCategory = resolveFeatureCategory(category);
  return resolvedCategory ? FEATURE_OPTIONS_BY_CATEGORY[resolvedCategory] : [];
};

export const normalizeListingFeatures = (features = [], category = "") => {
  const allowedFeatures = new Set(getFeatureOptionsForCategory(category));
  if (!allowedFeatures.size || !Array.isArray(features)) return [];

  return Array.from(
    new Set(
      features
        .map(normalizeFeatureValue)
        .filter((feature) => allowedFeatures.has(feature))
    )
  );
};
