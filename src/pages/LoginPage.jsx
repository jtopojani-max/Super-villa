import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUser } from "../utils/storage.js";
import {
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { BrandLogo } from "../components/Shared.jsx";
import { createUserProfileIfMissing, ensureUserProfile } from "../services/users.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const ERROR_MAP = {
  "auth/invalid-email": "auth.invalidEmail",
  "auth/user-not-found": "auth.userNotFound",
  "auth/wrong-password": "auth.wrongPassword",
  "auth/invalid-credential": "auth.invalidCredential",
  "auth/network-request-failed": "auth.networkError",
};

const GOOGLE_ERROR_MAP = {
  "auth/popup-closed-by-user": "auth.popupClosed",
  "auth/popup-blocked": "auth.popupBlocked",
  "auth/cancelled-popup-request": "auth.popupCancelled",
  "auth/account-exists-with-different-credential": "auth.accountExists",
};

const buildAppUser = (firebaseUser, profile = {}) => ({
  id: firebaseUser.uid,
  name: firebaseUser.displayName || profile.name || firebaseUser.email?.split("@")[0] || "Perdorues",
  email: firebaseUser.email || profile.email || "",
  role: profile.role || "user",
  phone: profile.phone || "",
  address: profile.address || "",
  favorites: Array.isArray(profile.favorites) ? profile.favorites : [],
  photoURL: profile.photoURL || firebaseUser.photoURL || "",
});

export default function LoginPage({ onLogin }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const getLoginError = (code) => t(ERROR_MAP[code] || "auth.genericLoginError");
  const getGoogleError = (code) => t(GOOGLE_ERROR_MAP[code] || ERROR_MAP[code] || "auth.genericLoginError");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setCanResendVerification(false);
    setLoading(true);

    if (!email || !password) {
      setError(t("auth.fillAllFields"));
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        setCanResendVerification(true);
        setError(t("auth.emailNotVerified"));
        await signOut(auth);
        return;
      }

      let profile = {};
      try {
        profile = await ensureUserProfile(firebaseUser);
      } catch (firestoreError) {
        console.warn("Firestore profile sync failed during login:", firestoreError);
      }

      const appUser = buildAppUser(firebaseUser, profile);

      setUser(appUser);
      onLogin(appUser);
      navigate("/");
    } catch (err) {
      console.error("Firebase login error:", err);
      setError(getLoginError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setError("");
    setNotice("");
    setResending(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (firebaseUser.emailVerified) {
        setNotice(t("auth.emailAlreadyVerified"));
      } else {
        await sendEmailVerification(firebaseUser);
        setNotice(t("auth.verificationSent"));
      }

      await signOut(auth);
    } catch (err) {
      console.error("Resend verification error:", err);
      setError(getLoginError(err.code));
    } finally {
      setResending(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setNotice("");

    if (!email) {
      setError(t("auth.enterEmailForReset"));
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice(t("auth.resetEmailSent"));
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError(t("auth.noAccountWithEmail"));
      } else if (err.code === "auth/invalid-email") {
        setError(t("auth.invalidEmail"));
      } else {
        setError(t("auth.resetError"));
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setNotice("");
    setCanResendVerification(false);
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      await createUserProfileIfMissing(firebaseUser, {
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Perdorues",
        photoURL: firebaseUser.photoURL || "",
        provider: "google",
        favorites: [],
      });

      const profile = await ensureUserProfile(firebaseUser, {
        photoURL: firebaseUser.photoURL || "",
        provider: "google",
      });

      const appUser = buildAppUser(firebaseUser, profile);
      setUser(appUser);
      onLogin(appUser);
      navigate("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(getGoogleError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <BrandLogo className="auth-card__logo" onClick={() => navigate("/")} />

        <h1 className="auth-card__title">{t("auth.loginTitle")}</h1>
        <p className="auth-card__subtitle">{t("auth.loginSubtitle")}</p>

        {error && <p className="auth-server-error">{error}</p>}
        {notice && <p style={{ color: "#15803d", fontSize: ".9rem", marginBottom: 12 }}>{notice}</p>}

        <form onSubmit={handle}>
          <div className="auth-input-wrap">
            <label>{t("auth.emailLabel")}</label>
            <input
              className="auth-input"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="auth-input-wrap">
            <label>{t("auth.passwordLabel")}</label>
            <input
              className="auth-input"
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <button
              type="button"
              className="btn btn--ghost"
              style={{ fontSize: ".85rem", padding: 0, textDecoration: "underline", color: "var(--text-muted, #64748b)" }}
              onClick={handlePasswordReset}
              disabled={resetLoading || loading}
            >
              {resetLoading ? t("auth.sendingReset") : t("auth.forgotPassword")}
            </button>
          </div>
          <button className="btn btn--primary btn--full btn--lg" type="submit" style={{ marginTop: 8 }} disabled={loading || googleLoading}>
            {loading ? t("auth.loggingIn") : t("auth.loginBtn")}
          </button>
        </form>

        {canResendVerification && (
          <button className="btn btn--ghost btn--full" style={{ marginTop: 10 }} onClick={resendVerification} disabled={resending}>
            {resending ? t("auth.sending") : t("auth.resendVerification")}
          </button>
        )}

        <div className="auth-divider">{t("auth.or")}</div>

        <button className="auth-social-btn" type="button" onClick={handleGoogleSignIn} disabled={loading || googleLoading || resending}>
          <span className="auth-social-btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                fill="#EA4335"
                d="M12 10.2v3.91h5.43c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.37 3.03-7.47 0-.72-.06-1.41-.18-2.05H12Z"
              />
              <path
                fill="#4285F4"
                d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.3-2.56c-.91.61-2.08.97-3.33.97-2.56 0-4.72-1.72-5.49-4.03H3.1v2.64A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.51 13.94A6 6 0 0 1 6.2 12c0-.67.11-1.31.31-1.94V7.42H3.1A10 10 0 0 0 2 12c0 1.61.39 3.14 1.1 4.58l3.41-2.64Z"
              />
              <path
                fill="#34A853"
                d="M12 6.03c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.97 3.05 14.7 2 12 2A10 10 0 0 0 3.1 7.42l3.41 2.64C7.28 7.75 9.44 6.03 12 6.03Z"
              />
            </svg>
          </span>
          <span>{googleLoading ? t("auth.googleLoading") : t("auth.googleBtn")}</span>
        </button>

        <p className="auth-card__footer">
          {t("auth.noAccount")} <span onClick={() => navigate("/register")}>{t("auth.registerFree")}</span>
        </p>
      </div>
    </div>
  );
}
