import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer, Icon, Navbar, WhatsAppButton } from "../components/Shared.jsx";
import { getExperienceConfig } from "../config/experiences.js";
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
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function PropertyDetailsPage({
  user,
  onLogout,
  onUpdateUser,
  experience = "villas",
}) {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
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

    if (id) {
      load();
    } else {
      setError(t("details.notFound"));
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [experienceKey, id, navigate, t]);

  const guests = post?.guests ?? post?.persons ?? post?.people ?? (post?.beds ? post.beds * 2 : null);
  const rooms = post?.rooms ?? post?.beds ?? null;
  const isFavorite = Boolean(user?.favorites?.includes(post?.id));
  const galleryImages =
    Array.isArray(post?.images) && post.images.length
      ? post.images
      : post?.image
        ? [post.image]
        : [];
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

  const currentRoute =
    typeof window !== "undefined" ? window.location.pathname : "";

  const handleWhatsappClick = useCallback(() => {
    if (!post?.id) return;
    void trackLeadAction(post.id, "whatsapp_click", currentRoute);
  }, [currentRoute, post?.id]);

  const handlePhoneClick = useCallback(() => {
    if (!post?.id) return;
    void trackLeadAction(post.id, "phone_click", currentRoute);
  }, [currentRoute, post?.id]);

  useEffect(() => {
    if (!post?.id) return;
    if (trackedViewRef.current === post.id) return;

    trackedViewRef.current = post.id;
    void trackListingView(post.id, currentRoute);
  }, [currentRoute, post?.id]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!post?.id) return;
    let isMounted = true;
    Promise.all([listListings(), listPublicPosts()]).then(([old, pub]) => {
      if (!isMounted) return;
      const seen = new Set();
      const all = [...pub, ...old].filter((l) => { if (seen.has(l.id)) return false; seen.add(l.id); return true; });
      const others = all.filter((l) => l.id !== post.id);
      const cityWord = (post.location || "").split(",")[0].trim().toLowerCase();
      const byCategory = others.filter((l) => l.category === post.category);
      const byCity = others.filter((l) => cityWord && l.location?.toLowerCase().includes(cityWord));
      const merged = [...new Map([...byCategory, ...byCity].map((l) => [l.id, l])).values()];
      setSimilarListings(merged.length >= 2 ? merged.slice(0, 4) : others.slice(0, 4));
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [post?.id, post?.category, post?.location]);

  useEffect(() => {
    if (galleryImages.length < 2) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        setActiveImageIndex((current) => (current <= 0 ? galleryImages.length - 1 : current - 1));
      }

      if (event.key === "ArrowRight") {
        setActiveImageIndex((current) => (current >= galleryImages.length - 1 ? 0 : current + 1));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
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
  const categoryLabel = post?.category || config.label;

  const pageTitle = post ? `${post.title} - ${post.location || ""} | SuperVilla` : "SuperVilla";
  const pageDesc = post
    ? `${post.title} në ${post.location || "Kosovë"}. ${post.price ? `Çmimi: €${post.price}` : ""} - Rezervo tani në SuperVilla.`
    : "Gjeni pronën tuaj ideale në SuperVilla.";
  const pageImage = post?.images?.[0] || "";
  const canonicalUrl = post
    ? `https://supervilla.com${getExperienceDetailPath(experienceKey, id, post.title)}`
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
          {/* Back navigation */}
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
                {config.details.ctaLabel}
              </button>
            </div>
          ) : post && (
            <>
              {/* Title + Save — above gallery */}
              <div className="detail-page__header">
                <h1 className="villa-details__title">{post.title}</h1>
                <button
                  className={`detail-page__fav-btn ${isFavorite ? "is-favorite" : ""}`}
                  onClick={handleToggleFavorite}
                  disabled={favoriteSubmitting}
                  aria-label={isFavorite ? "Ruajtur" : "Ruaj"}
                >
                  <Icon n={isFavorite ? "heart-circle-check" : "heart"} />
                </button>
              </div>

              {/* 2-Column Layout: Gallery+Info (left) + Sidebar (right) */}
              <div className="detail-page__body">
                {/* Left Column — Gallery + Main Info */}
                <div className="detail-page__main">
                  {/* Gallery Section */}
                  <div className="premium-gallery">
                    <div className="premium-gallery__content">
                      {/* Main Image Area */}
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
                            <img className="premium-gallery__image" src={mainImage} alt={`${post.title} foto ${safeImageIndex + 1}`} />
                          </div>
                        ) : (
                          <div className="premium-gallery__placeholder"><Icon n="home" /></div>
                        )}

                        {/* Navigation Arrows */}
                        {showGalleryControls && (
                          <>
                            <button
                              type="button"
                              className="premium-gallery__arrow premium-gallery__arrow--prev"
                              onClick={showPreviousImage}
                              aria-label="Fotoja paraprake"
                            >
                              <Icon n="chevron-left" />
                            </button>
                            <button
                              type="button"
                              className="premium-gallery__arrow premium-gallery__arrow--next"
                              onClick={showNextImage}
                              aria-label="Fotoja tjeter"
                            >
                              <Icon n="chevron-right" />
                            </button>
                          </>
                        )}

                        {/* Photo Counter */}
                        {showGalleryControls && (
                          <div className="premium-gallery__counter">
                            {safeImageIndex + 1} / {galleryImages.length}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Horizontal Thumbnails Below Main Image */}
                    {showGalleryControls && (
                      <div className="premium-gallery__thumbs">
                        {galleryImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`premium-gallery__thumb${idx === safeImageIndex ? " premium-gallery__thumb--active" : ""}`}
                            onClick={() => setActiveImageIndex(idx)}
                            aria-label={`Foto ${idx + 1}`}
                          >
                            <img src={img} alt={`${post.title} thumbnail ${idx + 1}`} className="premium-gallery__thumb-img" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Label + Location — below gallery */}
                  <div className="detail-page__sub-header">
                    <span className="detail-page__category-label">{categoryLabel}</span>
                    <p className="villa-details__location">
                      <Icon n="location-dot" /> {post.location}
                    </p>
                  </div>

                  {/* Price Card — mobile only (shown after gallery) */}
                  <div className="detail-page__booking-card detail-page__booking-card--mobile">
                    <p className="detail-page__booking-label">Rezervo ose pyet</p>
                    <div className="detail-page__booking-price">
                      <span className="prop-card__price-pill">€ {post.price} / natë</span>
                      {post.whatsapp && (
                        <a
                          href={`https://wa.me/${post.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-page__whatsapp-icon"
                          onClick={handleWhatsappClick}
                          aria-label="Kontakto në WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="detail-page__booking-hint">Cmimi per person per nate. Kontakto per detaje te metejshme.</p>
                  </div>

                  {/* Property Meta Chips */}
                  <div className="detail-page__card">
                    <div className="modal-meta villa-details__meta">
                      {rooms > 0 && <span className="modal-meta-item"><Icon n="door-open" /> {rooms} Dhoma</span>}
                      <span className="modal-meta-item"><Icon n="bed" /> {post.beds} Shtreter</span>
                      <span className="modal-meta-item"><Icon n="bath" /> {post.baths} Banjo</span>
                      {post.area > 0 && <span className="modal-meta-item"><Icon n="ruler-combined" /> {post.area}m2</span>}
                      <span className="modal-meta-item"><Icon n="users" /> {guests ?? "-"} Persona</span>
                    </div>
                  </div>

                  {/* Description */}
                  {post.description && (
                    <div className="detail-page__card">
                      <p className="detail-page__card-heading">Pershkrimi</p>
                      <p className="villa-details__description">{post.description}</p>
                    </div>
                  )}

                  {/* Features / Amenities */}
                  {Array.isArray(post.features) && post.features.length > 0 && (
                    <div className="detail-page__card">
                      <p className="villa-details__feature-label">Vecorite e Prones</p>
                      <div className="property-features">
                        {post.features.map((feature) => (
                          <span key={feature} className="property-feature">
                            <Icon n={FEATURE_ICONS[feature] || "check"} /> {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact / Owner Card — mobile only (hidden on desktop, shown in sidebar) */}
                  <div className="detail-page__contact-card detail-page__contact-main" style={{ marginTop: 24 }}>
                    <p className="detail-page__contact-label">Pronari / Kontakti</p>
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
                        <a
                          className="detail-page__contact-row detail-page__contact-row--link"
                          href={`tel:${post.whatsapp}`}
                          onClick={handlePhoneClick}
                        >
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
                      <WhatsAppButton
                        href={`https://wa.me/${post.whatsapp}`}
                        label="Kontakto ne WhatsApp"
                        size="lg"
                        onClick={handleWhatsappClick}
                      />
                      <ChatButton
                        listingId={post.id}
                        listingTitle={post.title}
                        ownerId={post.userId}
                        ownerName={post.author || post.createdBy || "Pronari"}
                        currentUser={user}
                        size="lg"
                        onNavigate={(convId) => navigate(`/messages/${convId}`)}
                      />
                    </div>
                    <button className="btn btn--ghost btn--full" onClick={() => navigate(getExperienceCatalogPath(experienceKey))}>
                      <Icon n="arrow-left" /> {config.details.backLabel}
                    </button>
                  </div>

                  {/* Map Section — below contact */}
                  <PropertyMap
                    lat={post.lat}
                    lng={post.lng}
                    title={post.title}
                    address={post.address}
                    location={post.location}
                  />

                  {/* Reviews Section */}
                  <ReviewSection listingId={post.id} user={user} />

                  {/* Similar Listings */}
                  {similarListings.length > 0 && (
                    <section className="similar-listings">
                      <h3 className="similar-listings__title">Shpallje të Ngjashme</h3>
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
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(getExperienceDetailPath(itemExperience, item.id, item.title)); }}
                            >
                              <div className="similar-listings__img-wrap">
                                {thumb ? (
                                  <img className="similar-listings__img" src={thumb} alt={item.title} />
                                ) : (
                                  <div className="similar-listings__img-placeholder"><Icon n="home" /></div>
                                )}
                                <span className="similar-listings__badge">{item.category}</span>
                              </div>
                              <div className="similar-listings__info">
                                <p className="similar-listings__name">{item.title}</p>
                                <p className="similar-listings__loc"><Icon n="location-dot" /> {item.location}</p>
                                <span className="similar-listings__price">€ {item.price} / natë</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column — Sticky Sidebar (desktop only) */}
                <aside className="detail-page__sidebar">
                  {/* Price Card */}
                  <div className="detail-page__booking-card">
                    <p className="detail-page__booking-label">Rezervo ose pyet</p>
                    <div className="detail-page__booking-price">
                      <span className="prop-card__price-pill">€ {post.price} / natë</span>
                      {post.whatsapp && (
                        <a
                          href={`https://wa.me/${post.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-page__whatsapp-icon"
                          onClick={handleWhatsappClick}
                          aria-label="Kontakto në WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="detail-page__booking-hint">Cmimi per person per nate. Kontakto per detaje te metejshme.</p>
                  </div>

                  {/* Contact Card — desktop sidebar copy */}
                  <div className="detail-page__contact-card detail-page__contact-sidebar">
                    <p className="detail-page__contact-label">Pronari / Kontakti</p>
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
                        <a
                          className="detail-page__contact-row detail-page__contact-row--link"
                          href={`tel:${post.whatsapp}`}
                          onClick={handlePhoneClick}
                        >
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
                      <WhatsAppButton
                        href={`https://wa.me/${post.whatsapp}`}
                        label="Kontakto ne WhatsApp"
                        size="lg"
                        onClick={handleWhatsappClick}
                      />
                      <ChatButton
                        listingId={post.id}
                        listingTitle={post.title}
                        ownerId={post.userId}
                        ownerName={post.author || post.createdBy || "Pronari"}
                        currentUser={user}
                        size="lg"
                        onNavigate={(convId) => navigate(`/messages/${convId}`)}
                      />
                    </div>
                    <button className="btn btn--ghost btn--full" onClick={() => navigate(getExperienceCatalogPath(experienceKey))}>
                      <Icon n="arrow-left" /> {config.details.backLabel}
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
