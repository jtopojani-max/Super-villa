import { getFeatureOptionsForCategory, FEATURE_ICONS } from "../utils/listingFeatures.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateFeature } from "../i18n/ui.js";
import { Icon } from "./Shared.jsx";

export default function PropertyFeaturesField({ category, values = [], onToggle }) {
  const { t } = useLanguage();
  const featureOptions = getFeatureOptionsForCategory(category);

  return (
    <div className="form-group form-group--full">
      <div className="feature-picker">
        <div className="feature-picker__head">
          <p className="feature-picker__title">{t("features.title")}</p>
          <p className="feature-picker__copy">{t("features.copy")}</p>
        </div>

        {featureOptions.length ? (
          <div className="feature-picker__list" role="group" aria-label={t("features.title")}>
            {featureOptions.map((feature) => {
              const isActive = values.includes(feature);
              return (
                <button
                  key={feature}
                  type="button"
                  className={`feature-pill ${isActive ? "is-active" : ""}`}
                  onClick={() => onToggle(feature)}
                  aria-pressed={isActive}
                >
                  <Icon n={FEATURE_ICONS[feature] || "check"} /> {translateFeature(feature, t)}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="feature-picker__empty">{t("features.empty")}</p>
        )}
      </div>
    </div>
  );
}
