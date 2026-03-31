import { IconContext } from "@phosphor-icons/react";

const ICON_DEFAULTS = {
  color: "currentColor",
  weight: "thin",
  size: 20,
};

export function AppIconProvider({ children }) {
  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      {children}
    </IconContext.Provider>
  );
}
