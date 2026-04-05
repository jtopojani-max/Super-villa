import { useEffect, useState } from "react";
import { updateEmail, updateProfile } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import ListingAnalyticsDashboard from "../components/ListingAnalyticsDashboard.jsx";
import PaidPlanStatusPanel from "../components/PaidPlanStatusPanel.jsx";
import { BrandLogo, Icon, PropertyCard } from "../components/Shared.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { auth } from "../firebase.js";
import { setUser } from "../utils/storage.js";
import { getListingsByIds } from "../services/listings.js";
import { listMyPosts, deletePost, onPendingCount } from "../services/posts.js";
import { listSavedListingIds, toggleSavedListing, updateUserProfile } from "../services/users.js";
import { getExperienceDetailPath, getListingExperience, getPremiumPlanNavigationTarget } from "../utils/experience.js";

const parseName = (name = "") => {
  const [firstName = "", ...rest] = name.trim().split(" ");
  return { firstName, lastName: rest.join(" ") };
};

const getProfileTabFromSearch = (search, isAdmin) => {
  const value = new URLSearchParams(search).get("tab");
  const allowedTabs = isAdmin
    ? ["info", "listings", "analytics", "saved", "admin"]
    : ["info", "listings", "analytics", "saved"];

  return allowedTabs.includes(value) ? value : "info";
};

