import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Shared.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import PropertyFeaturesField from "../components/PropertyFeaturesField.jsx";
import GoogleLocationPicker from "../components/Map/GoogleLocationPicker.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateCategory } from "../i18n/ui.js";
import { CITIES } from "../utils/storage.js";
import { isValidImageUrl } from "../utils/imageUpload.js";
import { normalizeListingFeatures } from "../utils/listingFeatures.js";
import { createPost, listMyPosts } from "../services/posts.js";
import { getUserSubscription } from "../services/subscriptions.js";
import spinnerSrc from "../assets/spinner-gooey.svg";

const FREE_PLAN_MAX_LISTINGS = 1;

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
  { code: "+383", countrySq: "Kosove", countryEn: "Kosovo", flag: "XK", placeholder: "44 123 456", maxDigits: 8, example: "383 44 xxx xxx" },
  { code: "+355", countrySq: "Shqiperi", countryEn: "Albania", flag: "AL", placeholder: "69 123 4567", maxDigits: 8, example: "355 69 xxx xxxx" },
  { code: "+389", countrySq: "Maqedoni", countryEn: "North Macedonia", flag: "MK", placeholder: "70 123 456", maxDigits: 8, example: "389 70 xxx xxx" },
  { code: "+381", countrySq: "Serbi", countryEn: "Serbia", flag: "RS", placeholder: "60 123 4567", maxDigits: 8, example: "381 60 xxx xxxx" },
  { code: "+49", countrySq: "Gjermani", countryEn: "Germany", flag: "DE", placeholder: "151 1234567", maxDigits: 8, example: "49 xxx xxx xx" },
  { code: "+39", countrySq: "Itali", countryEn: "Italy", flag: "IT", placeholder: "320 123 4567", maxDigits: 8, example: "39 xxx xxx xxxx" },
  { code: "+41", countrySq: "Zvicer", countryEn: "Switzerland", flag: "CH", placeholder: "76 123 4567", maxDigits: 8, example: "41 xx xxx xx xx" },
  { code: "+43", countrySq: "Austri", countryEn: "Austria", flag: "AT", placeholder: "650 123 4567", maxDigits: 8, example: "43 xxx xxx xxxx" },
  { code: "+44", countrySq: "UK", countryEn: "UK", flag: "GB", placeholder: "7700 900123", maxDigits: 8, example: "44 xxx xxx xxxx" },
  { code: "+1", countrySq: "USA/CAN", countryEn: "USA/CAN", flag: "US", placeholder: "212 555 0100", maxDigits: 8, example: "1 xxx xxx xxxx" },
];

