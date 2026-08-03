import { CATDEX_TARGET, distanceMeters, PARIS_20E } from '@/lib/constants';
import type { Cat } from '@/types/cat';

/** Soft discovery zone around the player (meters). */
export const DISCOVERY_RADIUS_M = 150;

/** Haptic + glow when a cat enters this range. */
export const PROXIMITY_ALERT_M = 80;

export type CatWithDistance = {
  cat: Cat;
  distanceM: number;
};

export function sortCatsByDistance(
  cats: Cat[],
  origin: { latitude: number; longitude: number } | null,
): CatWithDistance[] {
  const anchor = origin ?? PARIS_20E.center;
  return cats
    .map((cat) => ({
      cat,
      distanceM: distanceMeters(anchor.latitude, anchor.longitude, cat.latitude, cat.longitude),
    }))
    .sort((a, b) => a.distanceM - b.distanceM);
}

export function collectionProgress(count: number): number {
  return Math.min(1, count / CATDEX_TARGET);
}

export function playerLevel(count: number): number {
  return Math.max(1, Math.floor(count / 3) + 1);
}

/** Lightweight explore mood — no weather API in MVP. */
export function exploreWeatherLabel(): { emoji: string; label: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 20) {
    return { emoji: '☀️', label: '23°' };
  }
  return { emoji: '🌙', label: 'Nuit' };
}

export function isRareCat(cat: Cat): boolean {
  const coat = cat.analysis.coat?.toLowerCase() ?? '';
  const color = cat.analysis.color?.toLowerCase() ?? '';
  return (
    coat.includes('long') ||
    color.includes('siamois') ||
    color.includes('écaille') ||
    color.includes('bengal')
  );
}
