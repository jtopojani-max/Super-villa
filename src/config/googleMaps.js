// Shared Google Maps configuration
// All components that call useJsApiLoader must use the SAME id + libraries
// to avoid loading the script multiple times.

export const GOOGLE_MAPS_ID = "supervilla-google-maps";
export const GOOGLE_MAPS_LIBRARIES = ["places"];
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
