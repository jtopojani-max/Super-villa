import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperienceSwitch from "../components/ExperienceSwitch.jsx";
import { Footer, Icon, Navbar, PremiumSection, PropertyCard } from "../components/Shared.jsx";
import { getExperienceConfig } from "../config/experiences.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { listListings } from "../services/listings.js";
import { listPublicPosts } from "../services/posts.js";
import { toggleSavedListing } from "../services/users.js";
import {
  filterListingsByExperience,
  getExperienceCatalogPath,
  getExperienceDetailPath,
  normalizeExperience,
} from "../utils/experience.js";

export default function PropertyCatalogPage({ user, onLogout, onUpdateUser, experience = "villas" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const experienceKey = normalizeExperience(experience);
  const config = getExperienceConfig(experienceKey);
  const expKey = experienceKey === "apartments" ? "exp.apartments" : "exp.villas";
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [oldListings, moderatedPosts] = await Promise.all([listListings(), listPublicPosts()]);
        const data = [...moderatedPosts, ...oldListings];
        if (isMounted) setPosts(data);
      } catch (loadError) {
        console.error("Failed to load listings page:", loadError);
        if (isMounted) setError(t("errors.listingsLoadFailed"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const experiencePosts = useMemo(
    () => filterListingsByExperience(posts, experienceKey),
    [posts, experienceKey]
  );

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
      console.error("Failed to update favorites:", favoriteError);
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

  return (
    <div className={`experience ${config.themeClass}`}>
      <Navbar user={user} onLogout={onLogout} experience={experienceKey} />

      {/* Premium section: dedicated curated slider for each catalog page. */}
      <PremiumSection collectionName={experienceKey} limitCount={6} />

      <section className="listings listings--page experience-catalog">
        <div className="container">
          <div className="section-head section-head--stacked">
            <div>
              <p className="section-tag">{t(`${expKey}.catalogTag`)}</p>
              <h2 className="section-title">{t(`${expKey}.catalogTitle`)}</h2>
            </div>
            <ExperienceSwitch value={experienceKey} onChange={(next) => navigate(getExperienceCatalogPath(next))} />
          </div>

          <div className="listings-grid">
            {loading ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                <p>Duke ngarkuar listimet...</p>
              </div>
            ) : error ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--error)" }}>
                <p>{error}</p>
              </div>
            ) : experiencePosts.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                <Icon n="house-circle-xmark" style={{ fontSize: "2.5rem", opacity: 0.25, display: "block", marginBottom: 12 }} />
                <p>{config.catalog.empty}</p>
              </div>
            ) : (
              experiencePosts.map((post) => (
                <PropertyCard
                  key={post.id}
                  post={post}
                  experience={experienceKey}
                  to={getExperienceDetailPath(experienceKey, post.id, post.title)}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={Boolean(user?.favorites?.includes(post.id))}
                  onDelete={handleDeleteListing}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <Footer experience={experienceKey} />
    </div>
  );
}
