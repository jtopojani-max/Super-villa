const toClassValue = (input) => {
  if (!input) return "";
  if (typeof input === "string" || typeof input === "number") return String(input);
  if (Array.isArray(input)) return input.map(toClassValue).filter(Boolean).join(" ");
  if (typeof input === "object") {
    return Object.entries(input)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)
      .join(" ");
  }
  return "";
};

export const cn = (...inputs) =>
  inputs
    .map(toClassValue)
    .filter(Boolean)
    .join(" ");
