import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Shared.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import PropertyFeaturesField from "../components/PropertyFeaturesField.jsx";
import LocationPicker from "../components/Map/LocationPicker.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateCategory } from "../i18n/ui.js";
import { auth } from "../firebase.js";
import { CITIES } from "../utils/storage.js";
import { isValidImageUrl } from "../utils/imageUpload.js";
import { normalizeListingFeatures } from "../utils/listingFeatures.js";
import { getPostById, updatePost } from "../services/posts.js";
import airbnbLogo from "../assets/airbnb-tile.svg";

const EMPTY = {
  title: "",
  description: "",
  category: "Villa",
  price: "",
  location: "",
  rooms: "",
  beds: "",
  baths: "",
  guests: "",
  isPremium: false,
  premiumOrder: "",
  whatsapp: "",
  features: [],
  imageUrls: [],
  address: "",
  city: "",
  country: "",
  lat: null,
  lng: null,
  hasAirbnb: false,
  airbnbUrl: "",
};

const CATEGORIES = ["Villa", "Apartament"];

const sanitizeWhatsapp = (value) => value.replace(/[^\d+]/g, "").replace(/^00/, "+");
const isValidWhatsapp = (value) => /^\+?\d{8,15}$/.test(value);

const AIRBNB_URL_REGEX = /^https?:\/\/(www\.)?(airbnb\.[a-z]{2,}|abnb\.me)(\/.*)?$/i;
const isValidAirbnbUrl = (url) => AIRBNB_URL_REGEX.test((url || "").trim());

const mapPostToForm = (post) => ({
  title: post.title || "",
  description: post.description || "",
  category: post.category || "Villa",
  price: post.price != null ? String(post.price) : "",
  location: post.location || "",
  rooms: post.rooms != null ? String(post.rooms) : "",
  beds: post.beds != null ? String(post.beds) : "",
  baths: post.baths != null ? String(post.baths) : "",
  guests: post.guests != null ? String(post.guests) : "",
  isPremium: Boolean(post.isPremium),
  premiumOrder: post.premiumOrder != null ? String(post.premiumOrder) : "",
  whatsapp: post.whatsapp || "",
  features: normalizeListingFeatures(post.features || [], post.category),
  imageUrls: Array.isArray(post.images) && post.images.length ? post.images : post.image ? [post.image] : [],
  address: post.address || "",
  city: post.city || "",
  country: post.country || "",
  lat: post.lat || null,
  lng: post.lng || null,
  hasAirbnb: Boolean(post.hasAirbnb),
  airbnbUrl: post.airbnbUrl || "",
});

