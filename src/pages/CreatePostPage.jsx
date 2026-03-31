import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Shared.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import PropertyFeaturesField from "../components/PropertyFeaturesField.jsx";
import GoogleLocationPicker from "../components/Map/GoogleLocationPicker.jsx";
import { CITIES } from "../utils/storage.js";
import { isValidImageUrl } from "../utils/imageUpload.js";
import { normalizeListingFeatures } from "../utils/listingFeatures.js";
import { createPost } from "../services/posts.js";

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
  phoneCode: "+383",
  phoneNumber: "",
  features: [],
  imageUrls: [],
  // Location (Google Places)
  placeName: "",
  address: "",
  street: "",
  city: "",
  country: "",
  postalCode: "",
  placeId: "",
  placeType: "",
  lat: null,
  lng: null,
};

const CATEGORIES = ["Villa", "Apartament"];

const COUNTRY_CODES = [
  { code: "+383", country: "Kosovë",   flag: "🇽🇰", placeholder: "44 123 456",  maxDigits: 8, example: "383 44 xxx xxx" },
  { code: "+355", country: "Shqipëri", flag: "🇦🇱", placeholder: "69 123 4567", maxDigits: 8, example: "355 69 xxx xxxx" },
  { code: "+389", country: "Maqedoni", flag: "🇲🇰", placeholder: "70 123 456",  maxDigits: 8, example: "389 70 xxx xxx" },
  { code: "+381", country: "Serbi",    flag: "🇷🇸", placeholder: "60 123 4567", maxDigits: 8, example: "381 60 xxx xxxx" },
  { code: "+49",  country: "Gjermani", flag: "🇩🇪", placeholder: "151 1234567", maxDigits: 8, example: "49 xxx xxx xx" },
  { code: "+39",  country: "Itali",    flag: "🇮🇹", placeholder: "320 123 4567",maxDigits: 8, example: "39 xxx xxx xxxx" },
  { code: "+41",  country: "Zvicër",   flag: "🇨🇭", placeholder: "76 123 4567", maxDigits: 8, example: "41 xx xxx xx xx" },
  { code: "+43",  country: "Austri",   flag: "🇦🇹", placeholder: "650 123 4567",maxDigits: 8, example: "43 xxx xxx xxxx" },
  { code: "+44",  country: "UK",       flag: "🇬🇧", placeholder: "7700 900123", maxDigits: 8, example: "44 xxx xxx xxxx" },
  { code: "+1",   country: "USA/CAN",  flag: "🇺🇸", placeholder: "212 555 0100",maxDigits: 8, example: "1 xxx xxx xxxx" },
];

