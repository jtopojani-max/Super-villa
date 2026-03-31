import { getFeatureOptionsForCategory, FEATURE_ICONS } from "../utils/listingFeatures.js";
import { Icon } from "./Shared.jsx";

export default function PropertyFeaturesField({ category, values = [], onToggle }) {
  const featureOptions = getFeatureOptionsForCategory(category);

  return (
    <div className="form-group form-group--full">
      <div className="feature-picker">
        <div className="feature-picker__head">
          <p className="feature-picker__title">Vecorite e Prones</p>
          <p className="feature-picker__copy">Zgjidh opsionet qe pershkruajne me mire pronen tende.</p>
        </div>

        {featureOptions.length ? (
          <div className="feature-picker__list" role="group" aria-label="Vecorite e prones">
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
                  <Icon n={FEATURE_ICONS[feature] || "check"} /> {feature}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="feature-picker__empty">Nuk ka vecori te paracaktuara per kete kategori.</p>
        )}
      </div>
    </div>
  );
}
