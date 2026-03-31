import { useState } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_ID, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from "../../config/googleMaps.js";

// Fallback city coordinates (for listings without exact lat/lng)
const CITY_COORDS = {
  "Prishtine": [42.6629, 20.1718],
  "Prizren": [42.2139, 20.7397],
  "Peje": [42.6597, 20.2883],
  "Mitrovice": [42.8914, 20.8660],
  "Gjakove": [42.3803, 20.4308],
  "Ferizaj": [42.3703, 21.1553],
  "Gjilan": [42.4637, 21.4694],
  "Vushtrri": [42.8232, 20.9683],
  "Podujeve": [42.9108, 21.1903],
  "Rahovec": [42.3994, 20.6553],
  "Fushe Kosove": [42.6414, 21.0975],
  "Lipjan": [42.5214, 21.1256],
  "Obiliq": [42.6878, 21.0733],
  "Drenas": [42.6233, 20.8897],
  "Skenderaj": [42.7453, 20.7875],
  "Kamenice": [42.5828, 21.5803],
  "Viti": [42.3214, 21.3581],
  "Suhareke": [42.3594, 20.8281],
  "Malisheve": [42.4828, 20.7436],
  "Klina": [42.6214, 20.5764],
  "Decan": [42.5386, 20.2864],
  "Istog": [42.7839, 20.4867],
  "Dragash": [42.0636, 20.6533],
  "Kacanik": [42.2317, 21.2556],
  "Shtime": [42.4331, 21.0386],
  "Hani i Elezit": [42.1536, 21.2919],
  "Leposaviq": [43.1028, 20.8025],
  "Zubin Potok": [43.1169, 20.6858],
  "Zvecan": [43.1453, 20.8628],
  "Shterpce": [42.2394, 21.0197],
  "Brezovice": [42.2175, 20.9683],
  "Prevalle": [42.1719, 20.9044],
  "Boga": [42.4636, 19.8953],
  "Rugove": [42.7242, 20.1283],
  "Germia": [42.6797, 21.1019],
  "Batllava": [42.8361, 21.1831],
  "Tirane": [41.3275, 19.8187],
  "Durres": [41.3231, 19.4414],
  "Vlore": [40.4667, 19.4833],
  "Shkoder": [42.0683, 19.5126],
  "Korce": [40.6186, 20.7808],
  "Elbasan": [41.1125, 20.0822],
  "Fier": [40.7239, 19.5567],
  "Berat": [40.7058, 19.9522],
};

function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getFallbackCoords(location) {
  if (!location) return null;
  const normalizedLoc = normalize(location);
  const key = Object.keys(CITY_COORDS).find(
    (city) => normalizedLoc.includes(normalize(city))
  );
  return key ? CITY_COORDS[key] : null;
}

export default function PropertyMap({ lat, lng, title, address, location }) {
  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [mapReady, setMapReady] = useState(false);

  const fallback = !lat || !lng ? getFallbackCoords(location) : null;
  const resolvedLat = lat || fallback?.[0];
  const resolvedLng = lng || fallback?.[1];
  const isApproximate = !lat || !lng;

  if (!resolvedLat || !resolvedLng) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const googleMapsUrl = `https://www.google.com/maps?q=${resolvedLat},${resolvedLng}`;
  const directionsUrl = isIOS
    ? `maps://maps.apple.com/?daddr=${resolvedLat},${resolvedLng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${resolvedLat},${resolvedLng}`;
  const displayAddress = address || location;

  const center = { lat: Number(resolvedLat), lng: Number(resolvedLng) };

  const markerIcon = isLoaded && mapReady && window.google?.maps?.SymbolPath ? {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 12,
    fillColor: "#F7B05B",
    fillOpacity: 1,
    strokeColor: "#0a1628",
    strokeWeight: 3,
  } : undefined;

  return (
    <div className="property-map">
      <div className="property-map__header">
        <div>
          <h3 className="property-map__title">
            <span>📍</span> Vendndodhja
          </h3>
          {displayAddress && (
            <p className="property-map__address">{displayAddress}</p>
          )}
        </div>
        {isApproximate && (
          <span className="property-map__approx-badge">Lokacion i përafërt</span>
        )}
      </div>

      <div className="property-map__container">
        {!isLoaded ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: ".9rem" }}>
            Duke ngarkuar hartën...
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={isApproximate ? 12 : 16}
            onLoad={() => setMapReady(true)}
            options={{
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              mapTypeControlOptions: {
                mapTypeIds: ["roadmap", "satellite", "hybrid"],
              },
            }}
          >
            {!isApproximate && mapReady && (
              <Marker
                position={center}
                title={title}
                icon={markerIcon}
              />
            )}
          </GoogleMap>
        )}
      </div>

      <div className="property-map__footer">
        <div className="property-map__footer-actions">
          <button
            type="button"
            className="property-map__dir-btn"
            onClick={() => window.open(directionsUrl, "_blank", "noopener,noreferrer")}
          >
            <span className="property-map__dir-btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </span>
            <span>Merr Drejtimin</span>
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="property-map__gmaps-btn"
          >
            🗺️ Hap në Maps
          </a>
        </div>
      </div>
    </div>
  );
}
