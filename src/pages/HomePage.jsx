import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ExperienceSwitch from "../components/ExperienceSwitch.jsx";
import { Footer, Icon, Navbar, PremiumSection, PropertyCard } from "../components/Shared.jsx";
import { getExperienceConfig } from "../config/experiences.js";
import { SITE_SETTINGS, buildContactMailtoHref } from "../config/siteSettings.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { listListings } from "../services/listings.js";
import { listPublicPosts } from "../services/posts.js";
import { toggleSavedListing } from "../services/users.js";
import { CITIES } from "../utils/storage.js";
import { getSmartScore, getSmartSuggestions, inferCategory, normalizeText } from "../utils/smartSearch.js";
import {
  filterListingsByExperience,
  getExperienceCatalogPath,
  getExperienceDetailPath,
  getExperienceHomePath,
  getListingExperience,
  normalizeExperience,
} from "../utils/experience.js";

const PRICE_KEYS = [
  { value: "", key: "priceOptions.any" },
  { value: "100", key: "priceOptions.upTo100" },
  { value: "200", key: "priceOptions.upTo200" },
  { value: "500", key: "priceOptions.upTo500" },
  { value: "1000", key: "priceOptions.upTo1000" },
  { value: "1500", key: "priceOptions.upTo1500" },
  { value: "2000", key: "priceOptions.upTo2000" },
];

const KOSOVO_TOURIST_LOCATIONS = [
  "Brezovice",
  "Prevalle",
  "Boga",
  "Rugove",
  "Mirusha",
  "Batllava",
  "Germia",
  "Shterpce",
];

const normalizeLocationValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const formatTypeCount = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural}`;

const formatLocationCountLabel = (location, counts = {}, experience = "villas") => {
  const currentCount = counts[experience] || 0;

  if (currentCount <= 0) {
    return location;
  }

  const formattedCount =
    experience === "apartments"
      ? formatTypeCount(currentCount, "apartament", "apartamente")
      : formatTypeCount(currentCount, "vile", "vila");

  return `${location} (${formattedCount})`;
};

function SelectField({ label, icon, value, onChange, options }) {
  return (
    <div className="search-strip__cell">
      <span className="search-field__label">
        {icon && <Icon n={icon} />}
        {label}
      </span>
      <div className="search-native-wrap">
        <select className="search-native-select" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon n="chevron-down" className="search-native-arrow" />
      </div>
    </div>
  );
}

const resolveExperienceFromSearch = (search) => {
  const params = new URLSearchParams(search);
  return normalizeExperience(params.get("mode") || "villas");
};

export default function HomePage({ user, onLogout, onUpdateUser }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const locationState = useLocation();
  const experience = resolveExperienceFromSearch(locationState.search);
  const config = getExperienceConfig(experience);
  const expKey = experience === "apartments" ? "exp.apartments" : "exp.villas";
  const priceOptions = useMemo(() => PRICE_KEYS.map((p) => ({ value: p.value, label: t(p.key) })), [t]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [pill, setPill] = useState("");
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const keywordFieldRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        const [oldListings, moderatedPosts] = await Promise.all([listListings(), listPublicPosts()]);
        const data = [...moderatedPosts, ...oldListings];
        if (isMounted) setPosts(data);
      } catch (loadError) {
        console.error("Failed to load listings:", loadError);
        if (isMounted) setError(t("errors.listingsLoadFailed"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setKeyword("");
    setLocation("");
    setCategory("");
    setMaxPrice("");
    setPill("");
    setShowSuggestions(false);
  }, [experience]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (keywordFieldRef.current?.contains(event.target)) return;
      setShowSuggestions(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (locationState.state?.scrollTarget !== "hero-bg") return;

    const frameId = window.requestAnimationFrame(() => {
      const heroBackground = document.getElementById("hero-bg") || document.querySelector(".hero__bg");
      heroBackground?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [locationState.key, locationState.state]);

  const experiencePosts = useMemo(
    () => filterListingsByExperience(posts, experience),
    [posts, experience]
  );

  const locationCounts = useMemo(
    () =>
      posts.reduce((accumulator, post) => {
        const locationName = normalizeLocationValue(post.location);
        if (!locationName) return accumulator;

        const experienceKey = getListingExperience(post);
        const currentCounts = accumulator[locationName] || { villas: 0, apartments: 0 };
        currentCounts[experienceKey] += 1;
        accumulator[locationName] = currentCounts;
        return accumulator;
      }, {}),
    [posts]
  );

  const cityOptions = useMemo(() => {
    const cityPool = experience === "apartments" ? CITIES : [...CITIES, ...KOSOVO_TOURIST_LOCATIONS];
    const merged = Array.from(
      new Set([
        ...cityPool.map(normalizeLocationValue).filter(Boolean),
        ...experiencePosts.map((post) => normalizeLocationValue(post.location)).filter(Boolean),
      ])
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: "", label: t("common.allLocations") },
      ...merged.map((value) => ({
        value,
        label: formatLocationCountLabel(value, locationCounts[value], experience),
      })),
    ];
  }, [experience, experiencePosts, locationCounts]);

  const suggestions = useMemo(
    () => getSmartSuggestions(experiencePosts, keyword, 5),
    [experiencePosts, keyword]
  );

  const filtered = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);

    return experiencePosts
      .filter((listing) => {
        const listingCategory = listing.category || inferCategory(listing);
        if (location && listing.location !== location) return false;
        if (pill && listing.location !== pill) return false;
        if (category && listingCategory !== category) return false;
        if (maxPrice && Number(listing.price) > Number(maxPrice)) return false;
        if (!normalizedKeyword) return true;
        return getSmartScore(listing, normalizedKeyword) > 0;
      })
      .sort((a, b) => {
        if (!normalizedKeyword) return 0;
        return getSmartScore(b, normalizedKeyword) - getSmartScore(a, normalizedKeyword);
      });
  }, [category, experiencePosts, keyword, location, maxPrice, pill]);

  const toggleFavorite = async (post) => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    try {
      const didSave = await toggleSavedListing(user.id, post.id);
      onUpdateUser((currentUser) => {
        if (!currentUser) return currentUser;
        const currentFavorites = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
        const nextFavorites = didSave
          ? Array.from(new Set([...currentFavorites, post.id]))
          : currentFavorites.filter((id) => id !== post.id);
        return { ...currentUser, favorites: nextFavorites };
      });
    } catch (favoriteError) {
      console.error("Failed to toggle favorite:", favoriteError);
      setError(t("errors.favoriteSaveError"));
    }
  };

  const handleDeleteListing = (listingId) => {
    setPosts((prev) => prev.filter((post) => post.id !== listingId));
    onUpdateUser?.((currentUser) => {
      if (!currentUser) return currentUser;
      const favorites = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
      return { ...currentUser, favorites: favorites.filter((id) => id !== listingId) };
    });
  };

  const setContactField = (field, value) => {
    setContactForm((current) => ({ ...current, [field]: value }));
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();

    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const message = contactForm.message.trim();
    if (!name || !email || !message) return;

    const mailtoHref = buildContactMailtoHref({
      subject: `${SITE_SETTINGS.siteName} - ${t(`${expKey}.contactTitle`)}`,
      body: [
        `${t("home.formName")}: ${name}`,
        `${t("home.formEmail")}: ${email}`,
        "",
        `${t("home.formMessage")}:`,
        message,
      ].join("\n"),
    });

    if (typeof window !== "undefined") {
      window.location.href = mailtoHref;
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPill("");
    setShowSuggestions(false);
  };

  return (
    <div className={`experience ${config.themeClass}`}>
      <Navbar user={user} onLogout={onLogout} experience={experience} />

      <section className="hero">
        <div id="hero-bg" className="hero__bg" />
        <div className="hero__content">
          <div className="hero__topbar">
            <ExperienceSwitch
              value={experience}
              onChange={(nextExperience) => navigate(getExperienceHomePath(nextExperience))}
              className="hero__switch"
            />
          </div>

          <div className="hero__copy">
            <p className="hero__label">{t(`${expKey}.heroEyebrow`)}</p>
            <h1 className="hero__title">
              {t(`${expKey}.heroTitlePrefix`)}
              <br />
              <em>{t(`${expKey}.heroTitleEmphasis`)}</em>
            </h1>
            <p className="hero__sub">{t(`${expKey}.heroSubtitle`)}</p>
          </div>

          <div className="search-shell">
            <form className="search-strip" onSubmit={handleSearch} aria-label={t(`${expKey}.searchAriaLabel`)}>
              <div ref={keywordFieldRef} className="search-strip__cell search-strip__cell--keyword">
                <span className="search-field__label">
                  <Icon n="magnifying-glass" />
                  {t("home.searchLabel")}
                </span>
                <div className={`search-text ${showSuggestions && suggestions.length ? "is-open" : ""}`}>
                  <input
                    className="search-text__input"
                    placeholder={t(`${expKey}.searchPlaceholder`)}
                    value={keyword}
                    onChange={(event) => {
                      setKeyword(event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    aria-label={t("home.smartSearch")}
                  />
                  <Icon n="sparkles" className="search-text__icon" />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="search-floating-menu search-floating-menu--suggest">
                    {suggestions.map((item) => (
                      <li key={item.listing.id}>
                        <button
                          type="button"
                          className="search-suggest__option"
                          onClick={() => {
                            setKeyword(item.listing.title);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="search-suggest__title">{item.listing.title}</span>
                          <span className="search-suggest__meta">
                            {item.listing.location} - {item.category}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <SelectField label={t("home.locationLabel")} icon="location-dot" value={location} onChange={setLocation} options={cityOptions} />
              <SelectField label={t("home.priceLabel")} icon="tag" value={maxPrice} onChange={setMaxPrice} options={priceOptions} />

              <button className="search-strip__btn" type="submit">
                <Icon n="magnifying-glass" />
                {t(`${expKey}.searchBtn`)}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Premium section: replaces the previous stats block for both experiences. */}
      <PremiumSection user={user} collectionName={experience} limitCount={6} />

      <section className="listings" id="categories">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-tag">{t(`${expKey}.listingTag`)}</p>
              <h2 className="section-title">{t(`${expKey}.listingTitle`)}</h2>
            </div>
            <div className="filter-pills">
              {config.listingSection.quickFilters.map((cityValue) => (
                <button
                  key={cityValue}
                  className={`filter-pill ${pill === cityValue ? "active" : ""}`}
                  onClick={() => setPill(cityValue)}
                >
                  {cityValue || t("admin.all")}
                </button>
              ))}
            </div>
          </div>
          <div className="listings-grid">
            {loading ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                <p>{t("common.loading")}</p>
              </div>
            ) : error ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--error)" }}>
                <p>{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                <Icon n="house-circle-xmark" style={{ fontSize: "2.5rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                <p>{t(`${expKey}.listingEmpty`)}</p>
              </div>
            ) : (
              filtered.map((post) => (
                <PropertyCard
                  key={post.id}
                  post={post}
                  experience={experience}
                  to={getExperienceDetailPath(experience, post.id, post.title)}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={Boolean(user?.favorites?.includes(post.id))}
                  onDelete={handleDeleteListing}
                />
              ))
            )}
          </div>
          <div className="listings__cta">
            <button className="btn btn--primary" onClick={() => navigate(getExperienceCatalogPath(experience))}>
              {t(`${expKey}.listingCta`)}
            </button>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="container contact__inner">
          <div>
            <p className="section-tag">{t(`${expKey}.contactTag`)}</p>
            <h2 className="section-title">{t(`${expKey}.contactTitle`)}</h2>
            <div style={{ marginTop: 24 }}>
              <div className="contact__item">
                <span className="contact__icon-box"><Icon n="location-dot" size={20} /></span>
                <div>
                  <strong>{t("home.address")}</strong>
                  <span>{t("home.addressValue")}</span>
                </div>
              </div>
              <div className="contact__item">
                <a
                  className="contact__icon-box contact__icon-box--link"
                  href={SITE_SETTINGS.contact.emailHref}
                  aria-label={`${t("home.emailLabel")}: ${SITE_SETTINGS.contact.email}`}
                >
                  <Icon n="envelope" size={20} />
                </a>
                <div>
                  <strong>{t("home.emailLabel")}</strong>
                  <a className="contact__value-link" href={SITE_SETTINGS.contact.emailHref}>
                    {SITE_SETTINGS.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="form-card contact__form-card">
            <h3 className="contact__form-card-title">{t(`${expKey}.contactCardTitle`)}</h3>
            <p className="contact__form-card-copy">{t(`${expKey}.contactCardCopy`)}</p>
            <form onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>{t("home.formName")}</label>
                <input
                  type="text"
                  placeholder={t("home.formNamePlaceholder")}
                  value={contactForm.name}
                  onChange={(event) => setContactField("name", event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t("home.formEmail")}</label>
                <input
                  type="email"
                  placeholder={t("home.formEmailPlaceholder")}
                  value={contactForm.email}
                  onChange={(event) => setContactField("email", event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t("home.formMessage")}</label>
                <textarea
                  rows={4}
                  placeholder={t("home.formMessagePlaceholder")}
                  value={contactForm.message}
                  onChange={(event) => setContactField("message", event.target.value)}
                  required
                />
              </div>
              <button className="submit-btn" type="submit">
                {t(`${expKey}.contactSubmit`)}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer experience={experience} />
    </div>
  );
}