export default function ProfilePage({ user, onLogout, onUpdateUser }) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState(() => getProfileTabFromSearch(location.search, isAdmin));
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [form, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const analyticsLabel = lang === "en" ? "Analytics" : "Statistikat";
  const tabs = isAdmin
    ? [
        { key: "info", icon: "user", label: t("profile.tabInfo") },
        { key: "listings", icon: "list", label: t("profile.tabListings") },
        { key: "analytics", icon: "chart-line", label: analyticsLabel },
        { key: "saved", icon: "bookmark", label: t("profile.tabSaved") },
        { key: "admin", icon: "shield-halved", label: t("profile.tabAdmin") },
      ]
    : [
        { key: "info", icon: "user", label: t("profile.tabInfo") },
        { key: "listings", icon: "list", label: t("profile.tabListings") },
        { key: "analytics", icon: "chart-line", label: analyticsLabel },
        { key: "saved", icon: "bookmark", label: t("profile.tabSaved") },
      ];

  const premiumStatusLabel = (value) => {
    if (value === "pending") return lang === "en" ? "Premium pending" : "Premium ne pritje";
    if (value === "active") return lang === "en" ? "Premium active" : "Premium aktiv";
    if (value === "rejected") return lang === "en" ? "Premium rejected" : "Premium refuzuar";
    if (value === "expired") return lang === "en" ? "Premium expired" : "Premium skaduar";
    return "Premium";
  };

  const defaultListingStatus = lang === "en" ? "Waiting for approval" : "Ne pritje";
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const { firstName, lastName } = parseName(user.name || "");
    setFormState({
      firstName,
      lastName,
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });
  }, [user, navigate]);

  useEffect(() => {
    setTab(getProfileTabFromSearch(location.search, isAdmin));
  }, [location.search, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onPendingCount(setPendingCount);
    return () => unsub();
  }, [isAdmin]);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    setLoadingPosts(true);

    const loadData = async () => {
      try {
        const [mine, savedIds] = await Promise.all([listMyPosts(user.id), listSavedListingIds(user.id)]);
        const saved = await getListingsByIds(savedIds);
        if (!isMounted) return;
        setMyPosts(mine);
        setSavedPosts(saved);
        onUpdateUser((currentUser) => (currentUser ? { ...currentUser, favorites: savedIds } : currentUser));
      } catch (loadError) {
        console.error("Failed to load profile listings:", loadError);
        if (isMounted) setStatus({ type: "error", message: t("profile.profileLoadError") });
      } finally {
        if (isMounted) setLoadingPosts(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [t, user?.id, onUpdateUser]);

  const set = (key, value) => setFormState((current) => ({ ...current, [key]: value }));

  const handleTabChange = (nextTab) => {
    if (nextTab === "admin") {
      navigate("/admin");
      return;
    }

    setTab(nextTab);
    navigate(
      {
        pathname: "/profile",
        search: nextTab === "info" ? "" : `?tab=${nextTab}`,
      },
      { replace: true },
    );
  };

  if (!user) return null;

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    const nextName = `${form.firstName} ${form.lastName}`.trim();
    if (!nextName || !form.email) {
      showStatus("error", t("profile.nameEmailRequired"));
      setSaving(false);
      return;
    }

    try {
      if (auth.currentUser) {
        if (auth.currentUser.displayName !== nextName) {
          await updateProfile(auth.currentUser, { displayName: nextName });
        }
        if (form.email !== auth.currentUser.email) {
          await updateEmail(auth.currentUser, form.email);
          await auth.currentUser.getIdToken(true);
        }
      }

      await updateUserProfile(user.id, {
        name: nextName,
        phone: form.phone.trim(),
        address: form.address.trim(),
      });

      const updated = {
        ...user,
        name: nextName,
        email: form.email,
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      setUser(updated);
      onUpdateUser(updated);
      showStatus("success", t("profile.profileSaved"));
    } catch (saveError) {
      console.error("Failed to save profile:", saveError);
      if (saveError.code === "auth/requires-recent-login") {
        showStatus("error", t("profile.emailReauth"));
      } else {
        showStatus("error", t("profile.profileSaveError"));
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = user.name?.charAt(0)?.toUpperCase() || "U";

  const handleToggleSaved = async (post) => {
    try {
      const didSave = await toggleSavedListing(user.id, post.id);
      setSavedPosts((current) => {
        if (didSave) return [post, ...current.filter((item) => item.id !== post.id)];
        return current.filter((item) => item.id !== post.id);
      });
      onUpdateUser((currentUser) => {
        if (!currentUser) return currentUser;
        const currentFavorites = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
        const nextFavorites = didSave
          ? Array.from(new Set([...currentFavorites, post.id]))
          : currentFavorites.filter((id) => id !== post.id);
        return { ...currentUser, favorites: nextFavorites };
      });
    } catch (toggleError) {
      console.error("Failed to toggle saved listing:", toggleError);
      setStatus({ type: "error", message: t("profile.favoriteError") });
    }
  };

  const handleDeleteListing = (listingId) => {
    setMyPosts((current) => current.filter((post) => post.id !== listingId));
    setSavedPosts((current) => current.filter((post) => post.id !== listingId));
    onUpdateUser((currentUser) => {
      if (!currentUser) return currentUser;
      const favorites = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
      return { ...currentUser, favorites: favorites.filter((id) => id !== listingId) };
    });
  };

  const handleDeleteMyPost = async (postId) => {
    if (!window.confirm(t("profile.confirmDelete"))) return;
    try {
      await deletePost(postId);
      setMyPosts((current) => current.filter((post) => post.id !== postId));
      showStatus("success", t("profile.deleteSuccess"));
    } catch (deleteError) {
      console.error("Failed to delete post:", deleteError);
      showStatus("error", t("profile.deleteError"));
    }
  };

  const handlePremiumAction = (post) => {
    const listingExperience = getListingExperience(post);
    navigate(getPremiumPlanNavigationTarget(listingExperience, post.id));
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          <button className="btn btn--ghost profile-back-btn" onClick={() => navigate("/")}>
            <Icon n="arrow-left" /> <span className="profile-back-btn__label">{t("common.back")}</span>
          </button>
          <BrandLogo light onClick={() => navigate("/")} />
          <div className="profile-header-actions">
            <button className="btn btn--primary" onClick={onLogout}>{t("common.logout")}</button>
          </div>
        </div>
      </header>

      <main className="container profile-page">
        <h1 className="profile-page__title">{t("profile.title")}</h1>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <p className="profile-upload-hint">{t("profile.activeAccount")}</p>
            </div>
            <nav className="profile-nav">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  className={`profile-nav-item ${tab === item.key ? "active" : ""}`}
                  onClick={() => handleTabChange(item.key)}
                >
                  <Icon n={item.icon} /> {item.label}
                  {item.key === "admin" && pendingCount > 0 && <span className="profile-nav-badge">{pendingCount}</span>}
                </button>
              ))}
            </nav>
          </aside>

          <section className="profile-content">
            {tab === "info" && (
              <div>
                <h2>{t("profile.personalInfo")}</h2>
                <form onSubmit={handleSave}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t("profile.firstName")}</label>
                      <input type="text" value={form.firstName} onChange={(event) => set("firstName", event.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>{t("profile.lastName")}</label>
                      <input type="text" value={form.lastName} onChange={(event) => set("lastName", event.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>{t("common.phone")}</label>
                      <input type="text" value={form.phone} onChange={(event) => set("phone", event.target.value)} placeholder={t("profile.phonePlaceholder")} />
                    </div>
                    <div className="form-group">
                      <label>{t("auth.addressLabel")}</label>
                      <input type="text" value={form.address} onChange={(event) => set("address", event.target.value)} placeholder={t("profile.addressPlaceholder")} />
                    </div>
                    <div className="form-group form-group--full">
                      <label>{t("common.email")}</label>
                      <input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="submit-btn" style={{ maxWidth: 220 }} disabled={saving}>
                    <Icon n="save" /> {saving ? t("common.saving") : t("profile.saveChanges")}
                  </button>
                  {status.message && <p className={`profile-status ${status.type}`}>{status.message}</p>}
                </form>
                <p className="profile-upload-hint" style={{ marginTop: 18 }}>
                  {t("profile.deleteAccountNote")}
                </p>
              </div>
            )}

            {tab === "listings" && (
              <div>
                <PaidPlanStatusPanel user={user} />
                <div className="my-posts-header">
                  <div className="my-posts-header__copy">
                    <p className="my-posts-header__eyebrow">{t("profile.myPanel")}</p>
                    <h2 className="my-posts-header__title">{t("profile.myListings")}</h2>
                  </div>
                  <button className="btn btn--primary my-posts-header__cta" onClick={() => navigate("/create")}>
                    <Icon n="plus" /> {t("profile.addListing")}
                  </button>
                </div>
                {loadingPosts ? (
                  <div className="admin-empty">
                    <p>{t("profile.loadingListings")}</p>
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="admin-empty">
                    <Icon n="house-circle-xmark" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                    <p>{t("profile.noListings")}</p>
                  </div>
                ) : (
                  <div className="my-posts-list">
                    {myPosts.map((post) => {
                      const listingExperience = getListingExperience(post);
                      const detailPath = getExperienceDetailPath(listingExperience, post.id, post.title);
                      const listingStatusLabel = post.statusBadge || defaultListingStatus;
                      const hasPremiumStatus = post.premiumStatus && post.premiumStatus !== "none";
                      const canManagePremium = post.isPremium || post.premiumStatus === "pending";
                      return (
                        <div className="my-post-card-wrap" key={post.id}>
                          <div className="my-post-card">
                            <div className="my-post-card__main">
                              <div className="my-post-card__top">
                                <div className="my-post-card__image">
                                  {post.image ? <img src={post.image} alt={post.title} /> : <Icon n="image" />}
                                </div>
                                <div className="my-post-card__info">
                                  <div className="my-post-card__title-row">
                                    <h3>{post.title}</h3>
                                    <span className={`status-badge status-badge--${post.status || "pending"} my-post-card__status`}>
                                      {listingStatusLabel}
                                    </span>
                                  </div>
                                  <p className="my-post-card__location"><Icon n="location-dot" /> {post.location}</p>
                                  <p className="my-post-card__price">
                                    <span className="my-post-card__price-value">€ {post.price}</span>
                                    <span className="my-post-card__price-suffix">{t("common.perNight")}</span>
                                  </p>
                                  {hasPremiumStatus && (
                                    <div className="my-post-card__premium">
                                      <span className={`paid-plan-status-badge paid-plan-status-badge--${post.premiumStatus === "active" ? "approved" : post.premiumStatus}`}>
                                        {premiumStatusLabel(post.premiumStatus)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="my-post-card__side">
                                <div className="my-post-card__actions my-post-card__actions--side">
                                  <button className="btn btn--small btn--outline" onClick={() => navigate(detailPath)} title={t("common.viewDetails")}>
                                    <Icon n="eye" /> {t("common.viewDetails")}
                                  </button>
                                  <button className="btn btn--small btn--outline" onClick={() => navigate(`/edit-villa/${post.id}`)} title={t("common.edit")}>
                                    <Icon n="pen" /> {t("common.edit")}
                                  </button>
                                  <button className="btn btn--small btn--danger" onClick={() => handleDeleteMyPost(post.id)} title={t("common.delete")}>
                                    <Icon n="trash" /> {t("common.delete")}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="my-post-card__bar">
                              <div className="my-post-card__footer-meta my-post-card__footer-meta--desktop">
                                <span className="my-post-card__id">ID #{post.idNumber}</span>
                              </div>
                              <div className="my-post-card__meta-row my-post-card__meta-row--mobile">
                                <span className={`status-badge status-badge--${post.status || "pending"} my-post-card__status my-post-card__status--mobile-chip`}>
                                  {listingStatusLabel}
                                </span>
                                <span className="my-post-card__meta-chip my-post-card__meta-chip--id">ID #{post.idNumber}</span>
                              </div>
                              <div className="my-post-card__bar-right">
                                <button
                                  type="button"
                                  className={`my-post-card__premium-btn ${canManagePremium ? "is-manage" : ""}`}
                                  onClick={() => handlePremiumAction(post)}
                                  title={canManagePremium ? t("profile.managePremium") : t("profile.goPremium")}
                                >
                                  <Icon n={canManagePremium ? "shield-check" : "sparkles"} />
                                  {canManagePremium ? t("profile.managePremium") : t("profile.goPremium")}
                                </button>
                                <div className="my-post-card__actions my-post-card__actions--footer">
                                  <button className="btn btn--small btn--outline" onClick={() => navigate(detailPath)} title={t("common.viewDetails")}>
                                    <Icon n="eye" /> {t("common.viewDetails")}
                                  </button>
                                  <button className="btn btn--small btn--outline" onClick={() => navigate(`/edit-villa/${post.id}`)} title={t("common.edit")}>
                                    <Icon n="pen" /> {t("common.edit")}
                                  </button>
                                  <button className="btn btn--small btn--danger" onClick={() => handleDeleteMyPost(post.id)} title={t("common.delete")}>
                                    <Icon n="trash" /> {t("common.delete")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="my-post-card__updated">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M12 7.25a.75.75 0 0 1 .75.75v3.69l2.42 1.45a.75.75 0 0 1-.77 1.28l-2.78-1.67a.75.75 0 0 1-.37-.64V8a.75.75 0 0 1 .75-.75ZM12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.51 8.51 0 0 0 12 3.5Zm0 1.5a7 7 0 1 1-7 7 7.01 7.01 0 0 1 7-7Z"
                                fill="currentColor"
                              />
                            </svg>
                            <span>{t("profile.updatedToday")}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "saved" && (
              <div>
                <h2>{t("profile.savedListings")}</h2>
                {loadingPosts ? (
                  <div className="admin-empty">
                    <p>{t("profile.loadingSaved")}</p>
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="admin-empty">
                    <Icon n="bookmark" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                    <p>{t("profile.noSaved")}</p>
                  </div>
                ) : (
                  <div className="listings-grid profile-listings-grid">
                    {savedPosts.map((post) => (
                      <PropertyCard
                        key={post.id}
                        post={post}
                        experience={getListingExperience(post)}
                        to={getExperienceDetailPath(getListingExperience(post), post.id, post.title)}
                        onToggleFavorite={handleToggleSaved}
                        isFavorite
                        onDelete={handleDeleteListing}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "analytics" && (
              <div>
                <ListingAnalyticsDashboard user={user} isAdmin={isAdmin} />
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
