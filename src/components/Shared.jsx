import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { getExperienceConfig } from "../config/experiences.js";
import {
  getExperienceDetailPath,
  getExperienceHomePath,
  getListingExperience,
  normalizeExperience,
} from "../utils/experience.js";
import { listPremiumPublicPosts, onPendingCount } from "../services/posts.js";
import { onUnreadCount } from "../services/chat.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import {
  ArrowLeft,
  ArrowsClockwise,
  ArrowsDownUp,
  ArrowUp,
  Bathtub,
  Bed,
  BookmarkSimple,
  BuildingOffice,
  Buildings,
  Calendar,
  CalendarCheck,
  Car,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartLineUp,
  ChatDots,
  Check,
  ClipboardText,
  CloudArrowUp,
  Door,
  DotsThreeVertical,
  Elevator,
  Envelope,
  Eye,
  FacebookLogo,
  Fire,
  FloppyDisk,
  Heart,
  House,
  HouseSimple,
  Image,
  Info,
  InstagramLogo,
  Lightning,
  List,
  MagnifyingGlass,
  MapPin,
  Mountains,
  PaperPlaneRight,
  Pen,
  PencilSimple,
  Phone,
  Plus,
  Prohibit,
  Ruler,
  ShieldCheck,
  SignOut,
  Snowflake,
  Sparkle,
  SwimmingPool,
  Tag,
  TiktokLogo,
  Trash,
  TreePalm,
  User,
  UserMinus,
  Users,
  Waves,
  WhatsappLogo,
  WifiHigh,
  X,
} from "@phosphor-icons/react";

const ICON_MAP = {
  "arrow-left": ArrowLeft,
  "arrow-up": ArrowUp,
  "arrows-rotate": ArrowsClockwise,
  "arrows-up-down": ArrowsDownUp,
  "ban": Prohibit,
  "bath": Bathtub,
  "bed": Bed,
  "bolt": Lightning,
  "bookmark": BookmarkSimple,
  "building": Buildings,
  "calendar": Calendar,
  "calendar-check": CalendarCheck,
  "chart-line": ChartLineUp,
  "check": Check,
  "chevron-down": CaretDown,
  "chevron-left": CaretLeft,
  "chevron-right": CaretRight,
  "circle-info": Info,
  "city": Buildings,
  "clipboard-check": ClipboardText,
  "cloud-arrow-up": CloudArrowUp,
  "comment-dots": ChatDots,
  "door-open": Door,
  "elevator": Elevator,
  "ellipsis-vertical": DotsThreeVertical,
  "envelope": Envelope,
  "eye": Eye,
  "fire-burner": Fire,
  "heart": Heart,
  "heart-circle-check": Heart,
  "home": House,
  "hot-tub-person": Bathtub,
  "house": House,
  "house-circle-xmark": HouseSimple,
  "image": Image,
  "list": List,
  "location-dot": MapPin,
  "magnifying-glass": MagnifyingGlass,
  "magnifying-glass-location": MagnifyingGlass,
  "mountain-sun": Mountains,
  "paper-plane": PaperPlaneRight,
  "pen": Pen,
  "pen-to-square": PencilSimple,
  "person-swimming": SwimmingPool,
  "phone": Phone,
  "plus": Plus,
  "right-from-bracket": SignOut,
  "ruler-combined": Ruler,
  "save": FloppyDisk,
  "search": MagnifyingGlass,
  "shield-halved": ShieldCheck,
  "snowflake": Snowflake,
  "sparkles": Sparkle,
  "square-parking": Car,
  "tag": Tag,
  "tower-city": BuildingOffice,
  "trash": Trash,
  "tree-city": TreePalm,
  "user": User,
  "users": Users,
  "users-slash": UserMinus,
  "water": Waves,
  "water-ladder": SwimmingPool,
  "wifi": WifiHigh,
  "xmark": X,
};

const FAB_MAP = {
  "facebook-f": FacebookLogo,
  "instagram": InstagramLogo,
  "tiktok": TiktokLogo,
  "whatsapp": WhatsappLogo,
};

