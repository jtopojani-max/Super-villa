const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

const CATEGORY_KEYWORDS = {
  Villa: ["villa", "ville", "vil"],
  Apartament: ["apartament", "apartment", "banese", "flat"],
  Shtepi: ["shtepi", "house", "home"],
  Kabine: ["kabine", "cabin", "bungalow", "chalet"],
  Hotel: ["hotel", "resort", "motel"],
};

const EXTRA_WEBSITE_TERMS = [
  "supervilla",
  "prona",
  "listim",
  "booking",
  "akomodim",
  "qera",
  "udhetim",
  "kontakt",
  "profili",
];

export const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value = "") => normalizeText(value).split(" ").filter(Boolean);

const levenshteinDistance = (a, b) => {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
};

const getAllowedTypoDistance = (tokenLength) => {
  if (tokenLength <= 4) return 0;
  if (tokenLength <= 7) return 1;
  return 2;
};

export const inferCategory = (listing = {}) => {
  const explicit = listing.category || listing.type || listing.propertyType || "";
  if (explicit) return explicit;
  const haystack = normalizeText(`${listing.title || ""} ${listing.description || ""}`);
  const found = Object.entries(CATEGORY_KEYWORDS).find(([, keywords]) => keywords.some((key) => haystack.includes(key)));
  return found?.[0] || "Tjeter";
};

const buildSearchText = (listing = {}) => {
  const category = inferCategory(listing);
  return normalizeText(
    [
      listing.title,
      listing.description,
      listing.location,
      listing.author,
      listing.createdByEmail,
      listing.companyName,
      listing.company,
      listing.profileName,
      category,
      ...EXTRA_WEBSITE_TERMS,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

const scoreByTokens = (queryTokens, searchTokens) => {
  let score = 0;
  queryTokens.forEach((queryToken) => {
    let best = 0;
    searchTokens.forEach((searchToken) => {
      if (searchToken === queryToken) {
        best = Math.max(best, 10);
      } else if (searchToken.startsWith(queryToken)) {
        best = Math.max(best, 7);
      } else if (searchToken.includes(queryToken)) {
        best = Math.max(best, 5);
      } else {
        const distance = levenshteinDistance(queryToken, searchToken);
        if (distance <= getAllowedTypoDistance(queryToken.length)) {
          best = Math.max(best, 3);
        }
      }
    });
    score += best;
  });
  return score;
};

export const getSmartScore = (listing, query) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;
  const searchableText = buildSearchText(listing);
  if (!searchableText) return 0;

  let score = 0;
  if (searchableText.includes(normalizedQuery)) score += 20;

  const queryTokens = tokenize(normalizedQuery);
  const searchTokens = tokenize(searchableText);
  score += scoreByTokens(queryTokens, searchTokens);

  if (normalizeText(listing.location).includes(normalizedQuery)) score += 8;
  if (normalizeText(inferCategory(listing)).includes(normalizedQuery)) score += 8;
  if (normalizeText(listing.title).includes(normalizedQuery)) score += 12;

  return score;
};

export const getSmartSuggestions = (listings, query, limit = 6) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  return listings
    .map((listing) => ({
      listing,
      score: getSmartScore(listing, normalizedQuery),
      category: inferCategory(listing),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
