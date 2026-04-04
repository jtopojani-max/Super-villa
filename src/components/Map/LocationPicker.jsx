import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const COPY = {
  sq: {
    label: "Vendndodhja ne harte (opsionale)",
    placeholder: "Kerko adresen... p.sh. Rruga Fehmi Agani, Prishtine",
    clear: "Pastro",
    hint: "Terhiq shenjuesin ose kliko harten per ta saktesuar pozicionin.",
  },
  en: {
    label: "Map location (optional)",
    placeholder: "Search the address... e.g. Fehmi Agani Street, Prishtina",
    clear: "Clear",
    hint: "Drag the marker or click the map to fine-tune the position.",
  },
};

const goldIcon = L.divIcon({
  className: "property-map__pin",
  html: `<div class="property-map__pin-inner"></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -44],
});

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${query}, Kosove`)}&limit=6&addressdetails=1&countrycodes=xk,al,mk,rs&accept-language=sq,en`;
  const response = await fetch(url, {
    headers: { "User-Agent": "SuperVilla/1.0" },
  });
  return response.json();
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
      }
    },
  }), [onDragEnd]);

  return <Marker draggable eventHandlers={eventHandlers} position={position} ref={markerRef} icon={goldIcon} />;
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(event) {
      onClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.sq;
  const [query, setQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const hasLocation = value?.lat && value?.lng;

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        setSuggestions(await nominatimSearch(query));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handler = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectSuggestion = useCallback((item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county || "";
    const country = item.address?.country || "";
    const address = item.display_name;
    setQuery(address);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({ address, city, country, lat, lng });
  }, [onChange]);

  const handleMarkerDrag = useCallback((lat, lng) => {
    onChange({ ...value, lat, lng });
  }, [onChange, value]);

  const handleMapClick = useCallback((lat, lng) => {
    onChange({ ...value, lat, lng });
  }, [onChange, value]);

  const clearLocation = () => {
    setQuery("");
    setSuggestions([]);
    onChange({ address: "", city: "", country: "", lat: null, lng: null });
  };

  return (
    <div className="location-picker form-group form-group--full" ref={wrapperRef}>
      <label>{copy.label}</label>

      <div className="location-picker__search">
        <input
          className="location-picker__input"
          type="text"
          placeholder={copy.placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
        />
        {searching && <span className="location-picker__spinner" />}
        {(query || hasLocation) && (
          <button type="button" className="location-picker__clear" onClick={clearLocation} title={copy.clear}>
            x
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="location-picker__suggestions">
          {suggestions.map((item) => (
            <li key={item.place_id} className="location-picker__suggestion" onMouseDown={() => selectSuggestion(item)}>
              <span className="location-picker__suggestion-icon">Map</span>
              <span>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}

      {hasLocation && (
        <div className="location-picker__map">
          <p className="location-picker__hint">{copy.hint}</p>
          <div className="location-picker__map-container">
            <MapContainer
              center={[value.lat, value.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <RecenterMap lat={value.lat} lng={value.lng} />
              <DraggableMarker position={[value.lat, value.lng]} onDragEnd={handleMarkerDrag} />
              <MapClickHandler onClick={handleMapClick} />
            </MapContainer>
          </div>
          <p className="location-picker__coords">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}
