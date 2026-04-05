import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer, Icon, Navbar, WhatsAppButton } from "../components/Shared.jsx";
import { getExperienceConfig } from "../config/experiences.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateCategory, translateFeature } from "../i18n/ui.js";
import PropertyMap from "../components/Map/PropertyMap.jsx";
import ChatButton from "../components/Chat/ChatButton.jsx";
import ReviewSection from "../components/ReviewSection.jsx";
import { trackLeadAction, trackListingView } from "../services/analytics.js";
import { getListingById, listListings } from "../services/listings.js";
import { listPublicPosts } from "../services/posts.js";
import { toggleSavedListing } from "../services/users.js";
import {
  getExperienceCatalogPath,
  getExperienceDetailPath,
  getListingExperience,
  normalizeExperience,
} from "../utils/experience.js";
import { toSlug } from "../utils/slug.js";
import { FEATURE_ICONS } from "../utils/listingFeatures.js";
import airbnbLogo from "../assets/airbnb-tile.svg";

export default function PropertyDetailsPage({ user, onLogout, onUpdateUser, experience = "villas" }) {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const experienceKey = normalizeExperience(experience);
  const config = getExperienceConfig(experienceKey);
  const expKey = experienceKey === "apartments" ? "exp.apartments" : "exp.villas";
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteSubmitting, setFavoriteSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [similarListings, setSimilarListings] = useState([]);
  const touchStartRef = useRef(null);
  const trackedViewRef = useRef("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getListingById(id);
        if (!isMounted) return;

        if (!data) {
          setError(t("details.notFound"));
          setPost(null);
          return;
        }

        const canonicalExperience = getListingExperience(data);
        if (canonicalExperience !== experienceKey) {
          navigate(getExperienceDetailPath(canonicalExperience, id, data.title), { replace: true });
          return;
        }

        const correctSlug = toSlug(data.title);
        if (correctSlug && slug !== correctSlug) {
          navigate(getExperienceDetailPath(experienceKey, id, data.title), { replace: true });
          return;
        }

        setPost(data);
      } catch (loadError) {
        console.error("Failed to load listing details:", loadError);
        if (isMounted) setError(t("details.loadError"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) load();
    else {
      setError(t("details.notFound"));
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [experienceKey, id, navigate, slug, t]);

  const guests = post?.guests ?? post?.persons ?? post?.people ?? (post?.beds ? post.beds * 2 : null);
  const rooms = post?.rooms ?? post?.beds ?? null;
  const isFavorite = Boolean(user?.favorites?.includes(post?.id));
  const galleryImages = Array.isArray(post?.images) && post.images.length ? post.images : post?.image ? [post.image] : [];
  const safeImageIndex = galleryImages.length ? Math.min(activeImageIndex, galleryImages.length - 1) : 0;
  const mainImage = galleryImages[safeImageIndex] || "";

  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current <= 0 ? galleryImages.length - 1 : current - 1));
  };

  const showNextImage = () => {
    setActiveImageIndex((current) => (current >= galleryImages.length - 1 ? 0 : current + 1));
  };

  useEffect(() => {
    setActiveImageIndex(0);
  }, [post?.id]);

  const currentRoute = typeof window !== "undefined" ? window.location.pathname : "";
  const whatsappHref = post?.whatsapp ? `https://wa.me/${post.whatsapp}` : "";
  const phoneHref = post?.whatsapp ? `tel:${post.whatsapp}` : "";

  const openTrackedLink = useCallback(async (event, href, eventType) => {
    if (!href) return;

    const shouldOpenInNewTab = event?.currentTarget?.getAttribute("target") === "_blank";
    event?.preventDefault();

    let pendingWindow = null;
    if (typeof window !== "undefined" && shouldOpenInNewTab) {
      pendingWindow = window.open("", "_blank", "noopener,noreferrer");
      if (pendingWindow) pendingWindow.opener = null;
    }

    if (post?.id) {
      await Promise.race([
        trackLeadAction(post.id, eventType, currentRoute).catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);
    }

    if (pendingWindow && !pendingWindow.closed) {
      pendingWindow.location.href = href;
      return;
    }

    if (typeof window === "undefined") return;
    if (shouldOpenInNewTab) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.href = href;
  }, [currentRoute, post?.id]);

  const handleWhatsappClick = useCallback((event, href) => {
    void openTrackedLink(event, href, "whatsapp_click");
  }, [openTrackedLink]);

  const handlePhoneClick = useCallback((event, href) => {
    void openTrackedLink(event, href, "phone_click");
  }, [openTrackedLink]);

  useEffect(() => {
    if (!post?.id) return;
    if (trackedViewRef.current === post.id) return;
    trackedViewRef.current = post.id;
    void trackListingView(post.id, currentRoute);
  }, [currentRoute, post?.id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handler = (event) => setIsDesktop(event.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!post?.id) return;
    let isMounted = true;
    Promise.all([listListings(), listPublicPosts()])
      .then(([legacyListings, publicListings]) => {
        if (!isMounted) return;
        const seen = new Set();
        const all = [...publicListings, ...legacyListings].filter((listing) => {
          if (seen.has(listing.id)) return false;
          seen.add(listing.id);
          return true;
        });
        const others = all.filter((listing) => listing.id !== post.id);
        const cityWord = (post.location || "").split(",")[0].trim().toLowerCase();
        const byCategory = others.filter((listing) => listing.category === post.category);
        const byCity = others.filter((listing) => cityWord && listing.location?.toLowerCase().includes(cityWord));
        const merged = [...new Map([...byCategory, ...byCity].map((listing) => [listing.id, listing])).values()];
        setSimilarListings(merged.length >= 2 ? merged.slice(0, 4) : others.slice(0, 4));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [post?.category, post?.id, post?.location]);

  useEffect(() => {
    if (galleryImages.length < 2) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [galleryImages.length]);

  const handleToggleFavorite = async () => {
    if (!post?.id) return;
    if (!user?.id) {
      navigate("/login");
      return;
    }
    if (favoriteSubmitting) return;

    try {
      setFavoriteSubmitting(true);
      const didSave = await toggleSavedListing(user.id, post.id);
      onUpdateUser?.((currentUser) => {
        if (!currentUser) return currentUser;
        const currentFavorites = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
        const nextFavorites = didSave
          ? Array.from(new Set([...currentFavorites, post.id]))
          : currentFavorites.filter((listingId) => listingId !== post.id);
        return { ...currentUser, favorites: nextFavorites };
      });
    } catch (favoriteError) {
      console.error("Failed to update favorite from details view:", favoriteError);
    } finally {
      setFavoriteSubmitting(false);
    }
  };

  const showGalleryControls = galleryImages.length > 1;
  const categoryLabel = translateCategory(post?.category || "", t) || t(`${expKey}.label`);
  const saveLabel = lang === "en" ? "Saved" : "Ruajtur";
  const ownerFallback = lang === "en" ? "Owner" : "Pronari";

  const pageTitle = post ? `${post.title} - ${post.location || ""} | SuperVilla` : "SuperVilla";
  const pageDesc = post
    ? lang === "en"
      ? `${post.title} in ${post.location || "Kosovo"}. ${post.price ? `Price: € ${post.price}. ` : ""}Book now on SuperVilla.`
      : `${post.title} ne ${post.location || "Kosove"}. ${post.price ? `Cmimi: € ${post.price}. ` : ""}Rezervo tani ne SuperVilla.`
    : t("meta.siteDescription");
  const pageImage = post?.images?.[0] || "";
  const canonicalUrl = post
    ? `https://villa-apartamente.com${getExperienceDetailPath(experienceKey, id, post.title)}`
    : "";

  return (
    <div className={`experience ${config.themeClass}`}>
      {post && (
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDesc} />
          <meta property="og:url" content={canonicalUrl} />
          {pageImage && <meta property="og:image" content={pageImage} />}
          <meta property="og:type" content="website" />
        </Helmet>
      )}

      <Navbar user={user} onLogout={onLogout} experience={experienceKey} />

      <div className="detail-page">
        <div className="detail-page__container">
          <button className="detail-page__back" onClick={() => navigate(getExperienceCatalogPath(experienceKey))}>
            <Icon n="arrow-left" /> {t(`${expKey}.backLabel`)}
          </button>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
              <p>{t("details.loadingListing")}</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--error)" }}>
              <p>{error}</p>
              <button className="btn btn--primary" onClick={() => navigate(getExperienceCatalogPath(experienceKey))}>
                {t(`${expKey}.ctaLabel`)}
              </button>
            </div>
          ) : post && (
            <>
              <div className="detail-page__header">
                <h1 className="villa-details__title">{post.title}</h1>
                <button
                  className={`detail-page__fav-btn ${isFavorite ? "is-favorite" : ""}`}
                  onClick={handleToggleFavorite}
                  disabled={favoriteSubmitting}
                  aria-label={isFavorite ? saveLabel : t("common.save")}
                >
                  <Icon n={isFavorite ? "heart-circle-check" : "heart"} />
                </button>
              </div>

              <div className="detail-page__body">
                <div className="detail-page__main">
                  <div className="premium-gallery">
                    <div className="premium-gallery__content">
                      <div className="premium-gallery__main">
                        {mainImage ? (
                          <div
                            className="premium-gallery__stage"
                            onTouchStart={(event) => {
                              const touch = event.touches[0];
                              touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
                            }}
                            onTouchEnd={(event) => {
                              if (!showGalleryControls || !touchStartRef.current) return;
                              const touch = event.changedTouches[0];
                              if (!touch) return;
                              const deltaX = touch.clientX - touchStartRef.current.x;
                              const deltaY = touch.clientY - touchStartRef.current.y;
                              touchStartRef.current = null;
                              if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
                              if (deltaX < 0) showNextImage();
                              else showPreviousImage();
                            }}
                          >
                            <img className="premium-gallery__image" src={mainImage} alt={`${post.title} ${safeImageIndex + 1}`} />
                          </div>
                        ) : (
                          <div className="premium-gallery__placeholder"><Icon n="home" /></div>
                        )}

                        {showGalleryControls && (
                          <>
                            <button
                              type="button"
                              className="premium-gallery__arrow premium-gallery__arrow--prev"
                              onClick={showPreviousImage}
                              aria-label={t("common.previousImage")}
                            >
                              <Icon n="chevron-left" />
                            </button>
                            <button
                              type="button"
                              className="premium-gallery__arrow premium-gallery__arrow--next"
                              onClick={showNextImage}
                              aria-label={t("common.nextImage")}
                            >
                              <Icon n="chevron-right" />
                            </button>
                          </>
                        )}

                        {showGalleryControls && (
                          <div className="premium-gallery__counter">
                            {safeImageIndex + 1} / {galleryImages.length}
                          </div>
                        )}
                      </div>
                    </div>

                    {showGalleryControls && (
                      <div className="premium-gallery__thumbs">
                        {galleryImages.map((image, index) => (
                          <button
                            key={image}
                            type="button"
                            className={`premium-gallery__thumb${index === safeImageIndex ? " premium-gallery__thumb--active" : ""}`}
                            onClick={() => setActiveImageIndex(index)}
                            aria-label={`${lang === "en" ? "Image" : "Foto"} ${index + 1}`}
                          >
                            <img src={image} alt={`${post.title} thumbnail ${index + 1}`} className="premium-gallery__thumb-img" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="detail-page__sub-header">
                    <span className="detail-page__category-label">{categoryLabel}</span>
                    <p className="villa-details__location">
                      <Icon n="location-dot" /> {post.location}
                    </p>
                  </div>

                  <div className="detail-page__booking-card detail-page__booking-card--mobile">
                    <p className="detail-page__booking-label">{t("details.bookOrAsk")}</p>
                    <div className="detail-page__booking-price">
                      <span className="prop-card__price-pill">€ {post.price} {t("common.perNight")}</span>
                      {post.whatsapp && (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-page__whatsapp-icon"
                          onClick={(event) => handleWhatsappClick(event, whatsappHref)}
                          aria-label={t("common.contactWhatsApp")}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                          </svg>
                        </a>
                      )}
                      {post.hasAirbnb && post.airbnbUrl && (
                        <a
                          href={post.airbnbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-page__airbnb-icon"
                          aria-label={t("details.viewOnAirbnb")}
                        >
                          <img src={airbnbLogo} alt="" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="detail-page__booking-hint">{t("details.priceHint")}</p>
                  </div>

                  <div className="detail-page__card">
                    <div className="modal-meta villa-details__meta">
                      {rooms > 0 && <span className="modal-meta-item"><Icon n="door-open" /> {rooms} {t("common.rooms")}</span>}
                      <span className="modal-meta-item"><Icon n="bed" /> {post.beds} {t("common.beds")}</span>
                      <span className="modal-meta-item"><Icon n="bath" /> {post.baths} {t("common.bathrooms")}</span>
                      {post.area > 0 && <span className="modal-meta-item"><Icon n="ruler-combined" /> {post.area}m2</span>}
                      <span className="modal-meta-item"><Icon n="users" /> {guests ?? "-"} {t("common.guests")}</span>
                    </div>
                  </div>

                  {post.description && (
                    <div className="detail-page__card">
                      <p className="detail-page__card-heading">{t("details.descriptionLabel")}</p>
                      <p className="villa-details__description">{post.description}</p>
                    </div>
                  )}

                  {Array.isArray(post.features) && post.features.length > 0 && (
                    <div className="detail-page__card">
                      <p className="villa-details__feature-label">{t("details.featuresLabel")}</p>
                      <div className="property-features">
                        {post.features.map((feature) => (
                          <span key={feature} className="property-feature">
                            <Icon n={FEATURE_ICONS[feature] || "check"} /> {translateFeature(feature, t)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="detail-page__contact-card detail-page__contact-main" style={{ marginTop: 24 }}>
                    <p className="detail-page__contact-label">{t("details.ownerLabel")}</p>
                    <div className="detail-page__contact-info">
                      {(post.author || post.createdBy) && (
                        <p className="detail-page__contact-row">
                          <Icon n="user" />
                          <span>{post.author || post.createdBy}</span>
                        </p>
                      )}
                      {post.createdByEmail && (
                        <p className="detail-page__contact-row">
                          <Icon n="envelope" />
                          <span>{post.createdByEmail}</span>
                        </p>
                      )}
                      {post.whatsapp && (
                        <a className="detail-page__contact-row detail-page__contact-row--link" href={phoneHref} onClick={(event) => handlePhoneClick(event, phoneHref)}>
                          <Icon n="phone" />
                          <span>{post.whatsapp}</span>
                        </a>
                      )}
                      {post.companyName && (
                        <p className="detail-page__contact-row">
                          <Icon n="building" />
                          <span>{post.companyName}</span>
                        </p>
                      )}
                    </div>
                    <div className="detail-page__booking-actions">
                      <WhatsAppButton href={whatsappHref} size="lg" onClick={(event) => handleWhatsappClick(event, whatsappHref)} />
                      <ChatButton
                        listingId={post.id}
                        listingTitle={post.title}
                        ownerId={post.userId || post.ownerUid || post.createdByUid}
                        ownerName={post.author || post.createdBy || ownerFallback}
                        currentUser={user}
                        size="lg"
                        onNavigate={(conversationId) => navigate(`/messages/${conversationId}`)}
                      />
                    </div>
                    {post.hasAirbnb && post.airbnbUrl && (
                      <a
                        href={post.airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="airbnb-btn"
                        aria-label={t("details.viewOnAirbnb")}
                      >
                        <img src={airbnbLogo} alt="" width="22" height="22" className="airbnb-btn__icon" aria-hidden="true" />
                        {t("details.viewOnAirbnb")}
                      </a>
                    )}
                    <button className="btn btn--ghost btn--full" onClick={() => navigate(getExperienceCatalogPath(experienceKey))}>
                      <Icon n="arrow-left" /> {t(`${expKey}.backLabel`)}
                    </button>
                  </div>

                  <PropertyMap lat={post.lat} lng={post.lng} title={post.title} address={post.address} location={post.location} />

                  <ReviewSection listingId={post.id} user={user} />

                  {similarListings.length > 0 && (
                    <section className="similar-listings">
                      <h3 className="similar-listings__title">{t("details.similarTitle")}</h3>
                      <div className="similar-listings__grid">
                        {similarListings.map((item) => {
                          const thumb = Array.isArray(item.images) && item.images.length ? item.images[0] : item.image || "";
                          const itemExperience = getListingExperience(item);
                          return (
                            <div
                              key={item.id}
                              className="similar-listings__card"
                              onClick={() => navigate(getExperienceDetailPath(itemExperience, item.id, item.title))}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  navigate(getExperienceDetailPath(itemExperience, item.id, item.title));
                                }
                              }}
                            >
                              <div className="similar-listings__img-wrap">
                                {thumb ? (
                                  <img className="similar-listings__img" src={thumb} alt={item.title} />
                                ) : (
                                  <div className="similar-listings__img-placeholder"><Icon n="home" /></div>
                                )}
                                <span className="similar-listings__badge">{translateCategory(item.category, t) || item.category}</span>
                              </div>
                              <div className="similar-listings__info">
                                <p className="similar-listings__name">{item.title}</p>
                                <p className="similar-listings__loc"><Icon n="location-dot" /> {item.location}</p>
                                <span className="similar-listings__price">€ {item.price} {t("common.perNight")}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                <aside className="detail-page__sidebar">
                  <div className="detail-page__booking-card">
                    <p className="detail-page__booking-label">{t("details.bookOrAsk")}</p>
                    <div className="detail-page__booking-price">
                      <span className="prop-card__price-pill">€ {post.price} {t("common.perNight")}</span>
                      {post.whatsapp && (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-page__whatsapp-icon"
                          onClick={(event) => handleWhatsappClick(event, whatsappHref)}
                          aria-label={t("common.contactWhatsApp")}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                          </svg>
                        </a>
                      )}
                      {post.hasAirbnb && post.airbnbUrl && (
                        <a
                          href={post.airbnbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-page__airbnb-icon"
                          aria-label={t("details.viewOnAirbnb")}
                        >
                          <img src={airbnbLogo} alt="" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="detail-page__booking-hint">{t("details.priceHint")}</p>
                  </div>

                  <div className="detail-page__contact-card detail-page__contact-sidebar">
                    <p className="detail-page__contact-label">{t("details.ownerLabel")}</p>
                    <div className="detail-page__contact-info">
                      {(post.author || post.createdBy) && (
                        <p className="detail-page__contact-row">
                          <Icon n="user" />
                          <span>{post.author || post.createdBy}</span>
                        </p>
                      )}
                      {post.createdByEmail && (
                        <p className="detail-page__contact-row">
                          <Icon n="envelope" />
                          <span>{post.createdByEmail}</span>
                        </p>
                      )}
                      {post.whatsapp && (
                        <a className="detail-page__contact-row detail-page__contact-row--link" href={phoneHref} onClick={(event) => handlePhoneClick(event, phoneHref)}>
                          <Icon n="phone" />
                          <span>{post.whatsapp}</span>
                        </a>
                      )}
                      {post.companyName && (
                        <p className="detail-page__contact-row">
                          <Icon n="building" />
                          <span>{post.companyName}</span>
                        </p>
                      )}
                    </div>
                    <div className="detail-page__booking-actions">
                      <WhatsAppButton href={whatsappHref} size="lg" onClick={(event) => handleWhatsappClick(event, whatsappHref)} />
                      <ChatButton
                        listingId={post.id}
                        listingTitle={post.title}
                        ownerId={post.userId || post.ownerUid || post.createdByUid}
                        ownerName={post.author || post.createdBy || ownerFallback}
                        currentUser={user}
                        size="lg"
                        onNavigate={(conversationId) => navigate(`/messages/${conversationId}`)}
                      />
                    </div>
                    {post.hasAirbnb && post.airbnbUrl && (
                      <a
                        href={post.airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="airbnb-btn"
                        aria-label={t("details.viewOnAirbnb")}
                      >
                        <img src={airbnbLogo} alt="" width="22" height="22" className="airbnb-btn__icon" aria-hidden="true" />
                        {t("details.viewOnAirbnb")}
                      </a>
                    )}
                    <button className="btn btn--ghost btn--full" onClick={() => navigate(getExperienceCatalogPath(experienceKey))}>
                      <Icon n="arrow-left" /> {t(`${expKey}.backLabel`)}
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer experience={experienceKey} />
    </div>
  );
}
