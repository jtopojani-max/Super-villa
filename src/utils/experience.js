import { getExperienceConfig } from "../config/experiences.js";
import { inferCategory } from "./smartSearch.js";
import { toSlug } from "./slug.js";

const APARTMENT_CATEGORY_ALIASES = new Set([
  "apartament",
  "apartment",
  "studio",
  "penthouse",
  "duplex",
  "loft",
]);

const normalizeCategory = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

export const normalizeExperience = (value = "villas") =>
  value === "apartments" ? "apartments" : "villas";

export const getListingExperience = (listing) => {
  const category = normalizeCategory(listing?.category || inferCategory(listing));
  return APARTMENT_CATEGORY_ALIASES.has(category) ? "apartments" : "villas";
};

export const filterListingsByExperience = (listings = [], experience = "villas") =>
  listings.filter((listing) => getListingExperience(listing) === normalizeExperience(experience));

export const getExperienceHomePath = (experience = "villas") => {
  const resolved = normalizeExperience(experience);
  return resolved === "apartments" ? "/?mode=apartments" : "/";
};

export const getPricingPlansPath = (experience = "villas") => {
  const resolved = normalizeExperience(experience);
  return resolved === "apartments" ? "/pricing-plans?mode=apartments" : "/pricing-plans";
};

export const getPremiumPlanNavigationTarget = (experience = "villas", listingId = "") => {
  const pricingPath = getPricingPlansPath(experience);
  const [pathname, currentSearch = ""] = pricingPath.split("?");
  const searchParams = new URLSearchParams(currentSearch);

  searchParams.set("planId", "premium");

  if (listingId) {
    searchParams.set("listingId", listingId);
  } else {
    searchParams.delete("listingId");
  }

  return {
    pathname,
    search: `?${searchParams.toString()}`,
  };
};

export const getExperienceCatalogPath = (experience = "villas") =>
  getExperienceConfig(normalizeExperience(experience)).route;

export const getExperienceDetailPath = (experience = "villas", listingId = "", title = "") => {
  const config = getExperienceConfig(normalizeExperience(experience));
  const slug = toSlug(title);
  return slug
    ? `${config.detailBasePath}/${listingId}/${slug}`
    : `${config.detailBasePath}/${listingId}`;
};
