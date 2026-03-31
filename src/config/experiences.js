export const EXPERIENCE_ORDER = ["villas", "apartments"];

export const EXPERIENCE_CONFIG = {
  villas: {
    key: "villas",
    label: "Vila",
    singularLabel: "vile",
    route: "/villas",
    detailBasePath: "/villa",
    homeQueryValue: "villas",
    themeClass: "experience--villas",
    navLabel: "Villat",
    hero: {
      eyebrow: "Platforma numër 1 në Kosovë",
      titlePrefix: "Zbulo vilen",
      titleEmphasis: "tende ideale",
      subtitle: "Rezorte private, vila familjare dhe destinacione për fundjavë, të përzgjedhuna për një qëndrim të rehatshëm dhe cilësor.",
      highlight: "Perzgjedhje pushimi",
    },
    search: {
      ariaLabel: "Kerko vila",
      keywordPlaceholder: "Kerko vile, kabina ose resorte...",
      buttonLabel: "Kerko",
    },
    stats: {
      satisfiedValue: "1200+",
      satisfiedLabel: "Kliente te kenaqur",
      experienceValue: "5",
      experienceLabel: "Vite eksperience",
    },
    listingSection: {
      tag: "Prona resort & fundjave",
      title: "Shpalljet me te fundit per vila",
      empty: "Nuk u gjeten vila per kete kerkim.",
      cta: "Shiko te gjitha villat",
      quickFilters: ["", "Prishtine", "Prizren", "Peje", "Brezovice"],
    },
    categoryOptions: [
      { value: "", label: "Te gjitha kategorite" },
      { value: "Villa", label: "Vile" },
    ],
    services: {
      tag: "Pse ne?",
      title: "Sherbime te plota per vila",
      items: [
        { icon: "magnifying-glass-location", title: "Kërkim i mençur", desc: "Rezultate të përshtatshme për vila, resorte dhe pushime për fundjavë." },
        { fab: "whatsapp", title: "Kontakt direkt", desc: "Lidhu direkt me pronarin ose menaxherin e pronës në WhatsApp." },
        { icon: "shield-halved", title: "Prona të verifikuara", desc: "Shpalljet kalojnë verifikim para se të publikohen në platformë." },
        { icon: "bolt", title: "Postim i shpejtë", desc: "Publiko vilën tënde në pak minuta me një proces të qartë." },
      ],
    },
    contact: {
      tag: "Kontakt",
      title: "Na kontakto per vila cilesore",
      cardTitle: "Na dergo mesazh",
      cardCopy: "Ekipi yne te ndihmon me pyetje rreth rezervimeve, postimeve dhe promovimit.",
      submitLabel: "Dergo mesazh",
    },
    catalog: {
      tag: "Postimet e perdoruesve",
      title: "Te gjitha villat",
      empty: "Nuk ka ende vila te publikuara.",
    },
    details: {
      backLabel: "Kthehu te villat",
      ctaLabel: "Shiko villat",
      priceSuffix: "/nate",
    },
  },
  apartments: {
    key: "apartments",
    label: "Apartamente",
    singularLabel: "apartament",
    route: "/apartments",
    detailBasePath: "/apartments",
    homeQueryValue: "apartments",
    themeClass: "experience--apartments",
    navLabel: "Apartamentet",
    hero: {
      eyebrow: "Platforma numër 1 në Kosovë",
      titlePrefix: "Gjej apartamentin",
      titleEmphasis: "qe pershtatet me ritmin tend",
      subtitle: "Prona ne qender, studio moderne dhe apartamente cilesore me pamje bashkekohore.",
      highlight: "Perzgjedhje qyteti",
    },
    search: {
      ariaLabel: "Kerko apartamente",
      keywordPlaceholder: "Kerko apartament, studio ose penthouse...",
      buttonLabel: "Eksploro",
    },
    stats: {
      satisfiedValue: "850+",
      satisfiedLabel: "Qendrime ne qytet",
      experienceValue: "24/7",
      experienceLabel: "Disponueshmeri e shpejte",
    },
    listingSection: {
      tag: "Perzgjedhje ne qytet",
      title: "Apartamentet me te kerkuara",
      empty: "Nuk u gjeten apartamente per kete kerkim.",
      cta: "Shiko te gjitha apartamentet",
      quickFilters: ["", "Prishtine", "Ferizaj", "Prizren", "Gjilan"],
    },
    categoryOptions: [
      { value: "", label: "Te gjitha kategorite" },
      { value: "Apartament", label: "Apartament" },
      { value: "Studio", label: "Studio" },
      { value: "Penthouse", label: "Apartament panoramik" },
      { value: "Duplex", label: "Dupleks" },
    ],
    services: {
      tag: "Zgjidhje per qytetin",
      title: "Sherbime te dizajnuara per apartamente",
      items: [
        { icon: "tower-city", title: "Filtrim sipas zones", desc: "Kerko sipas zonave, cmimit dhe tipit te qendrimit me nje proces me te shpejte." },
        { icon: "sparkles", title: "Përzgjedhje premium", desc: "Prona moderne, studio dhe apartamente panoramike për ata që kërkojnë rehati dhe pamje të bukur." },
        { fab: "whatsapp", title: "Kontakt i menjehershem", desc: "Lidhu me host-in pa humbur kohe, direkt nga karta e prones." },
        { icon: "chart-line", title: "Me shume dukshmeri", desc: "Publikim i qarte per agjente dhe pronare ne tregun e qytetit." },
      ],
    },
    contact: {
      tag: "Mbeshtetje ne qytet",
      title: "Na kontakto per apartamente ne qytet",
      cardTitle: "Planifiko qendrimin tend",
      cardCopy: "Na shkruaj per qira afatshkurtra, apartamente te reja dhe hapesira cilesore ne qytet.",
      submitLabel: "Dergo kerkesen",
    },
    catalog: {
      tag: "Shpallje ne qytet",
      title: "Te gjitha apartamentet",
      empty: "Nuk ka ende apartamente te publikuara.",
    },
    details: {
      backLabel: "Kthehu te apartamentet",
      ctaLabel: "Shiko apartamentet",
      priceSuffix: "/nate",
    },
  },
};

export const getExperienceConfig = (experience = "villas") =>
  EXPERIENCE_CONFIG[experience] || EXPERIENCE_CONFIG.villas;