export default function CreatePostPage({ user }) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState("");
  const [planChecking, setPlanChecking] = useState(true);
  const phoneWrapperRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (phoneWrapperRef.current && !phoneWrapperRef.current.contains(event.target)) {
        setShowCodeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setPlanChecking(false);
      return;
    }

    let cancelled = false;

    const checkPlanLimit = async () => {
      try {
        const [subscription, myPosts] = await Promise.all([
          getUserSubscription(user.id),
          listMyPosts(user.id),
        ]);

        if (cancelled) return;

        const isFreePlan =
          !subscription ||
          subscription.planId === "free" ||
          subscription.status !== "active";

        if (isFreePlan && myPosts.length >= FREE_PLAN_MAX_LISTINGS) {
          navigate("/pricing-plans", { replace: true });
          return;
        }
      } catch (err) {
        console.warn("Could not verify plan limit:", err);
      }

      if (!cancelled) setPlanChecking(false);
    };

    checkPlanLimit();

    return () => {
      cancelled = true;
    };
  }, [user?.id, navigate]);

  if (!user) return null;

  if (planChecking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "#334155",
      }}>
        <img src={spinnerSrc} alt="" width={64} height={64} style={{ display: "block" }} />
      </div>
    );
  }

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

  const selectedCountry = COUNTRY_CODES.find((item) => item.code === form.phoneCode) || COUNTRY_CODES[0];

  const handleLocationChange = (locationData) => {
    setForm((current) => ({
      ...current,
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (imageUploading) {
      setError(t("createPost.waitForUpload"));
      return;
    }
    if (!form.title.trim()) {
      setError(t("createPost.titleRequired"));
      return;
    }
    if (!form.price) {
      setError(t("createPost.priceRequired"));
      return;
    }
    if (!form.description.trim()) {
      setError(t("createPost.descRequired"));
      return;
    }
    if (!form.location) {
      setError(t("createPost.selectCityError"));
      return;
    }
    if (!form.rooms || !form.beds || !form.baths) {
      setError(t("createPost.fillRoomFields"));
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError(t("createPost.phoneRequired"));
      return;
    }

    const cleanPhone = form.phoneNumber.replace(/\s/g, "");
    if (cleanPhone.length < 7) {
      setError(t("createPost.phoneTooShort"));
      return;
    }
    if (!form.lat || !form.lng) {
      setError(t("createPost.selectLocation"));
      return;
    }
    if (!form.address) {
      setError(t("createPost.addressRequired"));
      return;
    }
    if (!form.imageUrls.length) {
      setError(t("createPost.addPhoto"));
      return;
    }
    if (form.imageUrls.length > 10) {
      setError(t("createPost.maxPhotos"));
      return;
    }
    if (form.imageUrls.some((url) => !isValidImageUrl(url))) {
      setError(t("createPost.invalidPhotoUrl"));
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
        address: form.address,
        city: form.city,
        country: form.country || "Kosovo",
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
      const message = err?.message || err?.details || "";
      if (message.includes("unauthenticated")) {
        setError(t("createPost.mustBeLoggedIn"));
      } else if (message.includes("invalid-argument") || message.includes("numerike")) {
        setError(`${t("createPost.invalidData")}${message}`);
      } else if (message.includes("network") || message.includes("unavailable")) {
        setError(t("createPost.networkError"));
      } else {
        setError(`${t("createPost.publishError")}${message || t("errors.genericError")}`);
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
            <h1 className="page-form__title">{t("createPost.title")}</h1>
            <p className="page-form__subtitle">{t("createPost.subtitle")}</p>
          </div>
          <div className="page-form__header-actions">
            <p className="page-form__user">
              {t("createPost.loggedAs")}<strong>{user.name}</strong>
            </p>
            <button className="btn btn--ghost" onClick={() => navigate("/")}>
              <Icon n="arrow-left" /> {t("common.back")}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="form-card">
          {success && <div className="alert-success">{t("createPost.success")}</div>}
          {error && <p className="auth-server-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group form-group--full">
                <label>{t("createPost.titleLabel")}</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => set("title", event.target.value)}
                  placeholder={t("createPost.titlePlaceholder")}
                />
              </div>

              <div className="form-group form-group--full">
                <label>{t("createPost.descLabel")}</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  placeholder={t("createPost.descPlaceholder")}
                />
              </div>

              <div className="form-group">
                <label>{t("createPost.priceLabel")}</label>
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(event) => set("price", event.target.value)}
                  placeholder="220"
                />
              </div>

              <div className="form-group">
                <label>{t("createPost.locationLabel")}</label>
                <select value={form.location} onChange={(event) => set("location", event.target.value)}>
                  <option value="">{t("createPost.selectCity")}</option>
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

              <div className="form-group" ref={phoneWrapperRef} style={{ position: "relative" }}>
                <label>{t("createPost.phoneLabel")}</label>
                <div className="phone-input-wrapper">
                  <button type="button" className="phone-code-selector" onClick={() => setShowCodeDropdown((value) => !value)}>
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <span style={{ fontSize: "10px", opacity: 0.6 }}>v</span>
                  </button>
                  <input
                    type="tel"
                    className="phone-number-input"
                    value={form.phoneNumber}
                    onChange={(event) => {
                      let value = event.target.value.replace(/[^\d\s]/g, "");
                      if (value.length > 0 && value[0] === "0") value = value.slice(1);
                      const digits = value.replace(/\s/g, "");
                      if (digits.length > selectedCountry.maxDigits) {
                        setPhoneWarning(
                          lang === "en"
                            ? `Number must be max ${selectedCountry.maxDigits} digits without leading 0. Example: +${selectedCountry.example}`
                            : `Numri duhet te jete max ${selectedCountry.maxDigits} shifra pa 0. P.sh: +${selectedCountry.example}`
                        );
                        return;
                      }
                      setPhoneWarning("");
                      set("phoneNumber", value);
                    }}
                    placeholder={selectedCountry.placeholder}
                  />
                </div>
                {phoneWarning && (
                  <div className="phone-warning-banner">
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
                        <span>{lang === "en" ? item.countryEn : item.countrySq}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

              <PropertyFeaturesField category={form.category} values={form.features} onToggle={toggleFeature} />

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
                ? t("createPost.posting")
                : imageUploading
                ? t("createPost.uploadingPhotos")
                : t("createPost.submitBtn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
