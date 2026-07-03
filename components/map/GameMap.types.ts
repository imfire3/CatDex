import type { MockCat } from "@/data/mock";

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type GameMapMarker = {
  cat: MockCat;
  onPress: () => void;
};

export type GameMapProps = {
  region: MapRegion;
  markers: GameMapMarker[];
  showUserLocation?: boolean;
  onRegionChange?: (region: MapRegion) => void;
  recenterToken?: number;
};

export const DEFAULT_MAP_DELTA = 0.022;

export function regionFromCoords(lat: number, lng: number, delta = DEFAULT_MAP_DELTA): MapRegion {
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}
