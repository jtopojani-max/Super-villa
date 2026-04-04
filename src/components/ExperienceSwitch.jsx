import { EXPERIENCE_ORDER } from "../config/experiences.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { normalizeExperience } from "../utils/experience.js";

export default function ExperienceSwitch({ value = "villas", onChange, className = "", ariaLabel = "" }) {
  const activeValue = normalizeExperience(value);
  const { t } = useLanguage();
  const resolvedAriaLabel = ariaLabel || t("common.category");

  return (
    <div className={`experience-switch ${className}`.trim()} role="tablist" aria-label={resolvedAriaLabel}>
      {EXPERIENCE_ORDER.map((item) => {
        const isActive = activeValue === item;
        const expKey = item === "apartments" ? "exp.apartments" : "exp.villas";

        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`experience-switch__option ${isActive ? "is-active" : ""}`}
            onClick={() => onChange?.(item)}
          >
            <span className="experience-switch__label">{t(`${expKey}.label`)}</span>
            <span className="experience-switch__hint">{t(`${expKey}.heroHighlight`)}</span>
          </button>
        );
      })}
    </div>
  );
}
