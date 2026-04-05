import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import CSS from "./styles.js";
import { getUser, setUser } from "./utils/storage.js";
import { auth, authPersistenceReady } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ensureUserProfile, getUserProfile, listSavedListingIds } from "./services/users.js";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ApartmentsPage = lazy(() => import("./pages/ApartmentsPage.jsx"));
const ApartmentDetailsPage = lazy(() => import("./pages/ApartmentDetailsPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const CreatePostPage = lazy(() => import("./pages/CreatePostPage.jsx"));
const EditVilla = lazy(() => import("./pages/EditVilla.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const VillasPage = lazy(() => import("./pages/VillasPage.jsx"));
const VillaDetailsPage = lazy(() => import("./pages/VillaDetailsPage.jsx"));
const MessagesPage = lazy(() => import("./pages/MessagesPage.jsx"));
const PricingPlansPage = lazy(() => import("./pages/PricingPlansPage.jsx"));

const AUTH_LOADING_ICONS = [
  { id: "house", file: "ph--house-line-light.svg", delay: "0s" },
  { id: "building", file: "mdi--building.svg", delay: "0.15s" },
  { id: "verified", file: "mdi--verified-user.svg", delay: "0.3s" },
];

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function AuthOnly({ user, children }) {
  if (user) return <Navigate to="/" replace />;
  return children;
}

function ScrollToTop({ pathname }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AuthLoader({ label }) {
  return (
    <div className="auth-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="auth-loader__stage" aria-hidden="true">
        <span className="auth-loader__glow" />
        <div className="auth-loader__icons">
          {AUTH_LOADING_ICONS.map(({ id, file, delay }) => (
            <span key={id} className="auth-loader__icon-shell" style={{ animationDelay: delay }}>
              <span
                className="auth-loader__icon"
                style={{
                  WebkitMaskImage: `url('/icons/${file}')`,
                  maskImage: `url('/icons/${file}')`,
                }}
              />
            </span>
          ))}
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}

function AppInner() {
  const { t } = useLanguage();
  const [user, setUserState] = useState(getUser);
  const [authLoading, setAuthLoading] = useState(true);

  const routerNavigate = useNavigate();
  const location = useLocation();
  const displayLocation = location;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setUserState(null);
      routerNavigate("/");
    }
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    const bootstrapAuth = async () => {
      await authPersistenceReady;

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        if (!firebaseUser) {
          setUser(null);
          setUserState(null);
          setAuthLoading(false);
          return;
        }

        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          setUserState(null);
          setAuthLoading(false);
          return;
        }

        try {
          const profile = await ensureUserProfile(firebaseUser);
          let savedIds = null;
          try {
            savedIds = await listSavedListingIds(firebaseUser.uid);
          } catch (savedError) {
            console.warn("Failed to load saved listings:", savedError);
          }

          const resolvedUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || profile.name || firebaseUser.email?.split("@")[0] || "Perdorues",
            email: firebaseUser.email || profile.email || "",
            role: profile.role || "user",
            phone: profile.phone || "",
            address: profile.address || "",
            favorites: Array.isArray(savedIds) ? savedIds : Array.isArray(profile.favorites) ? profile.favorites : [],
          };
          setUser(resolvedUser);
          setUserState(resolvedUser);
        } catch (error) {
          console.error("Failed to restore auth session:", error);
          let fallbackRole = "user";
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            if (profile?.role) fallbackRole = profile.role;
          } catch { /* ignore */ }
          const fallbackUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Perdorues",
            email: firebaseUser.email || "",
            role: fallbackRole,
            phone: "",
            address: "",
            favorites: [],
          };
          setUser(fallbackUser);
          setUserState(fallbackUser);
        } finally {
          setAuthLoading(false);
        }
      });
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleUpdateUser = useCallback((nextUserOrUpdater) => {
    setUserState((currentUser) => {
      const resolvedUser =
        typeof nextUserOrUpdater === "function" ? nextUserOrUpdater(currentUser) : nextUserOrUpdater;
      setUser(resolvedUser);
      return resolvedUser;
    });
  }, []);

  const shared = {
    user,
    onLogout: handleLogout,
    onUpdateUser: handleUpdateUser,
  };

  if (authLoading) {
    return (
      <>
        <style>{CSS}</style>
        <AuthLoader label={t("meta.verifyingSession")} />
      </>
    );
  }

  const withNavbarSpace =
    displayLocation.pathname === "/villas" ||
    displayLocation.pathname === "/apartments" ||
    displayLocation.pathname.startsWith("/apartments/") ||
    displayLocation.pathname.startsWith("/villa/") ||
    displayLocation.pathname.startsWith("/messages") ||
    displayLocation.pathname.startsWith("/pricing-plans");

  return (
    <>
      <style>{CSS}</style>
      <ScrollToTop pathname={displayLocation.pathname} />

      <div className={withNavbarSpace ? "with-navbar-space" : ""}>
        <Suspense
          fallback={
            <div style={{ minHeight: "50vh", display: "grid", placeItems: "center", color: "#334155" }}>
              {t("meta.loadingPage")}
            </div>
          }
        >
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage {...shared} />} />
            <Route path="/villas" element={<VillasPage {...shared} />} />
            <Route path="/apartments" element={<ApartmentsPage {...shared} />} />
            <Route path="/villa/:id/:slug?" element={<VillaDetailsPage {...shared} />} />
            <Route path="/apartments/:id/:slug?" element={<ApartmentDetailsPage {...shared} />} />
            <Route
              path="/login"
              element={
                <AuthOnly user={user}>
                  <LoginPage onLogin={shared.onUpdateUser} />
                </AuthOnly>
              }
            />
            <Route
              path="/register"
              element={
                <AuthOnly user={user}>
                  <RegisterPage onLogin={shared.onUpdateUser} />
                </AuthOnly>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth user={user}>
                  <ProfilePage {...shared} />
                </RequireAuth>
              }
            />
            <Route
              path="/create"
              element={
                <RequireAuth user={user}>
                  <CreatePostPage {...shared} />
                </RequireAuth>
              }
            />
            <Route
              path="/edit-villa/:id"
              element={
                <RequireAuth user={user}>
                  <EditVilla {...shared} />
                </RequireAuth>
              }
            />
            <Route
              path="/messages"
              element={
                <RequireAuth user={user}>
                  <MessagesPage {...shared} />
                </RequireAuth>
              }
            />
            <Route
              path="/messages/:conversationId"
              element={
                <RequireAuth user={user}>
                  <MessagesPage {...shared} />
                </RequireAuth>
              }
            />
            <Route path="/pricing-plans" element={<PricingPlansPage {...shared} />} />
            <Route path="/create-post" element={<Navigate to="/create" replace />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin user={user}>
                  <AdminDashboardPage user={user} onUpdateUser={shared.onUpdateUser} />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}
