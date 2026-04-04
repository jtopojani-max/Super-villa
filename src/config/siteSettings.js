export const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || "info@villa-apartamente.com";

export const SITE_SETTINGS = {
  siteName: "Villa-Apartamente",
  siteUrl: "https://villa-apartamente.com",
  contact: {
    email: CONTACT_EMAIL,
    emailHref: `mailto:${CONTACT_EMAIL}`,
    contactPageUrl: "https://villa-apartamente.com/#contact",
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61575465540788",
    instagram: "https://www.instagram.com/villa.apartamente/",
    tiktok: "https://www.tiktok.com/@villaapartamente",
  },
};

export function buildContactMailtoHref({ email = CONTACT_EMAIL, subject = "", body = "" } = {}) {
  const params = new URLSearchParams();

  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);

  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}
