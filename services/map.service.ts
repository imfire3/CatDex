import * as Location from "expo-location";
import { filterNearbyCats } from "@/lib/adapters";
import { queryKeys } from "@/constants/queryKeys";
import { cacheStorage, getJson, setJson } from "@/lib/storage/mmkv";
import { queryClient } from "@/providers/QueryProvider";
import { catsService } from "@/services/cats.service";
import type { Cat, Zone } from "@/types/database";

const CACHE_KEY = "nearby_cats";
const CACHE_TTL_MS = 5 * 60 * 1000;
export const MAP_DISCOVERY_RADIUS_M = 4000;

type CachedCats = { cats: Cat[]; cachedAt: number };

export const mapService = {
  async getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  },

  watchLocation(onUpdate: (coords: { latitude: number; longitude: number }) => void) {
    return Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 25 },
      (pos) => onUpdate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
    );
  },

  async fetchZones(): Promise<Zone[]> {
    return catsService.fetchZones();
  },

  async fetchCats(force = false): Promise<Cat[]> {
    if (!force) {
      const cached = getJson<CachedCats>(cacheStorage, CACHE_KEY);
      if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        return cached.cats;
      }
    }

    const cats = await catsService.fetchPublicCats();
    setJson(cacheStorage, CACHE_KEY, { cats, cachedAt: Date.now() });
    return cats;
  },

  getNearby(cats: Cat[], lat: number, lng: number, radiusMeters = MAP_DISCOVERY_RADIUS_M) {
    return filterNearbyCats(cats, lat, lng, radiusMeters);
  },

  clearCache() {
    cacheStorage.remove(CACHE_KEY);
  },

  primeCapturedCat(cat: Cat, zone?: Zone | null) {
    const enriched = zone ? { ...cat, zone } : cat;
    queryClient.setQueryData<Cat[]>(queryKeys.cats, (old) => {
      const list = old ?? [];
      const index = list.findIndex((item) => item.id === cat.id);
      if (index >= 0) {
        const next = [...list];
        next[index] = { ...next[index], ...enriched };
        return next;
      }
      return [enriched, ...list];
    });
  },

  async refreshCatsAfterCapture() {
    this.clearCache();
    const cats = await this.fetchCats(true);
    queryClient.setQueryData(queryKeys.cats, cats);
    return cats;
  },
};
