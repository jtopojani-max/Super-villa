import { useRef, useState, useCallback } from "react";
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from "../../config/googleMaps.js";

const DEFAULT_CENTER = { lat: 42.6629, lng: 20.1718 };

const COPY = {
  sq: {
    label: "Adresa e prones",
    labelSub: "Kerko me emer vile, rruge ose lagje",
    loadError: "Gabim gjate ngarkimit te Google Maps. Kontrolloni celesin API ne .env.local.",
    loading: "Duke ngarkuar Google Maps...",
    placeholder: "p.sh. Vila Besa, Rruga Fehmi Agani, Prishtine...",
    clear: "Pastro",
    powered: "Powered by Google Maps",
    mapHint: "Terhiq shenjuesin per te saktesuar pozicionin.",
  },
  en: {
    label: "Property address",
    labelSub: "Search by villa name, street, or neighborhood",
    loadError: "Error loading Google Maps. Check the API key in .env.local.",
    loading: "Loading Google Maps...",
    placeholder: "e.g. Vila Besa, Fehmi Agani Street, Prishtina...",
    clear: "Clear",
    powered: "Powered by Google Maps",
    mapHint: "Drag the marker to fine-tune the position.",
  },
};

function extractComponent(components, type) {
  const component = components?.find((item) => item.types.includes(type));
  return component ? component.long_name : "";
}

export default function GoogleLocationPicker({ value, onChange }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.sq;
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const hasLocation = value?.lat && value?.lng;

  const [markerPos, setMarkerPos] = useState(
    hasLocation ? { lat: Number(value.lat), lng: Number(value.lng) } : null
  );
  const [mapCenter, setMapCenter] = useState(
    hasLocation ? { lat: Number(value.lat), lng: Number(value.lng) } : DEFAULT_CENTER
  );
  const [mapZoom, setMapZoom] = useState(hasLocation ? 17 : 13);

  const onLoad = useCallback((auto) => {
    autocompleteRef.current = auto;
  }, []);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const components = place.address_components || [];

    const city =
      extractComponent(components, "locality") ||
      extractComponent(components, "administrative_area_level_2") ||
      extractComponent(components, "administrative_area_level_1");

    const country = extractComponent(components, "country");
    const streetName = extractComponent(components, "route");
    const streetNumber = extractComponent(components, "street_number");
    const postalCode = extractComponent(components, "postal_code");
    const street = streetName ? `${streetName} ${streetNumber}`.trim() : "";

    onChange({
      placeName: place.name || "",
      address: place.formatted_address || "",
      street,
      city,
      country,
      postalCode,
      placeId: place.place_id || "",
      placeType: place.types?.[0] || "",
      lat,
      lng,
    });

    setMarkerPos({ lat, lng });
    setMapCenter({ lat, lng });
    setMapZoom(17);
  }, [onChange]);

  const clearLocation = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    setMarkerPos(null);
    onChange({
      placeName: "",
      address: "",
      street: "",
      city: "",
      country: "",
      postalCode: "",
      placeId: "",
      placeType: "",
      lat: null,
      lng: null,
    });
  }, [onChange]);

  const onMarkerDragEnd = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPos({ lat, lng });
    onChange({ ...value, lat, lng });
  }, [onChange, value]);

  if (loadError) {
    return (
      <div className="location-picker form-group form-group--full">
        <label>{copy.label}</label>
        <p style={{ color: "#c0392b", fontSize: ".85rem", marginTop: 6 }}>{copy.loadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="location-picker form-group form-group--full">
        <label>{copy.label}</label>
        <div className="location-picker__loading">{copy.loading}</div>
      </div>
    );
  }

  const markerIcon = {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 11,
    fillColor: "#F7B05B",
    fillOpacity: 1,
    strokeColor: "#0a1628",
    strokeWeight: 3,
  };

  return (
    <div className="location-picker form-group form-group--full">
      <label>
        {copy.label}
        <span className="location-picker__label-sub">{copy.labelSub}</span>
      </label>

      <div className="location-picker__search">
        <span className="location-picker__search-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: ["xk", "al", "mk", "rs", "me"] },
            fields: ["formatted_address", "geometry", "name", "address_components", "place_id", "types"],
            types: ["establishment", "geocode"],
            strictBounds: false,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="location-picker__input location-picker__input--with-icon"
            placeholder={copy.placeholder}
            defaultValue={value?.address || ""}
            autoComplete="off"
          />
        </Autocomplete>
        {(value?.address || markerPos) && (
          <button type="button" className="location-picker__clear" onClick={clearLocation} title={copy.clear}>
            x
          </button>
        )}
      </div>
      <p className="location-picker__powered">{copy.powered}</p>

      {value?.address && (
        <div className="address-confirmed-card">
          <span className="address-confirmed-icon">OK</span>
          <div className="address-confirmed-info">
            {value.placeName && <strong>{value.placeName}</strong>}
            <span>{value.address}</span>
            {value.lat && value.lng && (
              <span className="coords-text">
                {Number(value.lat).toFixed(6)}, {Number(value.lng).toFixed(6)}
              </span>
            )}
          </div>
        </div>
      )}

      {markerPos && (
        <div className="location-picker__map">
          <p className="location-picker__hint">{copy.mapHint}</p>
          <div className="location-picker__map-container">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={mapZoom}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: false,
                mapTypeControlOptions: {
                  mapTypeIds: ["roadmap", "satellite"],
                },
                styles: [
                  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                  { featureType: "transit", stylers: [{ visibility: "off" }] },
                ],
              }}
            >
              <Marker position={markerPos} draggable onDragEnd={onMarkerDragEnd} icon={markerIcon} />
            </GoogleMap>
          </div>
          <p className="location-picker__coords">
            {Number(markerPos.lat).toFixed(5)}, {Number(markerPos.lng).toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}
