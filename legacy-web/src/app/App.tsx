import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import L from "leaflet";
import { CatFace } from "./components/CatFace";
import { Search } from "./components/Search";
import { Zap } from "./components/Zap";
import { Camera } from "./components/Camera";
import "./styles/App.css";

// Types
type Screen =
  | "map"
  | "camera"
  | "ai-scan"
  | "ai-result"
  | "edit-cat"
  | "cat-detail"
  | "dex"
  | "profile"
  | "settings"
  | "notifications";

type Cat = {
  id: number;
  name: string;
  zone: string;
  colorHex: string;
  caught: boolean;
  mx: number; // percentage x coordinate (0-100)
  my: number; // percentage y coordinate (0-100)
};

// Mock data - in a real app, this would come from an API or database
const CATS: Cat[] = [
  {
    id: 1,
    name: "Whiskers",
    zone: "Shibuya",
    colorHex: "#FF6B6B",
    caught: true,
    mx: 30,
    my: 40,
  },
  {
    id: 2,
    name: "Mittens",
    zone: "Shinjuku",
    colorHex: "#4ECDC4",
    caught: false,
    mx: 60,
    my: 70,
  },
  {
    id: 3,
    name: "Luna",
    zone: "Asakusa",
    colorHex: "#45B7D1",
    caught: true,
    mx: 80,
    my: 20,
  },
  {
    id: 4,
    name: "Oliver",
    zone: "Ginza",
    colorHex: "#FFBE0B",
    caught: false,
    mx: 20,
    my: 80,
  },
  {
    id: 5,
    name: "Leo",
    zone: "Akihabara",
    colorHex: "#FB5607",
    caught: true,
    mx: 70,
    my: 60,
  },
];

