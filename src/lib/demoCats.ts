/**
 * Fake map data for local discovery UI trials (__DEV__).
 * Owned pins (✓) + community discoverable pins (?) around Paris 20e.
 * Photos use durable https URLs so web + native markers both render.
 */
import { PARIS_20E } from '@/lib/constants';
import type { Cat } from '@/types/cat';

const { latitude: cLat, longitude: cLng } = PARIS_20E.center;

const PHOTO = {
  miel: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
  ombre: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
  eclair: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80',
  velours: 'https://images.unsplash.com/photo-1592194996308-7b1b9a1dedbc?w=400&q=80',
  nuit: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80',
  pixel: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80',
} as const;

/** Already in the player's CatDex — solid ring + ✓ */
export const DEMO_OWNED_CATS: Cat[] = [
  {
    id: 'demo-owned-miel',
    remoteId: 'demo-owned-miel',
    number: 1,
    name: 'Miel',
    photoUri: PHOTO.miel,
    latitude: cLat + 0.0012,
    longitude: cLng - 0.0009,
    discoveredAt: '2026-08-01T10:00:00.000Z',
    views: 3,
    analysis: {
      color: 'Roux',
      breed: 'Européen',
      coat: 'Court',
      description: 'Roux du square — déjà dans ton CatDex.',
      tags: ['Soleil', 'Curieux'],
      rarity: 'Commun',
    },
  },
  {
    id: 'demo-owned-ombre',
    remoteId: 'demo-owned-ombre',
    number: 2,
    name: 'Ombre',
    photoUri: PHOTO.ombre,
    latitude: cLat - 0.0016,
    longitude: cLng + 0.0011,
    discoveredAt: '2026-08-05T18:20:00.000Z',
    views: 1,
    analysis: {
      color: 'Noir',
      breed: 'Européen',
      coat: 'Court',
      description: 'Silhouette déjà capturée.',
      tags: ['Ombre', 'Mystère'],
      rarity: 'Peu commun',
    },
  },
];

/**
 * Spotted by others — dashed ring + ?
 * One pin sits ~40 m from the quartier center for the nearby pulse.
 */
export const DEMO_COMMUNITY_CATS: Cat[] = [
  {
    id: 'demo-comm-nearby',
    remoteId: 'demo-comm-nearby',
    number: 9001,
    name: 'Pixel',
    photoUri: PHOTO.pixel,
    latitude: cLat + 0.00036,
    longitude: cLng,
    discoveredAt: '2026-08-10T09:00:00.000Z',
    views: 12,
    analysis: {
      color: 'Tigré',
      breed: 'Européen',
      coat: 'Court',
      description: 'Repéré tout près — à photographier.',
      tags: ['Vif', 'Explorateur'],
      rarity: 'Commun',
    },
  },
  {
    id: 'demo-comm-eclair',
    remoteId: 'demo-comm-eclair',
    number: 9002,
    name: 'Éclair',
    photoUri: PHOTO.eclair,
    latitude: cLat + 0.0021,
    longitude: cLng + 0.0018,
    discoveredAt: '2026-08-09T14:00:00.000Z',
    views: 4,
    analysis: {
      color: 'Blanc',
      breed: 'Européen',
      coat: 'Court',
      description: 'Vu par un autre joueur.',
      tags: ['Énergie'],
      rarity: 'Rare',
    },
  },
  {
    id: 'demo-comm-velours',
    remoteId: 'demo-comm-velours',
    number: 9003,
    name: 'Velours',
    photoUri: PHOTO.velours,
    latitude: cLat - 0.002,
    longitude: cLng - 0.0015,
    discoveredAt: '2026-08-08T11:30:00.000Z',
    views: 7,
    analysis: {
      color: 'Gris',
      breed: 'Chartreux',
      coat: 'Mi-long',
      description: 'Pelage doux, pas encore rencontré.',
      tags: ['Calme'],
      rarity: 'Peu commun',
    },
  },
  {
    id: 'demo-comm-nuit',
    remoteId: 'demo-comm-nuit',
    number: 9004,
    name: 'Nuit',
    photoUri: PHOTO.nuit,
    latitude: cLat + 0.0008,
    longitude: cLng - 0.0024,
    discoveredAt: '2026-08-07T21:00:00.000Z',
    views: 2,
    analysis: {
      color: 'Noir',
      breed: 'Européen',
      coat: 'Long',
      description: 'Repéré le soir par la communauté.',
      tags: ['Nocturne'],
      rarity: 'Épique',
    },
  },
];

/** @deprecated Prefer DEMO_OWNED_CATS / DEMO_COMMUNITY_CATS */
export const DEMO_CATS: Cat[] = [...DEMO_OWNED_CATS, ...DEMO_COMMUNITY_CATS];

export function isMapDemoEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_MAP_DEMO === '0') {
    return false;
  }
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_MAP_DEMO === '1') {
    return true;
  }
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export function mergeCatsById(primary: Cat[], extra: Cat[]): Cat[] {
  const byId = new Map<string, Cat>();
  for (const cat of primary) {
    byId.set(cat.remoteId || cat.id, cat);
  }
  for (const cat of extra) {
    const key = cat.remoteId || cat.id;
    if (!byId.has(key)) byId.set(key, cat);
  }
  return [...byId.values()];
}
