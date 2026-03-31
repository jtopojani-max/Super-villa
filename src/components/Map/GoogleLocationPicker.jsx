import { useRef, useState, useCallback } from "react";
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from "../../config/googleMaps.js";

const DEFAULT_CENTER = { lat: 42.6629, lng: 20.1718 }; // Prishtinë

function extractComponent(components, type) {
  const comp = components?.find((c) => c.types.includes(type));
  return comp ? comp.long_name : "";
}

export default function GoogleLocationPicker({ value, onChange }) {
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
    const comps = place.address_components || [];

    const city =
      extractComponent(comps, "locality") ||
      extractComponent(comps, "administrative_area_level_2") ||
      extractComponent(comps, "administrative_area_level_1");

    const country = extractComponent(comps, "country");
    const streetName = extractComponent(comps, "route");
    const streetNumber = extractComponent(comps, "street_number");
    const postalCode = extractComponent(comps, "postal_code");
    const street = streetName ? `${streetName} ${streetNumber}`.trim() : "";

    const locationData = {
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
    };

    onChange(locationData);
    setMarkerPos({ lat, lng });
    setMapCenter({ lat, lng });
    setMapZoom(17);
  }, [onChange]);

  const clearLocation = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    setMarkerPos(null);
    onChange({
      placeName: "", address: "", street: "", city: "", country: "",
      postalCode: "", placeId: "", placeType: "", lat: null, lng: null,
    });
  }, [onChange]);

  const onMarkerDragEnd = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarkerPos({ lat: newLat, lng: newLng });
    onChange({ ...value, lat: newLat, lng: newLng });
  }, [onChange, value]);

  if (loadError) {
    return (
      <div className="location-picker form-group form-group--full">
        <label>Vendndodhja në hartë</label>
        <p style={{ color: "#c0392b", fontSize: ".85rem", marginTop: 6 }}>
          Gabim gjatë ngarkimit të Google Maps. Kontrolloni çelësin API në .env.local.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="location-picker form-group form-group--full">
        <label>Vendndodhja në hartë</label>
        <div className="location-picker__loading">Duke ngarkuar Google Maps...</div>
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
        Adresa e pronës
        <span className="location-picker__label-sub">Kërko me emër vile, rrugë ose lagje</span>
      </label>

      {/* Google Places Autocomplete Input */}
      <div className="location-picker__search">
        <span className="location-picker__search-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
            placeholder="p.sh. Vila Besa, Rruga Fehmi Agani, Prishtinë..."
            defaultValue={value?.address || ""}
            autoComplete="off"
          />
        </Autocomplete>
        {(value?.address || markerPos) && (
          <button type="button" className="location-picker__clear" onClick={clearLocation} title="Pastro">
            ✕
          </button>
        )}
      </div>
      <p className="location-picker__powered">Powered by Google Maps</p>

      {/* Confirmed address card */}
      {value?.address && (
        <div className="address-confirmed-card">
          <span className="address-confirmed-icon">✅</span>
          <div className="address-confirmed-info">
            {value.placeName && <strong>{value.placeName}</strong>}
            <span>{value.address}</span>
            {value.lat && value.lng && (
              <span className="coords-text">
                📍 {Number(value.lat).toFixed(6)}, {Number(value.lng).toFixed(6)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Map preview with draggable marker */}
      {markerPos && (
        <div className="location-picker__map">
          <p className="location-picker__hint">
            Tërhiq shenjuesin për të saktësuar pozicionin.
          </p>
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
              <Marker
                position={markerPos}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
                icon={markerIcon}
              />
            </GoogleMap>
          </div>
          <p className="location-picker__coords">
            📌 {Number(markerPos.lat).toFixed(5)}, {Number(markerPos.lng).toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}
