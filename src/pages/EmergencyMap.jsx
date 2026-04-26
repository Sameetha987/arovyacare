import { useState, useEffect, useCallback } from "react";

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

async function geocodePlace(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    label: data[0].display_name.split(",").slice(0, 2).join(", "),
  };
}

async function fetchNearby(lat, lng, radiusM = 6000) {
  const q = `[out:json][timeout:30];
(
  nwr["amenity"="hospital"](around:${radiusM},${lat},${lng});
  nwr["amenity"="clinic"](around:${Math.round(radiusM * 0.7)},${lat},${lng});
);
out center 20;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: "data=" + encodeURIComponent(q),
  });
  const data = await res.json();
  return data.elements
    .filter((e) => e.tags?.name)
    .map((e) => ({
      id: e.id,
      name: e.tags.name,
      type: e.tags.amenity,
      emergency: e.tags.emergency === "yes",
      phone: e.tags.phone || e.tags["contact:phone"] || null,
      lat: e.lat ?? e.center?.lat,
      lng: e.lon ?? e.center?.lon,
    }))
    .filter((e) => e.lat && e.lng)
    .map((e) => ({ ...e, dist: haversine(lat, lng, e.lat, e.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 10);
}

function osmEmbed(lat, lng, delta = 0.03) {
  const [w, s, e, n] = [lng - delta, lat - delta, lng + delta, lat + delta];
  return `https://www.openstreetmap.org/export/embed.html?bbox=${w},${s},${e},${n}&layer=mapnik&marker=${lat},${lng}`;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function Badge({ type, emergency }) {
  if (emergency)
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">EMERGENCY</span>;
  if (type === "hospital")
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">HOSPITAL</span>;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">CLINIC</span>;
}

