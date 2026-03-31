import { EXPERIENCE_ORDER, getExperienceConfig } from "../config/experiences.js";
import { normalizeExperience } from "../utils/experience.js";

export default function ExperienceSwitch({ value = "villas", onChange, className = "", ariaLabel = "Zgjidh eksperiencen" }) {
  const activeValue = normalizeExperience(value);

  return (
    <div className={`experience-switch ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {EXPERIENCE_ORDER.map((item) => {
        const config = getExperienceConfig(item);
        const isActive = activeValue === item;

        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`experience-switch__option ${isActive ? "is-active" : ""}`}
            onClick={() => onChange?.(item)}
          >
            <span className="experience-switch__label">{config.label}</span>
            <span className="experience-switch__hint">{config.hero.highlight}</span>
          </button>
        );
      })}
    </div>
  );
}