const sortPremiumItems = (a, b) => {
  const aOrder = typeof a.premiumOrder === "number" ? a.premiumOrder : Number.MAX_SAFE_INTEGER;
  const bOrder = typeof b.premiumOrder === "number" ? b.premiumOrder : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
  const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
  return bTime - aTime;
};

const formatPremiumPrice = (value, byRequestLabel = "Sipas kerkeses") => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return byRequestLabel;
  return `€${parsed.toLocaleString("sq-AL")}`;
};

export const Icon = ({ n, style, size, ...rest }) => {
  const Component = ICON_MAP[n];
  if (!Component) return null;
  const isFilled = n === "heart-circle-check";
  return (
    <Component
      style={style}
      size={size}
      weight={isFilled ? "fill" : undefined}
      aria-hidden="true"
      {...rest}
    />
  );
};

export const FabI = ({ n, size, ...rest }) => {
  const Component = FAB_MAP[n];
  if (!Component) return null;
  return <Component size={size} aria-hidden="true" {...rest} />;
};

export function BrandLogo({ light = false, onClick, className = "" }) {
  const logoSrc = light ? "/logo-white.svg" : "/logo-dark.svg";
  return (
    <span
      className={`brand ${className}`.trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label="Villa Apartmene"
    >
      <img className="brand-mark" src={logoSrc} alt="Villa Apartmene" />
    </span>
  );
}

export function WhatsAppButton({ href, label, size = "sm", onClick }) {
  const { t } = useLanguage();
  const resolvedLabel = label || t("common.contactWhatsApp");
  return (
    <a
      className={`btn btn--whatsapp btn--${size}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={resolvedLabel}
      onClick={onClick}
    >
      <WhatsappLogo className="btn--whatsapp__icon" aria-hidden="true" />
      <span className="btn--whatsapp__label">{resolvedLabel}</span>
    </a>
  );
}

export function Navbar({ user, onLogout, experience = "villas" }) {
  const { t } = useLanguage();
  const routerNavigate = useNavigate();
  const currentExperience = normalizeExperience(experience);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileButtonRef = useRef(null);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const unsub = onPendingCount(setPendingCount);
    return unsub;
  }, [user?.role]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = onUnreadCount(user.id, setUnreadMessages);
    return unsub;
  }, [user?.id]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setOpen(false);

      if (!mobileOpen) return;
      if (mobileMenuRef.current?.contains(event.target)) return;
      if (mobileButtonRef.current?.contains(event.target)) return;
      setMobileOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOpen(false);
      }
    };

    const onResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const go = (path) => {
    setMobileOpen(false);
    routerNavigate(path);
  };

  const scrollToSection = (id) => {
    setMobileOpen(false);
    routerNavigate(getExperienceHomePath(currentExperience));
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__mobile-controls navbar__mobile-left">
          <button
            ref={mobileButtonRef}
            type="button"
            className={`navbar__hamburger ${mobileOpen ? "is-open" : ""}`}
            aria-label={t("nav.openMenu")}
            aria-expanded={mobileOpen}
            onClick={(event) => {
              event.stopPropagation();
              setMobileOpen((value) => !value);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <BrandLogo light onClick={() => go(getExperienceHomePath(currentExperience))} />

        <nav className="navbar__nav">
          <span className="navbar__link" onClick={() => go(getExperienceHomePath(currentExperience))}>{t("nav.home")}</span>
          <span className={`navbar__link ${currentExperience === "villas" ? "is-active" : ""}`} onClick={() => go("/villas")}>
            {t("exp.villas.navLabel")}
          </span>
          <span className={`navbar__link ${currentExperience === "apartments" ? "is-active" : ""}`} onClick={() => go("/apartments")}>
            {t("exp.apartments.navLabel")}
          </span>
          <span className="navbar__link" onClick={() => scrollToSection("contact")}>{t("nav.contact")}</span>
          <span className="navbar__link" onClick={() => scrollToSection("services")}>{t("nav.about")}</span>
        </nav>

        <div className="navbar__actions navbar__actions--desktop">
          <LanguageSwitcher />
          {!user ? (
            <>
              <button className="btn btn--ghost" onClick={() => go("/login")}>{t("nav.login")}</button>
              <button className="btn btn--primary" onClick={() => go("/register")}>{t("nav.register")}</button>
            </>
          ) : (
            <>
              <button className="navbar__icon-btn navbar__icon-btn--msg" aria-label={t("nav.messages")} onClick={() => go("/messages")}>
                <Icon n="comment-dots" />
                {unreadMessages > 0 && <span className="user-menu__badge">{unreadMessages}</span>}
              </button>
              <button className="btn btn--glass" onClick={() => go("/create")}>
                <Icon n="plus" /> {t("nav.postListing")}
              </button>
              <div className="user-menu" ref={userMenuRef}>
                <button className="user-menu__toggle" onClick={() => setOpen((value) => !value)}>
                  <span className="user-menu__avatar">
                    {initials}
                    {pendingCount > 0 && <span className="user-menu__badge">{pendingCount}</span>}
                  </span>
                  <span>{user.name?.split(" ")[0]}</span>
                  <Icon n="chevron-down" />
                </button>
                {open && (
                  <div className="user-menu__dropdown">
                    <span className="user-menu__item" onClick={() => { setOpen(false); go("/profile"); }}>
                      <Icon n="user" /> {t("nav.profile")}
                    </span>
                    <span className="user-menu__item" onClick={() => { setOpen(false); go("/profile?tab=listings"); }}>
                      <Icon n="list" /> {t("nav.myListings")}
                    </span>
                    <span className="user-menu__item" onClick={() => { setOpen(false); go("/profile?tab=saved"); }}>
                      <Icon n="bookmark" /> {t("nav.favorites")}
                    </span>
                    {user.role === "admin" && (
                      <span className="user-menu__item" onClick={() => { setOpen(false); go("/admin"); }}>
                        <Icon n="shield-halved" /> {t("nav.adminPanel")}
                      </span>
                    )}
                    <button className="user-menu__item user-menu__item--danger" onClick={() => { setOpen(false); onLogout(); }}>
                      <Icon n="right-from-bracket" /> {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="navbar__mobile-controls navbar__mobile-right">
          {user && (
            <button type="button" className="navbar__icon-btn navbar__icon-btn--msg" aria-label={t("nav.messages")} onClick={() => go("/messages")}>
              <Icon n="comment-dots" />
              {unreadMessages > 0 && <span className="user-menu__badge">{unreadMessages}</span>}
            </button>
          )}
          <button type="button" className="navbar__icon-btn navbar__icon-btn--profile" aria-label={t("nav.profile")} onClick={() => go(user ? "/profile" : "/login")}>
            <Icon n="user" />
            {pendingCount > 0 && <span className="user-menu__badge">{pendingCount}</span>}
          </button>
        </div>
      </div>

      <div className={`navbar__mobile-overlay ${mobileOpen ? "is-open" : ""}`} onClick={() => setMobileOpen(false)} aria-hidden={!mobileOpen} />
      <aside ref={mobileMenuRef} className={`navbar__mobile-menu ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="navbar__mobile-header">
          <BrandLogo light onClick={() => go(getExperienceHomePath(currentExperience))} />
          <button
            type="button"
            className="navbar__mobile-close"
            aria-label={t("nav.closeMenu")}
            onClick={() => setMobileOpen(false)}
          >
            <Icon n="xmark" />
          </button>
        </div>
        <button className="navbar__mobile-link" onClick={() => go(getExperienceHomePath(currentExperience))}><Icon n="house" /> {t("nav.home")}</button>
        <button className="navbar__mobile-link" onClick={() => go("/villas")}><Icon n="tree-city" /> {t("exp.villas.navLabel")}</button>
        <button className="navbar__mobile-link" onClick={() => go("/apartments")}><Icon n="building" /> {t("exp.apartments.navLabel")}</button>
        <button className="navbar__mobile-link" onClick={() => scrollToSection("contact")}><Icon n="envelope" /> {t("nav.contact")}</button>
        <button className="navbar__mobile-link" onClick={() => scrollToSection("services")}><Icon n="circle-info" /> {t("nav.about")}</button>
        <button className="navbar__mobile-link" onClick={() => go(user ? "/profile" : "/login")}><Icon n="user" /> {t("nav.account")}</button>
        {user?.role === "admin" && (
          <button className="navbar__mobile-link" onClick={() => go("/admin")}><Icon n="shield-halved" /> {t("nav.adminPanel")}</button>
        )}

        <LanguageSwitcher className="navbar__mobile-lang" />

        {!user ? (
          <div className="navbar__mobile-auth">
            <button className="btn btn--ghost btn--full" onClick={() => go("/login")}>{t("nav.login")}</button>
            <button className="btn btn--primary btn--full" onClick={() => go("/register")}>{t("nav.register")}</button>
          </div>
        ) : (
          <div className="navbar__mobile-auth">
            <button className="btn btn--primary btn--full" onClick={() => go("/create")}>{t("nav.postListing")}</button>
            <button className="btn btn--ghost btn--full" onClick={() => { setMobileOpen(false); onLogout(); }}>{t("nav.logout")}</button>
          </div>
        )}
      </aside>
    </header>
  );
}

export function Footer({ experience = "villas" }) {
  const { t } = useLanguage();
  const routerNavigate = useNavigate();
  const currentExperience = normalizeExperience(experience);
  const scrollToSection = (id) => {
    routerNavigate(getExperienceHomePath(currentExperience));
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  };

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <BrandLogo light onClick={() => routerNavigate(getExperienceHomePath(currentExperience))} />
          <p>{t("footer.description")}</p>
          <div className="footer__socials">
            <a href="#" aria-label="Facebook"><FabI n="facebook-f" /></a>
            <a href="#" aria-label="Instagram"><FabI n="instagram" /></a>
            <a href="#" aria-label="TikTok"><FabI n="tiktok" /></a>
          </div>
        </div>
        <div className="footer__col">
          <h4>{t("footer.navigation")}</h4>
          <span onClick={() => routerNavigate(getExperienceHomePath(currentExperience))}>{t("nav.home")}</span>
          <span onClick={() => routerNavigate("/villas")}>{t("exp.villas.navLabel")}</span>
          <span onClick={() => routerNavigate("/apartments")}>{t("exp.apartments.navLabel")}</span>
          <span onClick={() => scrollToSection("categories")}>{t("footer.categories")}</span>
          <span onClick={() => scrollToSection("contact")}>{t("nav.contact")}</span>
        </div>
        <div className="footer__col">
          <h4>{t("footer.account")}</h4>
          <span onClick={() => routerNavigate("/login")}>{t("nav.login")}</span>
          <span onClick={() => routerNavigate("/register")}>{t("nav.register")}</span>
          <span onClick={() => routerNavigate("/profile")}>{t("nav.profile")}</span>
          <span onClick={() => routerNavigate("/create")}>{t("nav.postListing")}</span>
        </div>
      </div>
      <div className="footer__bottom">
        <p>{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}

export function PremiumSection({ collectionName = "villas", limitCount = 6 }) {
  const { t } = useLanguage();
  const routerNavigate = useNavigate();
  const experience = normalizeExperience(collectionName);
  const config = getExperienceConfig(experience);
  const safeLimit = Math.min(10, Math.max(6, Number(limitCount) || 6));
  const premiumMarqueeRef = useRef(null);
  const mobileSlideTimerRef = useRef(0);
  const mobileSlideResumeTimerRef = useRef(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSlider, setIsMobileSlider] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncViewportMode = () => setIsMobileSlider(mediaQuery.matches);

    syncViewportMode();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewportMode);
      return () => mediaQuery.removeEventListener("change", syncViewportMode);
    }

    mediaQuery.addListener(syncViewportMode);
    return () => mediaQuery.removeListener(syncViewportMode);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPremiumListings = async () => {
      setLoading(true);

      try {
        const premiumPosts = await listPremiumPublicPosts(safeLimit);

        const seenIds = new Set();
        const nextItems = premiumPosts
          .filter((item) => item.isPremium && getListingExperience(item) === experience)
          .sort(sortPremiumItems)
          .filter((item) => {
            if (!item?.id || seenIds.has(item.id)) return false;
            seenIds.add(item.id);
            return true;
          })
          .slice(0, safeLimit);

        if (isMounted) setItems(nextItems);
      } catch (error) {
        console.error("Failed to load premium section:", error);
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Premium section: shared home carousel for villas and apartments.
    loadPremiumListings();

    return () => {
      isMounted = false;
    };
  }, [experience, safeLimit]);


  const sectionId = `premium-section-title-${experience}`;
  const sectionTitle = experience === "apartments" ? t("premiumSection.apartmentTitle") : t("premiumSection.villaTitle");
  const premiumCount = items.length;
  const sectionCopy =
    experience === "apartments"
      ? t("premiumSection.apartmentCopy", { count: premiumCount })
      : t("premiumSection.villaCopy", { count: premiumCount });
  const baseAnimationSeconds = Math.max(items.length * 10, 40);
  const duplicatedItems = items.length > 1 ? [...items, ...items] : items;
  const renderedItems = isMobileSlider ? items : duplicatedItems;
  const animationDuration = `${baseAnimationSeconds}s`;
  const emptyMessage = t("premiumSection.emptyMessage");

  useEffect(() => {
    if (typeof window === "undefined" || !isMobileSlider || items.length <= 1) return undefined;

    const marqueeNode = premiumMarqueeRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!marqueeNode || prefersReducedMotion.matches) return undefined;

    const mobileSlideDelayMs = 4400;

    const getSlides = () => Array.from(marqueeNode.querySelectorAll(".premium-marquee__item"));

    const getNearestIndex = () => {
      const slides = getSlides();
      if (slides.length === 0) return 0;

      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slideNode, index) => {
        const distance = Math.abs(slideNode.offsetLeft - marqueeNode.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    };

    const scrollToIndex = (index, behavior = "smooth") => {
      const slides = getSlides();
      const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
      const targetNode = slides[safeIndex];
      if (!targetNode) return;

      marqueeNode.scrollTo({
        left: targetNode.offsetLeft,
        behavior,
      });
    };

    const clearAutoSlideTimers = () => {
      window.clearTimeout(mobileSlideTimerRef.current);
      window.clearTimeout(mobileSlideResumeTimerRef.current);
      mobileSlideTimerRef.current = 0;
      mobileSlideResumeTimerRef.current = 0;
    };

    const scheduleNextSlide = (delayMs = mobileSlideDelayMs) => {
      window.clearTimeout(mobileSlideTimerRef.current);
      mobileSlideTimerRef.current = window.setTimeout(() => {
        const slides = getSlides();
        if (slides.length <= 1) return;

        const currentIndex = getNearestIndex();
        const nextIndex = currentIndex + 1;

        if (nextIndex >= slides.length) {
          marqueeNode.scrollTo({ left: 0, behavior: "auto" });
        } else {
          scrollToIndex(nextIndex);
        }

        scheduleNextSlide(mobileSlideDelayMs);
      }, delayMs);
    };

    const pauseAndResume = (resumeDelayMs = 1800) => {
      window.clearTimeout(mobileSlideTimerRef.current);
      window.clearTimeout(mobileSlideResumeTimerRef.current);
      mobileSlideResumeTimerRef.current = window.setTimeout(() => {
        scheduleNextSlide(mobileSlideDelayMs);
      }, resumeDelayMs);
    };

    const handleTouchStart = () => {
      clearAutoSlideTimers();
    };

    const handleTouchEnd = () => {
      pauseAndResume();
    };

    marqueeNode.scrollTo({ left: 0, behavior: "auto" });
    marqueeNode.addEventListener("touchstart", handleTouchStart, { passive: true });
    marqueeNode.addEventListener("touchend", handleTouchEnd, { passive: true });
    marqueeNode.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    scheduleNextSlide(mobileSlideDelayMs);

    return () => {
      marqueeNode.removeEventListener("touchstart", handleTouchStart);
      marqueeNode.removeEventListener("touchend", handleTouchEnd);
      marqueeNode.removeEventListener("touchcancel", handleTouchEnd);
      clearAutoSlideTimers();
    };
  }, [isMobileSlider, items.length]);

  return (
    <section className="premium-section" aria-labelledby={sectionId}>
      <div className="container">
        <div className="premium-section__head">
          <div>
            <p className="section-tag">{t("premiumSection.badge")}</p>
            <h2 id={sectionId} className="section-title">
              {sectionTitle}
            </h2>
          </div>
          <p className="premium-section__copy">{sectionCopy}</p>
        </div>

        {loading ? (
          <div className="premium-section__skeleton" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`${experience}-premium-skeleton-${index}`} className="premium-card premium-card--skeleton" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div
            ref={premiumMarqueeRef}
            className={`premium-marquee ${items.length <= 1 ? "premium-marquee--static" : ""} ${isMobileSlider ? "premium-marquee--slides" : ""}`}
            aria-label={`${config.navLabel} premium`}
            aria-busy={loading}
          >
            <ul
              className="premium-marquee__track"
              style={{ "--premium-duration": animationDuration }}
            >
              {renderedItems.map((item, index) => {
                const isDuplicateItem = items.length > 1 && index >= items.length;
                const premiumImage =
                  (Array.isArray(item.images) && item.images.find(Boolean)) ||
                  item.image ||
                  "";

                return (
                  <li
                    key={`${item.id}-${index}`}
                    className="premium-marquee__item"
                    aria-hidden={isDuplicateItem}
                  >
                    <article className={`premium-card premium-card--${experience}`}>
                      <div className="premium-card__frame">
                        {/* Premium section card: image-first glass card with compact info footer. */}
                        <button
                          type="button"
                          className="premium-card__media-button"
                          tabIndex={isDuplicateItem ? -1 : 0}
                          aria-label={`${t("common.view")} ${item.title}, ${item.location}, ${formatPremiumPrice(item.price, t("common.byRequest"))}`}
                          onClick={() => routerNavigate(getExperienceDetailPath(experience, item.id, item.title))}
                        >
                          <div className="premium-card__media">
                            <span className="premium-card__eyebrow">{t("premiumSection.badge")}</span>
                            {premiumImage ? (
                              <img className="premium-card__image" src={premiumImage} alt="" loading="lazy" />
                            ) : (
                              <span className="premium-card__placeholder">
                                <Icon n="image" />
                              </span>
                            )}
                            <span className="premium-card__media-shade" />
                          </div>
                        </button>

                        <div className="premium-card__content">
                          <div className="premium-card__topline">
                            <h3 className="premium-card__title">{item.title}</h3>
                            <p className="premium-card__price">{formatPremiumPrice(item.price, t("common.byRequest"))}</p>
                          </div>
                          <p className="premium-card__location">
                            <Icon n="location-dot" />
                            <span>{item.location || t("common.unspecifiedLocation")}</span>
                          </p>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="premium-section__empty" role="status" aria-live="polite">
            <Icon n="sparkles" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function PropertyCard({ post, to, onToggleFavorite, isFavorite = false, onDelete, experience = "villas" }) {
  const { t } = useLanguage();
  const routerNavigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartRef = useRef(null);
  const guests = post.guests ?? post.persons ?? post.people ?? (post.beds ? post.beds * 2 : null);
  const rooms = post.rooms ?? post.beds ?? 0;
  const currentUser = auth.currentUser;
  const isOwner = Boolean(currentUser && currentUser.uid === post.userId);
  const currentExperience = normalizeExperience(experience);

  const images = Array.isArray(post.images) && post.images.length > 0
    ? post.images
    : post.image ? [post.image] : [];

  const handleOpen = () => {
    if (to) {
      routerNavigate(to);
    }
  };

  const slidePrev = (event) => {
    event.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const slideNext = (event) => {
    event.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (!touchStartRef.current || images.length <= 1) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      event.stopPropagation();
      event.preventDefault();
      if (deltaX < 0) setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      else setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleDelete = async () => {
    if (!isOwner || isDeleting) return;
    if (!window.confirm(t("card.confirmDelete"))) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "listings", post.id));
      onDelete?.(post.id);
    } catch (error) {
      console.error("Failed to delete listing:", error);
      window.alert(t("card.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`prop-card prop-card--${currentExperience}${post.isPremium ? " prop-card--premium" : ""}`}
      onClick={handleOpen}
      role={to ? "button" : "article"}
      tabIndex={to ? 0 : undefined}
      onKeyDown={(event) => {
        if (!to) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
    >
      {post.isPremium && <span className="prop-card__premium-badge"><img src="/star-green-circle-round-27421.svg" alt="Premium" className="prop-card__premium-icon" /></span>}
      <div
        className="prop-card__media"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <img className="prop-card__img" src={images[imgIndex]} alt={post.title} onError={(event) => { event.target.style.display = "none"; }} />
        ) : (
          <div className="prop-card__img-placeholder"><Icon n="home" /></div>
        )}
        {images.length > 1 && (
          <>
            <button className="prop-card__arrow prop-card__arrow--prev" onClick={slidePrev} aria-label={t("common.previousImage")}>
              <Icon n="chevron-left" />
            </button>
            <button className="prop-card__arrow prop-card__arrow--next" onClick={slideNext} aria-label={t("common.nextImage")}>
              <Icon n="chevron-right" />
            </button>
            <div className="prop-card__dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`prop-card__dot ${i === imgIndex ? "is-active" : ""}`}
                  onClick={(event) => { event.stopPropagation(); setImgIndex(i); }}
                />
              ))}
            </div>
          </>
        )}
        <div className="prop-card__badge">{post.category || getExperienceConfig(currentExperience).label}</div>
        {typeof onToggleFavorite === "function" && (
          <button
            className={`prop-card__fav-btn ${isFavorite ? "is-favorite" : ""}`}
            onClick={(event) => { event.stopPropagation(); onToggleFavorite(post); }}
          >
            <Icon n={isFavorite ? "heart-circle-check" : "heart"} />
          </button>
        )}
      </div>
      <div className="prop-card__body">
        <p className="prop-card__title">{post.title}</p>
        <div className="prop-card__row">
          <p className="prop-card__location"><Icon n="location-dot" /> {post.location}</p>
          <span className="prop-card__price-pill">€ {post.price} {t("common.perNight")}</span>
        </div>
        <div className="prop-card__meta">
          <span><Icon n="door-open" /> {rooms} {t("common.rooms")}</span>
          <span><Icon n="bath" /> {post.baths} {t("common.bathrooms")}</span>
          <span><Icon n="users" /> {guests ?? "-"} {t("common.guests")}</span>
        </div>
        <div className="prop-card__actions" onClick={(event) => event.stopPropagation()}>
          <WhatsAppButton href={`https://wa.me/${post.whatsapp}`} />
        </div>
        {isOwner && (
          <div className="prop-card__actions prop-card__actions--owner" onClick={(event) => event.stopPropagation()}>
            <button className="btn btn--outline btn--sm" onClick={() => routerNavigate(`/edit-villa/${post.id}`)}>
              <Icon n="pen-to-square" /> Edit
            </button>
            <button className="btn btn--danger btn--sm" onClick={handleDelete} disabled={isDeleting}>
              <Icon n="trash" /> {isDeleting ? t("common.deleting") : t("common.delete")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
