import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as Location from "expo-location";
import { mapService } from "@/services/map.service";

export type LiveLocation = {
  latitude: number;
  longitude: number;
  permission: "granted" | "denied" | "pending";
};

const FALLBACK = { latitude: 48.8606, longitude: 2.368 };

type LocationContextValue = {
  location: LiveLocation;
  recenter: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LiveLocation>({
    ...FALLBACK,
    permission: "pending",
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;

        if (status !== "granted") {
          setLocation({ ...FALLBACK, permission: "denied" });
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;

        setLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          permission: "granted",
        });

        subscription = await mapService.watchLocation((coords) => {
          if (!mounted) return;
          setLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            permission: "granted",
          });
        });
      } catch {
        if (mounted) {
          setLocation({ ...FALLBACK, permission: "denied" });
        }
      }
    })();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  const recenter = useCallback(async () => {
    const coords = await mapService.getCurrentLocation();
    if (!coords) return;
    setLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      permission: "granted",
    });
  }, []);

  const value = useMemo(() => ({ location, recenter }), [location, recenter]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLiveLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLiveLocation must be used within LocationProvider");
  }
  return ctx;
}
