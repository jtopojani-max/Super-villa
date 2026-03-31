/**
 * Converts a string to a URL-friendly slug.
 * "Villa Ardenne Ferizaj" → "villa-ardenne-ferizaj"
 */
export const toSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[ëç]/g, (ch) => (ch === "ë" ? "e" : "c"))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
