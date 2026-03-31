import { useEffect, useState } from "react";
import { updateEmail, updateProfile } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import ListingAnalyticsDashboard from "../components/ListingAnalyticsDashboard.jsx";
import PaidPlanStatusPanel from "../components/PaidPlanStatusPanel.jsx";
import { BrandLogo, Icon, PropertyCard } from "../components/Shared.jsx";
import { auth } from "../firebase.js";
import { setUser } from "../utils/storage.js";
import { getListingsByIds } from "../services/listings.js";
import { listMyPosts, deletePost, onPendingCount } from "../services/posts.js";
import { listSavedListingIds, toggleSavedListing, updateUserProfile } from "../services/users.js";
import { getExperienceDetailPath, getListingExperience } from "../utils/experience.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const BASE_TABS = [
  { key: "info", icon: "user", label: "Informacionet" },
  { key: "listings", icon: "list", label: "Shpalljet e mia" },
  { key: "analytics", icon: "chart-line", label: "Statistikat" },
  { key: "saved", icon: "bookmark", label: "Të ruajturat" },
];

const parseName = (name = "") => {
  const [firstName = "", ...rest] = name.trim().split(" ");
  return { firstName, lastName: rest.join(" ") };
};

export default function ProfilePage({ user, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState("info");
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const isAdmin = user?.role === "admin";
  const TABS = isAdmin
    ? [...BASE_TABS, { key: "admin", icon: "shield-halved", label: "Paneli Admin" }]
    : BASE_TABS;
  const [status, setStatus] = useState({ type: "", message: "" });
  const [form, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

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
    const value = new URLSearchParams(location.search).get("tab");
    if (value && TABS.some((item) => item.key === value)) {
      setTab(value);
    }
  }, [location.search, TABS]);

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
      } catch (error) {
        console.error("Failed to load profile listings:", error);
        if (isMounted) {
          setStatus({ type: "error", message: "Nuk u ngarkuan të dhënat e profilit." });
        }
      } finally {
        if (isMounted) setLoadingPosts(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, onUpdateUser]);

  const set = (k, v) => setFormState((f) => ({ ...f, [k]: v }));

  if (!user) return null;

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const nextName = `${form.firstName} ${form.lastName}`.trim();
    if (!nextName || !form.email) {
      showStatus("error", "Emri dhe email-i janë të detyrueshëm.");
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
      showStatus("success", "Ndryshimet u ruajtën me sukses.");
    } catch (error) {
      console.error("Failed to save profile:", error);
      if (error.code === "auth/requires-recent-login") {
        showStatus("error", "Për ndryshim email-i, kyçu sërish dhe provo prapë.");
      } else {
        showStatus("error", "Nuk u ruajtën ndryshimet. Provo përsëri.");
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = user.name?.charAt(0)?.toUpperCase() || "U";

  const handleToggleSaved = async (post) => {
    try {
      const didSave = await toggleSavedListing(user.id, post.id);
      setSavedPosts((prev) => {
        if (didSave) return [post, ...prev.filter((item) => item.id !== post.id)];
        return prev.filter((item) => item.id !== post.id);
      });
      onUpdateUser((currentUser) => {
        if (!currentUser) return currentUser;
        const currentFavorites = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
        const nextFavorites = didSave
          ? Array.from(new Set([...currentFavorites, post.id]))
          : currentFavorites.filter((id) => id !== post.id);
        return { ...currentUser, favorites: nextFavorites };
      });
    } catch (error) {
      console.error("Failed to toggle saved listing:", error);
      setStatus({ type: "error", message: "Nuk u ruajt veprimi i të preferuarave." });
    }
  };

  const handleDeleteListing = (listingId) => {
    setMyPosts((prev) => prev.filter((post) => post.id !== listingId));
    setSavedPosts((prev) => prev.filter((post) => post.id !== listingId));
    onUpdateUser((currentUser) => {
      if (!currentUser) return currentUser;
      const favorites = Array.isArray(currentUser.favorites) ? currentUser.favorites : [];
      return { ...currentUser, favorites: favorites.filter((id) => id !== listingId) };
    });
  };

  const handleDeleteMyPost = async (postId) => {
    if (!window.confirm("A jeni i sigurt qe deshironi te fshini kete shpallje?")) return;
    try {
      await deletePost(postId);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      showStatus("success", "Shpallja u fshi me sukses.");
    } catch (err) {
      console.error("Failed to delete post:", err);
      showStatus("error", "Nuk u arrit te fshihet shpallja. Provo perseri.");
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          <button className="btn btn--ghost profile-back-btn" onClick={() => navigate("/")}>
            <Icon n="arrow-left" /> <span className="profile-back-btn__label">Kthehu</span>
          </button>
          <BrandLogo light onClick={() => navigate("/")} />
          <div className="profile-header-actions">
            <button className="btn btn--primary" onClick={onLogout}>Çkyçu</button>
          </div>
        </div>
      </header>

      <main className="container profile-page">
        <h1 className="profile-page__title">Profili im</h1>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <p className="profile-upload-hint">Llogaria jote aktive</p>
            </div>
            <nav className="profile-nav">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`profile-nav-item ${tab === t.key ? "active" : ""}`}
                  onClick={() => t.key === "admin" ? navigate("/admin") : setTab(t.key)}
                >
                  <Icon n={t.icon} /> {t.label}
                  {t.key === "admin" && pendingCount > 0 && (
                    <span className="profile-nav-badge">{pendingCount}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <section className="profile-content">
            {tab === "info" && (
              <div>
                <h2>Informacionet personale</h2>
                <form onSubmit={handleSave}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Emri</label>
                      <input type="text" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Mbiemri</label>
                      <input type="text" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Numri i telefonit</label>
                      <input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+383 49 000 000" />
                    </div>
                    <div className="form-group">
                      <label>Adresa</label>
                      <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Qyteti, rruga" />
                    </div>
                    <div className="form-group form-group--full">
                      <label>Email</label>
                      <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="submit-btn" style={{ maxWidth: 220 }} disabled={saving}>
                    <Icon n="save" /> {saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                  </button>
                  {status.message && <p className={`profile-status ${status.type}`}>{status.message}</p>}
                </form>
                <p className="profile-upload-hint" style={{ marginTop: 18 }}>
                  Fshirja e llogarisë kërkon verifikim shtesë. Për momentin përdor butonin "Çkyçu".
                </p>
              </div>
            )}

            {tab === "listings" && (
              <div>
                <PaidPlanStatusPanel user={user} />
                <div className="my-posts-header">
                  <div className="my-posts-header__copy">
                    <p className="my-posts-header__eyebrow">PANELI IM</p>
                    <h2 className="my-posts-header__title">Shpalljet e mia</h2>
                  </div>
                  <button className="btn btn--primary my-posts-header__cta" onClick={() => navigate("/create")}>
                    <Icon n="plus" /> Shto shpallje
                  </button>
                </div>
                {loadingPosts ? (
                  <div className="admin-empty">
                    <p>Duke ngarkuar shpalljet...</p>
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="admin-empty">
                    <Icon n="house-circle-xmark" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                    <p>Nuk ke asnjë shpallje ende.</p>
                  </div>
                ) : (
                  <div className="my-posts-list">
                    {myPosts.map((p) => (
                      <div className="my-post-card-wrap" key={p.id}>
                        <div className="my-post-card">
                          <div className="my-post-card__main">
                            <div className="my-post-card__top">
                              <div className="my-post-card__image">
                                {p.image ? <img src={p.image} alt={p.title} /> : <Icon n="image" />}
                              </div>
                              <div className="my-post-card__info">
                                <div className="my-post-card__title-row">
                                  <h3>{p.title}</h3>
                                  <div className="my-post-card__status-group">
                                    <span className={`status-badge status-badge--${p.status || "pending"} my-post-card__status`}>
                                      {p.statusBadge || "Wait to confirm"}
                                    </span>
                                    {p.premiumStatus && p.premiumStatus !== "none" && (
                                      <span className={`paid-plan-status-badge paid-plan-status-badge--${p.premiumStatus === "active" ? "approved" : p.premiumStatus}`}>
                                        {p.premiumStatus === "pending"
                                          ? "Premium ne pritje"
                                          : p.premiumStatus === "active"
                                          ? "Premium aktiv"
                                          : p.premiumStatus === "rejected"
                                          ? "Premium refuzuar"
                                          : p.premiumStatus === "expired"
                                          ? "Premium skaduar"
                                          : "Premium"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="my-post-card__location"><Icon n="location-dot" /> {p.location}</p>
                                <p className="my-post-card__price">
                                  <span className="my-post-card__price-value">€ {p.price}</span>
                                  <span className="my-post-card__price-suffix">/ natë</span>
                                </p>
                              </div>
                            </div>
                            <div className="my-post-card__side">
                              <div className="my-post-card__side-top">
                                <span className={`status-badge status-badge--${p.status || "pending"} my-post-card__status my-post-card__status--side-row`}>
                                  {p.statusBadge || "Wait to confirm"}
                                </span>
                                <span className="my-post-card__id my-post-card__id--side">ID: #{p.idNumber}</span>
                              </div>
                              <div className="my-post-card__actions my-post-card__actions--side">
                                <button
                                  className="btn btn--small btn--outline"
                                  onClick={() => navigate(`/villa/${p.id}`)}
                                  title="Shiko detajet e shpalljes"
                                >
                                  <Icon n="eye" /> Shiko Detajet
                                </button>
                                <button
                                  className="btn btn--small btn--outline"
                                  onClick={() => navigate(`/edit-villa/${p.id}`)}
                                  title="Edito shpalljen"
                                >
                                  <Icon n="pen" /> Edito
                                </button>
                                <button
                                  className="btn btn--small btn--danger"
                                  onClick={() => handleDeleteMyPost(p.id)}
                                  title="Fshi shpalljen"
                                >
                                  <Icon n="trash" /> Fshi
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="my-post-card__bar">
                            <div className="my-post-card__footer-meta">
                              <span className="my-post-card__id">ID: #{p.idNumber}</span>
                              <span className="my-post-card__live">
                                <span className="my-post-card__live-dot" />
                                Live
                              </span>
                            </div>
                            <div className="my-post-card__actions my-post-card__actions--footer">
                              <button
                                className="btn btn--small btn--outline"
                                onClick={() => navigate(`/villa/${p.id}`)}
                                title="Shiko detajet e shpalljes"
                              >
                                <Icon n="eye" /> Shiko Detajet
                              </button>
                              <button
                                className="btn btn--small btn--outline"
                                onClick={() => navigate(`/edit-villa/${p.id}`)}
                                title="Edito shpalljen"
                              >
                                <Icon n="pen" /> Edito
                              </button>
                              <button
                                className="btn btn--small btn--danger"
                                onClick={() => handleDeleteMyPost(p.id)}
                                title="Fshi shpalljen"
                              >
                                <Icon n="trash" /> Fshi
                              </button>
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
                          <span>Përditësuar sot</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "saved" && (
              <div>
                <h2>Shpalljet e ruajtura</h2>
                {loadingPosts ? (
                  <div className="admin-empty">
                    <p>Duke ngarkuar shpalljet e ruajtura...</p>
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="admin-empty">
                    <Icon n="bookmark" style={{ fontSize: "2rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                    <p>Nuk ke asnjë shpallje të ruajtur ende.</p>
                  </div>
                ) : (
                  <div className="listings-grid profile-listings-grid">
                    {savedPosts.map((p) => (
                      <PropertyCard
                        key={p.id}
                        post={p}
                        experience={getListingExperience(p)}
                        to={getExperienceDetailPath(getListingExperience(p), p.id, p.title)}
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
                <ListingAnalyticsDashboard user={user} />
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
