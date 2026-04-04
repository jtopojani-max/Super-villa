import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import sq from "./sq.js";
import en from "./en.js";

const LANGUAGES = { sq, en };
const STORAGE_KEY = "app_lang";
const DEFAULT_LANG = "sq";

const getInitialLang = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES[stored]) return stored;
  } catch (_) { /* localStorage unavailable */ }
  return DEFAULT_LANG;
};

const LanguageContext = createContext(null);

/**
 * Resolve a nested key like "nav.home" from a translations object.
 */
const resolve = (obj, path) => {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((nextLang) => {
    if (!LANGUAGES[nextLang]) return;
    setLangState(nextLang);
    try { localStorage.setItem(STORAGE_KEY, nextLang); } catch (_) { /* ignore */ }
    document.documentElement.lang = nextLang;
  }, []);

  const t = useCallback(
    (key, replacements) => {
      let text = resolve(LANGUAGES[lang], key);
      if (text === undefined) {
        // Fallback to Albanian if key missing in current language
        text = resolve(LANGUAGES[DEFAULT_LANG], key);
      }
      if (text === undefined) return key; // Return key itself as last resort

      // Simple template replacement: t("key", { count: 5 }) → "5 items"
      if (replacements && typeof text === "string") {
        for (const [k, v] of Object.entries(replacements)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return text;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

export default LanguageContext;
