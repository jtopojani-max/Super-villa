export const CITIES = [
  "Prishtine",
  "Prizren",
  "Peje",
  "Gjakove",
  "Gjilan",
  "Ferizaj",
  "Mitrovice",
  "Vushtrri",
  "Fushe Kosove",
  "Podujeve",
  "Lipjan",
  "Obiliq",
  "Drenas",
  "Skenderaj",
  "Kamenice",
  "Viti",
  "Suhareke",
  "Rahovec",
  "Malisheve",
  "Klina",
  "Decan",
  "Istog",
  "Dragash",
  "Kacanik",
  "Shtime",
  "Hani i Elezit",
  "Leposaviq",
  "Zubin Potok",
  "Zvecan",
  "Shterpce",
  "Brezovice",
  "Prevalle",
  "Boga",
  "Rugove",
  "Germia",
  "Mirusha",
  "Batllava",
];

const USER_KEY = "sv_user";

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

