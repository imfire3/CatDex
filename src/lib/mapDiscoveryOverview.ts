/** Prefer cats within this walkable window around the player. */
export const DISCOVERY_OVERVIEW_RADIUS_M = 2500;

/** Cap pins so a city-wide seed still frames a readable cluster. */
export const DISCOVERY_OVERVIEW_MAX_PINS = 24;

const FALLBACK_ORIGIN = {
  latitude: 48.8635,
  longitude: 2.3985,
} as const;

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(a));
}

/**
 * Player + discoverable cats to frame when tapping « À découvrir ».
 * Prefers nearby pins; falls back to the nearest cluster on the map.
 */
export function coordinatesForDiscoveryOverview(
  origin: MapCoordinate | null,
  discoverablePoints: MapCoordinate[],
): MapCoordinate[] {
  const anchor = origin ?? FALLBACK_ORIGIN;
  const ranked = [...discoverablePoints]
    .map((point) => ({
      point,
      distanceM: distanceMeters(
        anchor.latitude,
        anchor.longitude,
        point.latitude,
        point.longitude,
      ),
    }))
    .sort((a, b) => a.distanceM - b.distanceM);

  const nearby = ranked.filter(
    ({ distanceM }) => distanceM <= DISCOVERY_OVERVIEW_RADIUS_M,
  );
  const picked = (nearby.length > 0 ? nearby : ranked).slice(
    0,
    DISCOVERY_OVERVIEW_MAX_PINS,
  );

  return [anchor, ...picked.map(({ point }) => point)];
}
