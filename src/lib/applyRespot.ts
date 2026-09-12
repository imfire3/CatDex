import type { Cat } from '@/types/cat';

export type RespotPatch = {
  latitude: number;
  longitude: number;
  photoUri?: string;
  /** Injected for tests; defaults to `new Date().toISOString()`. */
  nowIso?: string;
};

/** Legacy cats may lack `captureCount` — derive a stable minimum of 1. */
export function resolveCaptureCount(cat: Pick<Cat, 'captureCount' | 'views'>): number {
  if (typeof cat.captureCount === 'number' && cat.captureCount >= 1) {
    return cat.captureCount;
  }
  return Math.max(1, cat.views || 1);
}

export function withCaptureCount(cat: Cat): Cat {
  const captureCount = resolveCaptureCount(cat);
  if (cat.captureCount === captureCount) return cat;
  return { ...cat, captureCount };
}

/**
 * Same CatDex entry after a confirmed re-spot:
 * bump captureCount, refresh lastSeenAt / coords / optional photo.
 * Keeps name, number, discoveredAt, analysis, and views unchanged.
 */
export function applyRespot(cat: Cat, patch: RespotPatch): Cat {
  const captureCount = resolveCaptureCount(cat);
  return {
    ...cat,
    captureCount: captureCount + 1,
    lastSeenAt: patch.nowIso ?? new Date().toISOString(),
    latitude: patch.latitude,
    longitude: patch.longitude,
    photoUri: patch.photoUri ?? cat.photoUri,
  };
}
