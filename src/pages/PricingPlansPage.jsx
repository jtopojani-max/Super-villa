import { useLocation } from "react-router-dom";
import PricingSection from "../components/PricingSection.jsx";
import { Footer, Navbar } from "../components/Shared.jsx";
import { getExperienceConfig } from "../config/experiences.js";
import { normalizeExperience } from "../utils/experience.js";

const resolveExperienceFromSearch = (search) => {
  const params = new URLSearchParams(search);
  return normalizeExperience(params.get("mode") || "villas");
};

export default function PricingPlansPage({ user, onLogout }) {
  const location = useLocation();
  const experience = resolveExperienceFromSearch(location.search);
  const config = getExperienceConfig(experience);

  return (
    <div className={`experience ${config.themeClass}`}>
      <Navbar user={user} onLogout={onLogout} experience={experience} />
      <main>
        <PricingSection user={user} sectionId="pricing-page" />
      </main>
      <Footer experience={experience} />
    </div>
  );
}
