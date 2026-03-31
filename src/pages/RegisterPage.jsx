import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUser } from "../utils/storage.js";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase.js";
import { BrandLogo } from "../components/Shared.jsx";
import { ensureUserProfile } from "../services/users.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const REG_ERROR_MAP = {
  "auth/email-already-in-use": "auth.emailInUse",
  "auth/invalid-email": "auth.invalidEmail",
  "auth/weak-password": "auth.weakPassword",
  "auth/network-request-failed": "auth.networkError",
};

const sanitizePhone = (value) => value.replace(/[^\d+]/g, "").replace(/^00/, "+");

const isValidPhone = (value) => /^\+?\d{8,15}$/.test(value);

export default function RegisterPage({ onLogin }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const getRegError = (code) => t(REG_ERROR_MAP[code] || "auth.registerError");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError(t("auth.fillAllFields"));
      setLoading(false);
      return;
    }
    if (form.password.length < 8) {
      setError(t("auth.passwordMinLength"));
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError(t("auth.passwordMismatch"));
      setLoading(false);
      return;
    }

    const cleanPhone = sanitizePhone(form.phone);
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      setError(t("auth.invalidPhone"));
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: form.name });
      await sendEmailVerification(user);

      await ensureUserProfile(user, {
        name: form.name,
        phone: cleanPhone,
        address: form.address.trim(),
        favorites: [],
      });

      // Enforce email verification before first login.
      await signOut(auth);
      setUser(null);
      onLogin(null);
      setNotice(t("auth.registerSuccess"));
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      console.error("Firebase register error:", err);
      setError(getRegError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    { label: t("auth.fullName"), key: "name", type: "text", placeholder: t("auth.fullNamePlaceholder"), autoComplete: "name" },
    { label: t("auth.emailLabel"), key: "email", type: "email", placeholder: t("auth.emailPlaceholder"), autoComplete: "email" },
    { label: t("common.phone"), key: "phone", type: "text", placeholder: t("auth.phonePlaceholder"), autoComplete: "tel" },
    { label: t("auth.addressLabel"), key: "address", type: "text", placeholder: t("auth.addressPlaceholder"), autoComplete: "street-address" },
    { label: t("auth.passwordLabel"), key: "password", type: "password", placeholder: t("auth.minChars"), autoComplete: "new-password" },
    { label: t("auth.confirmPassword"), key: "confirm", type: "password", placeholder: t("auth.confirmPlaceholder"), autoComplete: "new-password" },
  ];

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <BrandLogo className="auth-card__logo" onClick={() => navigate("/")} />

        <h1 className="auth-card__title">{t("auth.registerTitle")}</h1>
        <p className="auth-card__subtitle">{t("auth.registerSubtitle")}</p>

        {error && <p className="auth-server-error">{error}</p>}
        {notice && <p style={{ color: "#15803d", fontSize: ".9rem", marginBottom: 12 }}>{notice}</p>}

        <form onSubmit={handle}>
          {FIELDS.map((f) => (
            <div className="auth-input-wrap" key={f.key}>
              <label>{f.label}</label>
              <input
                className="auth-input"
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                autoComplete={f.autoComplete}
              />
            </div>
          ))}
          <button className="btn btn--primary btn--full btn--lg" type="submit" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? t("auth.creating") : t("auth.createAccount")}
          </button>
        </form>

        <p className="auth-card__footer" style={{ marginTop: 20 }}>
          {t("auth.hasAccount")}{" "}
          <span onClick={() => navigate("/login")}>{t("auth.loginBtn")}</span>
        </p>
      </div>
    </div>
  );
}
