import type { Cat } from '@/types/cat';

/** Métro Belleville — anchor for the “chat près du métro” daily quest. */
export const BELLEVILLE_METRO = {
  latitude: 48.87215,
  longitude: 2.37689,
} as const;

export const METRO_QUEST_RADIUS_M = 250;

const CARDINALS = [
  'nord',
  'nord-est',
  'est',
  'sud-est',
  'sud',
  'sud-ouest',
  'ouest',
  'nord-ouest',
] as const;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earth = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(a));
}

function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Rough 20e pockets — no reverse geocode yet. */
export function neighborhoodLabel(latitude: number, longitude: number): string {
  if (latitude >= 48.868 && longitude < 2.39) return 'Belleville';
  if (latitude >= 48.858 && longitude >= 2.39) return 'Père Lachaise';
  if (latitude < 48.858 && longitude < 2.39) return 'Nation';
  if (latitude >= 48.858 && longitude < 2.39) return 'Ménilmontant';
  return '20e arrondissement';
}

export function locationLabelFromCoords(
  latitude: number,
  longitude: number,
): string {
  return `${neighborhoodLabel(latitude, longitude)}, Paris 20e`;
}

/** Initial bearing from A → B in degrees, 0 = north. */
export function bearingDegrees(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function formatBearingToward(degrees: number): string {
  const idx = Math.round(degrees / 45) % 8;
  return `vers le ${CARDINALS[idx]}`;
}

export function formatDistanceAndDirection(input: {
  distanceM?: number | null;
  fromLat?: number | null;
  fromLng?: number | null;
  toLat: number;
  toLng: number;
}): string | null {
  const dist =
    typeof input.distanceM === 'number' ? formatMeters(input.distanceM) : null;
  if (
    typeof input.fromLat !== 'number' ||
    typeof input.fromLng !== 'number'
  ) {
    return dist;
  }
  const direction = formatBearingToward(
    bearingDegrees(input.fromLat, input.fromLng, input.toLat, input.toLng),
  );
  return dist ? `${dist} · ${direction}` : direction;
}

export function isNearMetro(cat: Pick<Cat, 'latitude' | 'longitude'>): boolean {
  return (
    haversineMeters(
      cat.latitude,
      cat.longitude,
      BELLEVILLE_METRO.latitude,
      BELLEVILLE_METRO.longitude,
    ) <= METRO_QUEST_RADIUS_M
  );
}

/** Stable pick for the calendar day so the pin does not jump on remount. */
export function pickCatOfTheDay(cats: Cat[], now = new Date()): Cat | null {
  if (cats.length === 0) return null;
  const key = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return cats[Math.abs(hash) % cats.length] ?? null;
}

export function groupCatsByNeighborhood<T extends { cat: Cat }>(
  items: T[],
): { label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const label = neighborhoodLabel(item.cat.latitude, item.cat.longitude);
    const next = groups.get(label) ?? [];
    next.push(item);
    groups.set(label, next);
  }
  return [...groups.entries()].map(([label, grouped]) => ({
    label,
    items: grouped,
  }));
}

export function lastSeenLabel(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
