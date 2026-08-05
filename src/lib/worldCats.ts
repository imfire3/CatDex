/**
 * Local world cats for Explorer — appear on the map but are NOT in the CatDex
 * until the player captures them via the scanner.
 */
import { Image, Platform } from 'react-native';

import { generateCatAnalysis } from '@/lib/mockAnalysis';
import type { Cat } from '@/types/cat';

const WORLD_OFFSETS_M: Array<{ dLat: number; dLng: number; seed: string }> = [
  { dLat: 0.0018, dLng: 0.0012, seed: 'world-ombre' },
  { dLat: -0.0014, dLng: 0.0021, seed: 'world-miel' },
  { dLat: 0.0022, dLng: -0.0016, seed: 'world-eclair' },
  { dLat: -0.0009, dLng: -0.0024, seed: 'world-velours' },
  { dLat: 0.0006, dLng: 0.0028, seed: 'world-nuit' },
  { dLat: -0.0025, dLng: 0.0004, seed: 'world-pixel' },
];

/** Bundled preview photos for uncaptured world spawns (pin + sheet). */
const WORLD_PHOTOS: Record<string, number> = {
  'world-ombre': require('../../assets/world-cats/ombre.jpg'),
  'world-miel': require('../../assets/world-cats/miel.jpg'),
  'world-eclair': require('../../assets/world-cats/eclair.jpg'),
  'world-velours': require('../../assets/world-cats/velours.jpg'),
  'world-nuit': require('../../assets/world-cats/nuit.jpg'),
  'world-pixel': require('../../assets/world-cats/pixel.jpg'),
};

/**
 * Metro may resolve assets to localhost — rewrite to the current origin on web
 * so Cloudflare / LAN previews can load pin photos.
 */
function photoUriForSeed(seed: string): string {
  const asset = WORLD_PHOTOS[seed];
  if (!asset) return '';
  const uri = Image.resolveAssetSource(asset)?.uri ?? '';
  if (!uri) return '';

  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    /localhost|127\.0\.0\.1/.test(uri)
  ) {
    try {
      const parsed = new URL(uri);
      return `${window.location.origin}${parsed.pathname}${parsed.search}`;
    } catch {
      return uri;
    }
  }

  return uri;
}

/**
 * Build stable world pins around an anchor (player or quartier center).
 * Ids stay fixed so captured state can be matched later if needed.
 */
export function buildWorldCats(anchor: {
  latitude: number;
  longitude: number;
}): Cat[] {
  return WORLD_OFFSETS_M.map((spot, index) => {
    const analysis = generateCatAnalysis(spot.seed);
    return {
      id: spot.seed,
      number: 9000 + index,
      name: analysis.suggestedName ?? 'Chat mystère',
      photoUri: photoUriForSeed(spot.seed),
      latitude: anchor.latitude + spot.dLat,
      longitude: anchor.longitude + spot.dLng,
      discoveredAt: new Date(0).toISOString(),
      views: 0,
      analysis,
    } satisfies Cat;
  });
}

/** True when this pin is a world spawn (not yet owned in CatDex). */
export function isWorldCatId(id: string): boolean {
  return id.startsWith('world-');
}
