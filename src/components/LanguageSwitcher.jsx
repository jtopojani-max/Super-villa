import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className={`lang-switch ${className}`.trim()} role="group" aria-label="Language switcher">
      <button
        type="button"
        className={`lang-switch__btn ${lang === "sq" ? "is-active" : ""}`}
        onClick={() => setLang("sq")}
        aria-label="Shqip"
        aria-pressed={lang === "sq"}
      >
        {t("language.sq")}
      </button>
      <button
        type="button"
        className={`lang-switch__btn ${lang === "en" ? "is-active" : ""}`}
        onClick={() => setLang("en")}
        aria-label="English"
        aria-pressed={lang === "en"}
      >
        {t("language.en")}
      </button>
    </div>
  );
}