export default function CreatePostPage({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState("");
  const phoneWrapperRef = useRef(null);

  // Close phone dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (phoneWrapperRef.current && !phoneWrapperRef.current.contains(e.target)) {
        setShowCodeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
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

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === form.phoneCode) || COUNTRY_CODES[0];

  const handleLocationChange = (locationData) => {
    setForm((f) => ({
      ...f,
      placeName: locationData.placeName || "",
      address: locationData.address || "",
      street: locationData.street || "",
      city: locationData.city || "",
      country: locationData.country || "",
      postalCode: locationData.postalCode || "",
      placeId: locationData.placeId || "",
      placeType: locationData.placeType || "",
      lat: locationData.lat ?? null,
      lng: locationData.lng ?? null,
    }));
  };

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (imageUploading) {
      setError("Prit sa të përfundojë ngarkimi i fotos.");
      return;
    }

    if (!form.title.trim()) {
      setError("Titulli është i detyrueshëm.");
      return;
    }
    if (!form.price) {
      setError("Çmimi është i detyrueshëm.");
      return;
    }
    if (!form.description.trim()) {
      setError("Përshkrimi është i detyrueshëm.");
      return;
    }
    if (!form.location) {
      setError("Zgjedh qytetin nga lista.");
      return;
    }
    if (!form.rooms || !form.beds || !form.baths) {
      setError("Plotëso fushat: dhoma, shtretër, banjo.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError("Numri i telefonit është i detyrueshëm.");
      return;
    }
    const cleanPhone = form.phoneNumber.replace(/\s/g, "");
    if (cleanPhone.length < 7) {
      setError("Numri i telefonit është shumë i shkurtër.");
      return;
    }
    if (!form.lat || !form.lng) {
      setError("⚠️ Ju lutem zgjidhni lokacionin nga lista e sugjerimeve të Google Maps.");
      return;
    }
    if (!form.address) {
      setError("⚠️ Adresa është e detyrueshme. Zgjidhni nga lista.");
      return;
    }
    if (!form.imageUrls.length) {
      setError("Shto të paktën një foto.");
      return;
    }
    if (form.imageUrls.length > 10) {
      setError("Mund të shtosh maksimumi 10 foto.");
      return;
    }
    if (form.imageUrls.some((url) => !isValidImageUrl(url))) {
      setError("Një ose më shumë foto kanë link jo-valid.");
      return;
    }

    const fullPhone = form.phoneCode + cleanPhone;

    setSubmitting(true);

    try {
      await createPost({
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        location: form.location,
        rooms: Number(form.rooms),
        beds: Number(form.beds),
        baths: Number(form.baths),
        guests: Number(form.guests) || Number(form.beds) * 2,
        area: 0,
        whatsapp: fullPhone,
        features: form.features,
        image: form.imageUrls[0],
        images: form.imageUrls,
        companyName: "",
        isPremium: false,
        premiumOrder: null,
        // Location data from Google Places
        address: form.address,
        city: form.city,
        country: form.country || "Kosovë",
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        placeId: form.placeId,
        placeName: form.placeName,
        street: form.street,
        postalCode: form.postalCode,
        placeType: form.placeType,
      });

      setSuccess(true);
      setError("");
      setForm(EMPTY);
      setUploaderKey((current) => current + 1);
      setTimeout(() => navigate("/profile?tab=listings"), 2500);
    } catch (err) {
      console.error("Failed to create listing:", err);
      const msg = err?.message || err?.details || "";
      if (msg.includes("unauthenticated")) {
        setError("Duhet të jesh i kyçur për të postuar.");
      } else if (msg.includes("invalid-argument") || msg.includes("numerike")) {
        setError("Të dhënat janë jo-valide: " + msg);
      } else if (msg.includes("network") || msg.includes("unavailable")) {
        setError("Problem me internetin. Provo përsëri.");
      } else {
        setError("Gabim gjatë publikimit: " + (msg || "Provo përsëri."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-form">
      <div className="page-form__header">
        <div className="page-form__header-inner">
          <div>
            <h1 className="page-form__title">Posto shpallje të re</h1>
            <p className="page-form__subtitle">Plotëso detajet e pronës tënde</p>
          </div>
          <div className="page-form__header-actions">
            <p className="page-form__user">
              I kyçur si: <strong>{user.name}</strong>
            </p>
            <button className="btn btn--ghost" onClick={() => navigate("/")}>
              <Icon n="arrow-left" /> Kthehu
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="form-card">
          {success && (
            <div className="alert-success">
              Shpallja u dërgua për aprovim. Admini do ta shqyrtojë përpara se të publikohet.
            </div>
          )}
          {error && <p className="auth-server-error">{error}</p>}

          <form onSubmit={handle}>
            <div className="form-grid">
              <div className="form-group form-group--full">
                <label>Titulli i pronës</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="p.sh. Villa luksoze me pishinë"
                />
              </div>

              <div className="form-group form-group--full">
                <label>Përshkrimi</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Përshkruaj pronën, ambientin dhe kushtet..."
                />
              </div>

              <div className="form-group">
                <label>Çmimi (€/natë)</label>
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="220"
                />
              </div>

              <div className="form-group">
                <label>Lokacioni</label>
                <select value={form.location} onChange={(e) => set("location", e.target.value)}>
                  <option value="">Zgjedh qytetin</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
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

              <div className="form-group">
                <label>Dhoma</label>
                <input
                  type="number"
                  min="1"
                  value={form.rooms}
                  onChange={(e) => set("rooms", e.target.value)}
                  placeholder="4"
                />
              </div>

              <div className="form-group">
                <label>Shtretër</label>
                <input
                  type="number"
                  min="1"
                  value={form.beds}
                  onChange={(e) => set("beds", e.target.value)}
                  placeholder="3"
                />
              </div>

              <div className="form-group">
                <label>Banjo</label>
                <input
                  type="number"
                  min="1"
                  value={form.baths}
                  onChange={(e) => set("baths", e.target.value)}
                  placeholder="2"
                />
              </div>

              <div className="form-group">
                <label>Persona</label>
                <input
                  type="number"
                  min="1"
                  value={form.guests}
                  onChange={(e) => set("guests", e.target.value)}
                  placeholder="8"
                />
              </div>

              {/* Phone number with country code selector */}
              <div className="form-group" ref={phoneWrapperRef} style={{ position: "relative" }}>
                <label>Numri i telefonit (WhatsApp)</label>
                <div className="phone-input-wrapper">
                  <button
                    type="button"
                    className="phone-code-selector"
                    onClick={() => setShowCodeDropdown((v) => !v)}
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <span style={{ fontSize: "10px", opacity: 0.6 }}>▼</span>
                  </button>
                  <input
                    type="tel"
                    className="phone-number-input"
                    value={form.phoneNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d\s]/g, "");
                      // Strip leading 0
                      if (val.length > 0 && val[0] === "0") val = val.slice(1);
                      const digits = val.replace(/\s/g, "");
                      if (digits.length > selectedCountry.maxDigits) {
                        setPhoneWarning(`Numri duhet te jete max ${selectedCountry.maxDigits} shifra pa 0. P.sh: +${selectedCountry.example}`);
                        return;
                      }
                      setPhoneWarning("");
                      set("phoneNumber", val);
                    }}
                    placeholder={selectedCountry.placeholder}
                  />
                </div>
                {phoneWarning && (
                  <div style={{
                    background: "#fff3cd",
                    color: "#856404",
                    border: "1px solid #ffc107",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 13,
                    marginTop: 6,
                    animation: "fadeIn 0.2s ease",
                  }}>
                    {phoneWarning}
                  </div>
                )}

                {showCodeDropdown && (
                  <div className="phone-dropdown">
                    {COUNTRY_CODES.map((item) => (
                      <div
                        key={item.code}
                        className={`phone-dropdown-item${item.code === form.phoneCode ? " active" : ""}`}
                        onMouseDown={() => {
                          set("phoneCode", item.code);
                          setPhoneWarning("");
                          setShowCodeDropdown(false);
                        }}
                      >
                        <span>{item.flag}</span>
                        <span style={{ minWidth: 44, fontWeight: 600 }}>{item.code}</span>
                        <span>{item.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Google Places Location Picker */}
              <GoogleLocationPicker
                value={{
                  placeName: form.placeName,
                  address: form.address,
                  street: form.street,
                  city: form.city,
                  country: form.country,
                  postalCode: form.postalCode,
                  placeId: form.placeId,
                  placeType: form.placeType,
                  lat: form.lat,
                  lng: form.lng,
                }}
                onChange={handleLocationChange}
              />

              <PropertyFeaturesField
                category={form.category}
                values={form.features}
                onToggle={toggleFeature}
              />

              <ImageUploader
                key={uploaderKey}
                className="form-group form-group--full"
                uid={user.id}
                values={form.imageUrls}
                onChange={(nextValues) => {
                  set("imageUrls", nextValues);
                  setError("");
                }}
                onUploadingChange={setImageUploading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || imageUploading}>
              <Icon n="paper-plane" />{" "}
              {submitting
                ? "Duke postuar..."
                : imageUploading
                ? "Duke ngarkuar fotot..."
                : "Posto shpalljen"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
