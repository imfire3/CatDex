import type { Cat } from '@/types/cat';

export type RespotPatch = {
  latitude: number;
  longitude: number;
  photoUri?: string;
  /** Injected for tests; defaults to `new Date().toISOString()`. */
  nowIso?: string;
};

export function applyRespot(cat: Cat, patch: RespotPatch): Cat {
  return {
    ...cat,
    views: cat.views + 1,
    lastSeenAt: patch.nowIso ?? new Date().toISOString(),
    latitude: patch.latitude,
    longitude: patch.longitude,
    photoUri: patch.photoUri ?? cat.photoUri,
  };
}
