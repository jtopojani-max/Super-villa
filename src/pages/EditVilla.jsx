import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Shared.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import PropertyFeaturesField from "../components/PropertyFeaturesField.jsx";
import LocationPicker from "../components/Map/LocationPicker.jsx";
import { auth } from "../firebase.js";
import { CITIES } from "../utils/storage.js";
import { isValidImageUrl } from "../utils/imageUpload.js";
import { normalizeListingFeatures } from "../utils/listingFeatures.js";
import { getPostById, updatePost } from "../services/posts.js";

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
};

const CATEGORIES = ["Villa", "Apartament"];

const sanitizeWhatsapp = (value) => value.replace(/[^\d+]/g, "").replace(/^00/, "+");

const isValidWhatsapp = (value) => /^\+?\d{8,15}$/.test(value);

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
});

export default function EditVilla({ user }) {
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
        setError("Shpallja nuk u gjet.");
        setLoading(false);
        return;
      }

      try {
        const currentUser = auth.currentUser;
        const data = await getPostById(id);

        if (!isMounted) return;
        if (!data) {
          setError("Shpallja nuk u gjet.");
          setLoading(false);
          return;
        }

        if (!currentUser?.uid || currentUser.uid !== data.ownerUid) {
          setError("Nuk keni leje ta editoni kete shpallje.");
          setLoading(false);
          return;
        }

        setPost(data);
        setForm(mapPostToForm(data));
      } catch (loadError) {
        console.error("Failed to load post for edit:", loadError);
        if (isMounted) setError("Nuk u arrit te ngarkohet shpallja per editim.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!post) {
      setError("Shpallja nuk u gjet.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser?.uid || currentUser.uid !== post.ownerUid) {
      setError("Nuk keni leje ta editoni kete shpallje.");
      return;
    }

    if (imageUploading) {
      setError("Prit sa te perfundoje ngarkimi i fotos.");
      return;
    }

    const requiredFields = ["title", "description", "price", "location", "rooms", "beds", "baths", "whatsapp"];
    const hasMissingRequiredField = requiredFields.some((field) => !form[field]);
    if (hasMissingRequiredField) {
      setError("Ploteso te gjitha fushat.");
      return;
    }

    if (!form.imageUrls.length) {
      setError("Shto te pakten nje foto.");
      return;
    }

    if (canManagePremium && form.isPremium) {
      const premiumOrder = Number.parseInt(form.premiumOrder, 10);
      if (!Number.isInteger(premiumOrder) || premiumOrder < 1 || premiumOrder > 10) {
        setError("Renditja premium duhet te jete nje numer nga 1 deri ne 10.");
        return;
      }
    }

    if (form.imageUrls.length > 10) {
      setError("Mund te shtosh maksimumi 10 foto.");
      return;
    }

    if (form.imageUrls.some((url) => !isValidImageUrl(url))) {
      setError("Nje ose me shume foto kane link jo-valid.");
      return;
    }

    const cleanWhatsapp = sanitizeWhatsapp(form.whatsapp);
    if (!isValidWhatsapp(cleanWhatsapp)) {
      setError("Numri i WhatsApp duhet te jete valid (p.sh. +38349123456).");
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
        address: form.address || "",
        city: form.city || "",
        country: form.country || "",
        lat: form.lat || null,
        lng: form.lng || null,
      });

      setSuccess("Ndryshimet u ruajten me sukses! Shpallja do te shqyrtohet perseri nga admini.");
      setTimeout(() => navigate("/profile?tab=listings"), 2500);
    } catch (saveError) {
      console.error("Failed to update post:", saveError);
      setError("Nuk u arrit te ruhen ndryshimet. Provo perseri.");
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
              <h1 className="page-form__title">Edito shpalljen</h1>
              <p className="page-form__subtitle">Duke ngarkuar te dhenat e shpalljes...</p>
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
              <h1 className="page-form__title">Edito shpalljen</h1>
              <p className="page-form__subtitle">Nuk mund te vazhdohet me editimin.</p>
            </div>
            <button className="btn btn--ghost" onClick={() => navigate("/profile?tab=listings")}>
              <Icon n="arrow-left" /> Kthehu
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
            <h1 className="page-form__title">Edito shpalljen</h1>
            <p className="page-form__subtitle">Perditeso detajet e shpalljes tende</p>
          </div>
          <div className="page-form__header-actions">
            <p className="page-form__user">
              I kycur si: <strong>{auth.currentUser?.displayName || auth.currentUser?.email || "Perdorues"}</strong>
            </p>
            <button className="btn btn--ghost" onClick={() => navigate("/profile?tab=listings")}>
              <Icon n="arrow-left" /> Kthehu
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
                <label>Titulli i prones</label>
                <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="p.sh. Villa luksoze me pishine" />
              </div>

              <div className="form-group form-group--full">
                <label>Pershkrimi</label>
                <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Pershkruaj pronen, ambientin dhe kushtet..." />
              </div>

              <div className="form-group">
                <label>Cmimi (€/nate)</label>
                <input type="number" min="1" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="220" />
              </div>

              <div className="form-group">
                <label>Lokacioni</label>
                <select value={form.location} onChange={(e) => set("location", e.target.value)}>
                  <option value="">Zgjedh qytetin</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Kategoria</label>
                <select value={form.category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {canManagePremium && (
                <>
                  {/* Premium section: admin-only controls for the curated home carousel. */}
                  <div className="form-group">
                    <label className="premium-toggle-field">
                      <input
                        type="checkbox"
                        checked={form.isPremium}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            isPremium: e.target.checked,
                            premiumOrder: e.target.checked ? current.premiumOrder : "",
                          }))
                        }
                      />
                      <span>Shenoje si premium</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Renditja premium (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={form.premiumOrder}
                      disabled={!form.isPremium}
                      onChange={(e) => set("premiumOrder", e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Dhoma</label>
                <input type="number" min="1" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} placeholder="4" />
              </div>

              <div className="form-group">
                <label>Shtreter</label>
                <input type="number" min="1" value={form.beds} onChange={(e) => set("beds", e.target.value)} placeholder="3" />
              </div>

              <div className="form-group">
                <label>Banjo</label>
                <input type="number" min="1" value={form.baths} onChange={(e) => set("baths", e.target.value)} placeholder="2" />
              </div>

              <div className="form-group">
                <label>Persona</label>
                <input type="number" min="1" value={form.guests} onChange={(e) => set("guests", e.target.value)} placeholder="8" />
              </div>

              <div className="form-group">
                <label>Numri WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="38349123456" />
              </div>

              <LocationPicker
                value={{ address: form.address, city: form.city, country: form.country, lat: form.lat, lng: form.lng }}
                onChange={({ address, city, country, lat, lng }) => {
                  setForm((f) => ({ ...f, address, city, country, lat, lng }));
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
              <Icon n="save" /> {submitting ? "Duke ruajtur..." : imageUploading ? "Duke ngarkuar fotot..." : "Ruaj ndryshimet"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