// Placeholder components - in a real app, these would be properly implemented
const CameraScreen = ({ go }: { go: (s: Screen) => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Camera Screen</h1>
    <button
      onClick={() => go("map")}
      className="w-24 h-10 bg-gray-300 rounded-xl text-gray-800"
    >
      Back to Map
    </button>
  </div>
);

const AIScanScreen = ({ go, setCaughtCat }: { go: (s: Screen) => void; setCaughtCat: (c: Cat) => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">AI Scan Screen</h1>
    <button
      onClick={() => go("map")}
      className="w-24 h-10 bg-gray-300 rounded-xl text-gray-800"
    >
      Back to Map
    </button>
  </div>
);

const AIResultScreen = ({
  go,
  setSelectedCat,
  detectedCat,
}: {
  go: (s: Screen) => void;
  setSelectedCat: (c: Cat) => void;
  detectedCat: Cat | null;
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">AI Result Screen</h1>
    {detectedCat ? (
      <>
        <p className="mb-2">Detected: {detectedCat.name}</p>
        <button
          onClick={() => {
            setSelectedCat(detectedCat);
            go("cat-detail");
          }}
          className="w-32 h-10 bg-[#FF9F43] rounded-xl text-white"
        >
          View Details
        </button>
      </>
    ) : (
      <p>No cat detected</p>
    )}
    <button
      onClick={() => go("map")}
      className="w-24 h-10 bg-gray-300 rounded-xl text-gray-800 mt-4"
    >
      Back to Map
    </button>
  </div>
);

const EditCatScreen = ({
  go,
  setSelectedCat,
  selectedCat,
}: {
  go: (s: Screen) => void;
  setSelectedCat: (c: Cat) => void;
  selectedCat: Cat | null;
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Edit Cat Screen</h1>
    {selectedCat ? (
      <>
        <p className="mb-2">Editing: {selectedCat.name}</p>
        <button
          onClick={() => go("cat-detail")}
          className="w-24 h-10 bg-gray-300 rounded-xl text-gray-800"
        >
          Save & View
        </button>
      </>
    ) : (
      <>
        <p>No cat selected</p>
        <button onClick={() => go("map")} className="mt-4">
          Back to Map
        </button>
      </>
    )}
  </div>
);

const CatDetailScreen = ({
  go,
  setSelectedCat,
  selectedCat,
}: {
  go: (s: Screen) => void;
  setSelectedCat: (c: Cat) => void;
  selectedCat: Cat | null;
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Cat Detail Screen</h1>
    {selectedCat ? (
      <>
        <div className="w-32 h-32 flex items-center justify-center mb-4" style={{ background: `${selectedCat.colorHex}33` }}>
          <CatFace color={selectedCat.colorHex} size={28} />
        </div>
        <p className="text-lg font-bold mb-2">{selectedCat.name}</p>
        <p className="text-gray-600 mb-4">Zone: {selectedCat.zone}</p>
        <p className="mb-4">Status: {selectedCat.caught ? "Caught!" : "Not caught yet"}</p>
        {!selectedCat.caught && (
          <button
            onClick={() => {
              // In a real app, this would update the cat's caught status
              alert(`You caught ${selectedCat.name}!`);
              setSelectedCat({ ...selectedCat, caught: true });
            }}
            className="w-32 h-10 bg-[#FF9F43] rounded-xl text-white"
          >
            Catch!
          </button>
        )}
        <button
          onClick={() => go("map")}
          className="w-24 h-10 bg-gray-300 rounded-xl text-gray-800"
        >
          Back to Map
        </button>
      </>
    ) : (
      <>
        <p>No cat selected</p>
        <button onClick={() => go("map")} className="mt-4">
          Back to Map
        </button>
      </>
    )}
  </div>
);

const DexScreen = ({ go }: { go: (s: Screen) => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Dex Screen</h1>
    <p>Coming soon...</p>
    <button onClick={() => go("map")} className="mt-4">
      Back to Map
    </button>
  </div>
);

const ProfileScreen = ({ go }: { go: (s: Screen) => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Profile Screen</h1>
    <p>Coming soon...</p>
    <button onClick={() => go("map")} className="mt-4">
      Back to Map
    </button>
  </div>
);

const SettingsScreen = ({ go }: { go: (s: Screen) => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Settings Screen</h1>
    <p>Coming soon...</p>
    <button onClick={() => go("map")} className="mt-4">
      Back to Map
    </button>
  </div>
);

const NotificationsScreen = ({ go }: { go: (s: Screen) => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Notifications Screen</h1>
    <p>Coming soon...</p>
    <button onClick={() => go("map")} className="mt-4">
      Back to Map
    </button>
  </div>
);

function MapScreen({ go, setSelectedCat }: {
  go: (s: Screen) => void;
  setSelectedCat: (c: Cat) => void;
}) {
  const caughtCats = CATS.filter(c => c.caught);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize map
  React.useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = L.map(mapRef.current, {
      center: [35.7, 139.7], // Approximate center of Tokyo
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
    });

    // Add OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Add markers for caught cats
    caughtCats.forEach(cat => {
      // Convert percentage coordinates to lat/lng
      // NW: [35.8, 139.6], SE: [35.6, 139.8]
      const lng = 139.6 + (cat.mx / 100) * 0.2; // 139.6 to 139.8
      const lat = 35.8 - (cat.my / 100) * 0.2; // 35.8 down to 35.6

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'cat-marker',
          html: `
            <div style="position: relative; width: 48px; height: 48px;">
              <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 32px; height: 8px; border-radius: 50%; background: rgba(0,0,0,0.2);"></div>
              <div style="position: absolute; inset: -4px; border-radius: 50%; background: ${cat.colorHex}; opacity: 0.35; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite; animation-duration: ${1.8 + (cat.id % 3) * 0.4}s;"></div>
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                ${cat.caught ? `<CatFace color="white" size={28} />` : `<span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>?</span>`}
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        })
      })
        .on('click', () => {
          setSelectedCat(cat);
          go("cat-detail");
        })
        .addTo(mapInstance);
    });

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [go, setSelectedCat, caughtCats]);

  // Geolocation watch
  React.useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setPermissionDenied(false);
        setLocationError(null);
        // Update map center to user location
        if (map) {
          map.setView([latitude, longitude], map.getZoom());
        }
      },
      (error) => {
        setPermissionDenied(true);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get user location timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [map]);

  if (!mapRef.current) {
    return (
      <div className="absolute inset-0 flex flex-col bg-gray-100">
        <div ref={mapRef} className="flex-1 relative overflow-hidden" />
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 pointer-events-none">
          <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-md pointer-events-auto">
            <Search size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Search area...</span>
          </div>
          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md pointer-events-auto">
            <Zap size={18} className="text-[#FF9F43]" />
          </button>
        </div>

        {/* Capture button */}
        <button
          onClick={() => go("camera")}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF9F43 0%, #FFD166 100%)", zIndex: 20 }}
        >
          <Camera size={28} className="text-white" />
        </button>

        {/* Nearby sheet */}
        <div className="absolute bottom-24 left-0 right-0 px-4 pointer-events-none" style={{ zIndex: 15 }}>
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 shadow-xl pointer-events-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-gray-800 text-sm">Nearby Cats</p>
              <span className="text-xs text-[#FF9F43] font-bold">{caughtCats.length} spotted</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {caughtCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCat(cat); go("cat-detail"); }}
                  className="flex-shrink-0 w-28 rounded-2xl overflow-hidden bg-white shadow-sm active:scale-95 transition-transform"
                >
                  <div className="h-16 flex items-center justify-center" style={{ background: `${cat.colorHex}33` }}>
                    <CatFace color={cat.colorHex} size={36} />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-black text-gray-800 truncate">{cat.name}</p>
                    <p className="text-xs text-gray-400 truncate">{cat.zone}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading / error overlay */}
        {locationError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-6">
            <p className="mb-4">Location Error</p>
            <p>{locationError}</p>
            <button
              onClick={() => {
                setLocationError(null);
                setPermissionDenied(false);
              }}
              className="w-full py-2 bg-white rounded-2xl font-bold text-gray-800 text-base active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        )}
        {!userLocation && !locationError && !permissionDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-6">
            <p className="mb-4">Locating…</p>
            <p>Please allow location access to see your position.</p>
          </div>
        )}
        {permissionDenied && !locationError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-6">
            <p className="mb-4">Location Permission Denied</p>
            <p>Please enable location access in your browser settings to use the walking feature.</p>
            <button
              onClick={() => {
                setPermissionDenied(false);
              }}
              className="w-full py-2 bg-white rounded-2xl font-bold text-gray-800 text-base active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-100">
      <div ref={mapRef} className="flex-1 relative overflow-hidden" />
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 pointer-events-none">
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-md pointer-events-auto">
          <Search size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Search area...</span>
        </div>
        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md pointer-events-auto">
          <Zap size={18} className="text-[#FF9F43]" />
        </button>
      </div>

      {/* Capture button */}
      <button
        onClick={() => go("camera")}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
        style={{ background: "linear-gradient(135deg, #FF9F43 0%, #FFD166 100%)", zIndex: 20 }}
      >
        <Camera size={28} className="text-white" />
      </button>

      {/* Nearby sheet */}
      <div className="absolute bottom-24 left-0 right-0 px-4 pointer-events-none" style={{ zIndex: 15 }}>
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-gray-800 text-sm">Nearby Cats</p>
            <span className="text-xs text-[#FF9F43] font-bold">{caughtCats.length} spotted</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {caughtCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCat(cat); go("cat-detail"); }}
                className="flex-shrink-0 w-28 rounded-2xl overflow-hidden bg-white shadow-sm active:scale-95 transition-transform"
              >
                <div className="h-16 flex items-center justify-center" style={{ background: `${cat.colorHex}33` }}>
                  <CatFace color={cat.colorHex} size={36} />
                </div>
                <div className="p-2">
                  <p className="text-xs font-black text-gray-800 truncate">{cat.name}</p>
                  <p className="text-xs text-gray-400 truncate">{cat.zone}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Centered character (fixed) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <CatFace color="#FF9F43" size={48} className="z-20" />
      </div>

      {/* Loading / error overlay */}
      {locationError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-6">
          <p className="mb-4">Location Error</p>
          <p>{locationError}</p>
          <button
            onClick={() => {
              setLocationError(null);
              setPermissionDenied(false);
            }}
            className="w-full py-2 bg-white rounded-2xl font-bold text-gray-800 text-base active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}
      {!userLocation && !locationError && !permissionDenied && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-6">
          <p className="mb-4">Locating…</p>
          <p>Please allow location access to see your position.</p>
        </div>
      )}
      {permissionDenied && !locationError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-6">
          <p className="mb-4">Location Permission Denied</p>
          <p>Please enable location access in your browser settings to use the walking feature.</p>
          <button
            onClick={() => {
              setPermissionDenied(false);
            }}
            className="w-full py-2 bg-white rounded-2xl font-bold text-gray-800 text-base active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>("map");
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  const go = (screen: Screen) => {
    setScreen(screen);
  };

  return (
    <BrowserRouter>
      <div className="relative w-full h-screen overflow-hidden">
        {!selectedCat && screen !== "map" && screen !== "camera" ? (
          <Navigate to="map" replace />
        ) : null}
        <Routes>
          <Route
            path="/map"
            element={
              <MapScreen go={go} setSelectedCat={setSelectedCat} />
            }
          />
          <Route
            path="/camera"
            element={
              <CameraScreen go={go} />
            }
          />
          <Route
            path="/ai-scan"
            element={
              <AIScanScreen go={go} setCaughtCat={setSelectedCat} />
            }
          />
          <Route
            path="/ai-result"
            element={
              <AIResultScreen go={go} setSelectedCat={setSelectedCat} detectedCat={selectedCat} />
            }
          />
          <Route
            path="/edit-cat"
            element={
              <EditCatScreen go={go} setSelectedCat={setSelectedCat} selectedCat={selectedCat} />
            }
          />
          <Route
            path="/cat-detail"
            element={
              <CatDetailScreen go={go} setSelectedCat={setSelectedCat} selectedCat={selectedCat} />
            }
          />
          <Route
            path="/dex"
            element={
              <DexScreen go={go} />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfileScreen go={go} />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsScreen go={go} />
            }
          />
          <Route
            path="/notifications"
            element={
              <NotificationsScreen go={go} />
            }
          />
          <Route
            path="*"
            element={
              <Navigate to="/map" replace />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;