function HospitalCard({ hospital, index, selected, onSelect }) {
  const isHosp = hospital.type === "hospital";

  const navigate = (e) => {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&travelmode=driving`,
      "_blank"
    );
  };

  return (
    <div
      onClick={() => onSelect(hospital)}
      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
        selected
          ? "border-red-400 bg-red-50"
          : "border-transparent hover:border-gray-200 hover:bg-gray-50 active:bg-gray-100"
      }`}
    >
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 ${
        isHosp ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
      }`}>
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{hospital.name}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Badge type={hospital.type} emergency={hospital.emergency} />
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500 font-medium">{fmtDist(hospital.dist)}</span>
          {hospital.phone && (
            <>
              <span className="text-xs text-gray-400">·</span>
              <a
                href={`tel:${hospital.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-500 hover:underline truncate"
              >
                {hospital.phone}
              </a>
            </>
          )}
        </div>
      </div>

      <button
        onClick={navigate}
        className="flex-shrink-0 mt-0.5 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
      >
        Go →
      </button>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function EmergencyMap() {
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState(null);
  const [areaLabel, setAreaLabel] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mapSrc, setMapSrc] = useState("");
  const [status, setStatus] = useState({ msg: "", loading: false, error: false });
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (selected) setMapSrc(osmEmbed(selected.lat, selected.lng, 0.01));
    else if (coords) setMapSrc(osmEmbed(coords.lat, coords.lng));
  }, [selected, coords]);

  const loadHospitals = useCallback(async (lat, lng, label = "") => {
    setStatus({ msg: "Searching for hospitals…", loading: true });
    setHasSearched(true);
    setSelected(null);
    try {
      const results = await fetchNearby(lat, lng);
      setHospitals(results);
      setCoords({ lat, lng });
      setAreaLabel(label);
      setMapSrc(osmEmbed(lat, lng));
      setStatus({
        msg: results.length
          ? `Found ${results.length} facilities near ${label || "your location"}`
          : `No facilities found within 6 km of ${label || "your location"}`,
        loading: false,
        error: results.length === 0,
      });
    } catch {
      setStatus({ msg: "Failed to fetch hospitals. Check your connection.", loading: false, error: true });
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus({ msg: "Geolocation unavailable. Search manually.", loading: false, error: true });
      return;
    }
    setStatus({ msg: "Detecting your location…", loading: true });
    navigator.geolocation.getCurrentPosition(
      (pos) => loadHospitals(pos.coords.latitude, pos.coords.longitude, "your location"),
      () => setStatus({ msg: "Location access denied. Enter a location to search.", loading: false, error: false })
    );
  }, [loadHospitals]);

  const handleSearch = async () => {
    const q = search.trim();
    if (!q) return;
    setStatus({ msg: `Locating "${q}"…`, loading: true });
    try {
      const loc = await geocodePlace(q);
      if (!loc) {
        setStatus({ msg: `Could not find "${q}". Try a more specific name.`, loading: false, error: true });
        return;
      }
      await loadHospitals(loc.lat, loc.lng, loc.label);
    } catch {
      setStatus({ msg: "Geocoding failed. Try again.", loading: false, error: true });
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setStatus({ msg: "Getting GPS location…", loading: true });
    navigator.geolocation.getCurrentPosition(
      (pos) => loadHospitals(pos.coords.latitude, pos.coords.longitude, "your location"),
      () => setStatus({ msg: "Location access denied.", loading: false, error: true })
    );
  };

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "100dvh", minHeight: "100vh" }}>

      {/* ── HEADER + SEARCH (fixed top) ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm z-10">

        {/* Title row */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
            <div className="absolute w-8 h-8 rounded-full bg-red-100 animate-ping opacity-40" />
            <div className="relative w-4 h-4 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Emergency Hospital Finder</h1>
            <p className="text-[11px] text-gray-400">Real-time · OpenStreetMap</p>
          </div>
        
        </div>

        {/* Search row */}
        <div className="px-4 pb-2 flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter area or city (e.g. T Nagar Chennai, Trichy)"
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex-shrink-0 px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Search
          </button>
          <button
            onClick={handleGPS}
            title="Use my location"
            className="flex-shrink-0 w-10 flex items-center justify-center bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-xl transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className={`px-4 pb-2 flex items-center gap-2 text-xs min-h-[22px] ${status.error ? "text-red-500" : "text-gray-400"}`}>
          {status.loading && <Spinner />}
          <span className="truncate">{status.msg}</span>
        </div>
      </div>

      {/* ── BODY ── */}
      {hasSearched ? (
        /*
         * Desktop (md+): side-by-side flex row, each half fills remaining height
         * Mobile:        map on top (fixed height), list below (scrollable)
         */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

          {/* MAP PANEL */}
          <div
            className="
              w-full md:w-1/2 flex-shrink-0
              md:h-full
              border-b border-gray-200 md:border-b-0 md:border-r
              bg-gray-200
            "
            style={{
              /* mobile: 48vw keeps it large but leaves room for list */
              height: "48vw",
              minHeight: "240px",
            }}
          >
            {mapSrc ? (
              <iframe
                key={mapSrc}
                title="Hospital Map"
                src={mapSrc}
                style={{ border: "none", display: "block", width: "100%", height: "100%" }}
                loading="lazy"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm gap-2">
                <Spinner /> Loading map…
              </div>
            )}
          </div>

          {/* LIST PANEL */}
          <div className="w-full md:w-1/2 flex flex-col bg-white overflow-hidden flex-1 md:h-full min-h-0">
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">
                Nearby Facilities
                {hospitals.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-gray-400">({hospitals.length})</span>
                )}
              </span>
              {areaLabel && (
                <span className="text-xs text-gray-400 truncate max-w-[150px] ml-2">
                  near {areaLabel}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
              {status.loading ? (
                <div className="flex items-center justify-center h-32 gap-2 text-gray-400 text-sm">
                  <Spinner /> Fetching hospitals…
                </div>
              ) : hospitals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center text-gray-400 px-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-40">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <p className="text-sm">No facilities found.</p>
                  <p className="text-xs mt-1">Try a different location.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {hospitals.map((h, i) => (
                    <HospitalCard
                      key={h.id}
                      hospital={h}
                      index={i}
                      selected={selected?.id === h.id}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              Tap a card to zoom in · Go → for directions
            </div>
          </div>
        </div>
      ) : (
        !status.loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 px-6">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mb-4 opacity-25">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <p className="text-sm">Allow location access or search a place above</p>
          </div>
        )
      )}
    </div>
  );
}