export default function EditVilla({ user }) {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const canManagePremium = user?.role === "admin";

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setCategory = (category) =>
    setForm((current) => ({
      ...current,
      category,
      features: normalizeListingFeatures(current.features, category),
    }));
  const toggleFeature = (feature) =>
    setForm((current) => {
      const nextFeatures = current.features.includes(feature)
        ? current.features.filter((value) => value !== feature)
        : [...current.features, feature];

      return {
        ...current,
        features: normalizeListingFeatures(nextFeatures, current.category),
      };
    });

  useEffect(() => {
    let isMounted = true;

    const loadPost = async () => {
      if (!id) {
        setError(t("editPost.notFound"));
        setLoading(false);
        return;
      }

      try {
        const currentUser = auth.currentUser;
        const data = await getPostById(id);

        if (!isMounted) return;
        if (!data) {
          setError(t("editPost.notFound"));
          setLoading(false);
          return;
        }

        if (!currentUser?.uid || currentUser.uid !== data.ownerUid) {
          setError(t("editPost.noPermission"));
          setLoading(false);
          return;
        }

        setPost(data);
        setForm(mapPostToForm(data));
      } catch (loadError) {
        console.error("Failed to load post for edit:", loadError);
        if (isMounted) setError(t("editPost.loadError"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [id, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!post) {
      setError(t("editPost.notFound"));
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser?.uid || currentUser.uid !== post.ownerUid) {
      setError(t("editPost.noPermission"));
      return;
    }
    if (imageUploading) {
      setError(t("editPost.waitForUpload"));
      return;
    }

    const requiredFields = ["title", "description", "price", "location", "rooms", "beds", "baths", "whatsapp"];
    if (requiredFields.some((field) => !form[field])) {
      setError(t("editPost.fillAllFields"));
      return;
    }
    if (!form.imageUrls.length) {
      setError(t("editPost.addPhoto"));
      return;
    }
    if (canManagePremium && form.isPremium) {
      const premiumOrder = Number.parseInt(form.premiumOrder, 10);
      if (!Number.isInteger(premiumOrder) || premiumOrder < 1 || premiumOrder > 10) {
        setError(t("editPost.premiumOrderError"));
        return;
      }
    }
    if (form.imageUrls.length > 10) {
      setError(t("editPost.maxPhotos"));
      return;
    }
    if (form.imageUrls.some((url) => !isValidImageUrl(url))) {
      setError(t("editPost.invalidPhotoUrl"));
      return;
    }

    const cleanWhatsapp = sanitizeWhatsapp(form.whatsapp);
    if (!isValidWhatsapp(cleanWhatsapp)) {
      setError(t("editPost.invalidWhatsApp"));
      return;
    }
    if (form.hasAirbnb && !form.airbnbUrl.trim()) {
      setError(t("editPost.airbnbUrlRequired"));
      return;
    }
    if (form.hasAirbnb && !isValidAirbnbUrl(form.airbnbUrl)) {
      setError(t("editPost.airbnbUrlInvalid"));
      return;
    }

    setSubmitting(true);

    try {
      await updatePost(post.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        location: form.location,
        rooms: Number(form.rooms),
        beds: Number(form.beds),
        baths: Number(form.baths),
        guests: Number(form.guests) || Number(form.beds) * 2,
        whatsapp: cleanWhatsapp,
        features: form.features,
        image: form.imageUrls[0],
        images: form.imageUrls,
        companyName: "",
        isPremium: canManagePremium ? form.isPremium : undefined,
        premiumOrder: canManagePremium && form.isPremium ? Number(form.premiumOrder) : null,
        hasAirbnb: form.hasAirbnb,
        airbnbUrl: form.hasAirbnb ? form.airbnbUrl.trim() : null,
        address: form.address || "",
        city: form.city || "",
        country: form.country || "",
        lat: form.lat || null,
        lng: form.lng || null,
      });

      setSuccess(t("editPost.success"));
      setTimeout(() => navigate("/profile?tab=listings"), 2500);
    } catch (saveError) {
      console.error("Failed to update post:", saveError);
      setError(t("editPost.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-form">
        <div className="page-form__header">
          <div className="page-form__header-inner">
            <div>
              <h1 className="page-form__title">{t("editPost.title")}</h1>
              <p className="page-form__subtitle">{t("editPost.loadingData")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="page-form">
        <div className="page-form__header">
          <div className="page-form__header-inner">
            <div>
              <h1 className="page-form__title">{t("editPost.title")}</h1>
              <p className="page-form__subtitle">{t("editPost.cannotContinue")}</p>
            </div>
            <button className="btn btn--ghost" onClick={() => navigate("/profile?tab=listings")}>
              <Icon n="arrow-left" /> {t("common.back")}
            </button>
          </div>
        </div>

        <div className="container">
          <div className="form-card">
            <p className="auth-server-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-form">
      <div className="page-form__header">
        <div className="page-form__header-inner">
          <div>
            <h1 className="page-form__title">{t("editPost.title")}</h1>
            <p className="page-form__subtitle">{t("editPost.subtitle")}</p>
          </div>
          <div className="page-form__header-actions">
            <p className="page-form__user">
              {t("editPost.loggedAs")}
              <strong>{auth.currentUser?.displayName || auth.currentUser?.email || t("messages.defaultUser")}</strong>
            </p>
            <button className="btn btn--ghost" onClick={() => navigate("/profile?tab=listings")}>
              <Icon n="arrow-left" /> {t("common.back")}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="form-card">
          {success && <div className="alert-success">{success}</div>}
          {error && <p className="auth-server-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group form-group--full">
                <label>{t("editPost.titleLabel")}</label>
                <input type="text" value={form.title} onChange={(event) => set("title", event.target.value)} placeholder={t("editPost.titlePlaceholder")} />
              </div>

              <div className="form-group form-group--full">
                <label>{t("editPost.descLabel")}</label>
                <textarea rows={4} value={form.description} onChange={(event) => set("description", event.target.value)} placeholder={t("editPost.descPlaceholder")} />
              </div>

              <div className="form-group">
                <label>{t("editPost.priceLabel")}</label>
                <input type="number" min="1" value={form.price} onChange={(event) => set("price", event.target.value)} placeholder="220" />
              </div>

              <div className="form-group">
                <label>{t("createPost.locationLabel")}</label>
                <select value={form.location} onChange={(event) => set("location", event.target.value)}>
                  <option value="">{t("editPost.selectCity")}</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("createPost.categoryLabel")}</label>
                <select value={form.category} onChange={(event) => setCategory(event.target.value)}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {translateCategory(category, t)}
                    </option>
                  ))}
                </select>
              </div>

              {canManagePremium && (
                <>
                  <div className="form-group">
                    <label className="premium-toggle-field">
                      <input
                        type="checkbox"
                        checked={form.isPremium}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            isPremium: event.target.checked,
                            premiumOrder: event.target.checked ? current.premiumOrder : "",
                          }))
                        }
                      />
                      <span>{t("editPost.markPremium")}</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>{t("editPost.premiumOrderLabel")}</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={form.premiumOrder}
                      disabled={!form.isPremium}
                      onChange={(event) => set("premiumOrder", event.target.value)}
                      placeholder="1"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>{t("createPost.roomsLabel")}</label>
                <input type="number" min="1" value={form.rooms} onChange={(event) => set("rooms", event.target.value)} placeholder="4" />
              </div>

              <div className="form-group">
                <label>{t("createPost.bedsLabel")}</label>
                <input type="number" min="1" value={form.beds} onChange={(event) => set("beds", event.target.value)} placeholder="3" />
              </div>

              <div className="form-group">
                <label>{t("createPost.bathsLabel")}</label>
                <input type="number" min="1" value={form.baths} onChange={(event) => set("baths", event.target.value)} placeholder="2" />
              </div>

              <div className="form-group">
                <label>{t("createPost.guestsLabel")}</label>
                <input type="number" min="1" value={form.guests} onChange={(event) => set("guests", event.target.value)} placeholder="8" />
              </div>

              <div className="form-group form-group--full">
                <label className="airbnb-toggle-label">
                  <input
                    type="checkbox"
                    className="airbnb-toggle-checkbox"
                    checked={form.hasAirbnb}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        hasAirbnb: event.target.checked,
                        airbnbUrl: event.target.checked ? current.airbnbUrl : "",
                      }))
                    }
                  />
                  <span className="airbnb-toggle-text">
                    <img src={airbnbLogo} alt="" width="20" height="20" className="airbnb-icon" aria-hidden="true" />
                    {t("editPost.airbnbToggle")}
                  </span>
                </label>
                {form.hasAirbnb && (
                  <div className="airbnb-url-field">
                    <label htmlFor="airbnb-url-edit">{t("editPost.airbnbUrlLabel")}</label>
                    <input
                      id="airbnb-url-edit"
                      type="url"
                      value={form.airbnbUrl}
                      onChange={(event) => set("airbnbUrl", event.target.value)}
                      placeholder={t("editPost.airbnbUrlPlaceholder")}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t("editPost.whatsappLabel")}</label>
                <input type="text" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} placeholder="38349123456" />
              </div>

              <LocationPicker
                value={{ address: form.address, city: form.city, country: form.country, lat: form.lat, lng: form.lng }}
                onChange={({ address, city, country, lat, lng }) => {
                  setForm((current) => ({ ...current, address, city, country, lat, lng }));
                }}
              />

              <PropertyFeaturesField category={form.category} values={form.features} onToggle={toggleFeature} />

              <ImageUploader
                className="form-group form-group--full"
                uid={auth.currentUser?.uid}
                values={form.imageUrls}
                onChange={(nextValues) => {
                  set("imageUrls", nextValues);
                  setError("");
                }}
                onUploadingChange={setImageUploading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || imageUploading}>
              <Icon n="save" /> {submitting ? t("editPost.savingChanges") : imageUploading ? t("editPost.uploadingPhotos") : t("editPost.submitBtn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
