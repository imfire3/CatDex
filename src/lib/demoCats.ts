/**
 * In-memory preview cats for __DEV__ when the collection is empty.
 * Spread around Paris 20e so Explorer pins are visible (not stacked).
 * Not written to AsyncStorage.
 */
import { PARIS_20E } from '@/lib/constants';
import type { Cat } from '@/types/cat';

const { latitude: cLat, longitude: cLng } = PARIS_20E.center;

export const DEMO_CATS: Cat[] = [
  {
    id: 'demo_1',
    number: 1,
    name: 'Caramel',
    photoUri: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
    latitude: cLat + 0.0018,
    longitude: cLng - 0.0012,
    discoveredAt: '2026-07-28T10:12:00.000Z',
    views: 0,
    analysis: {
      color: 'Roux',
      breed: 'Européen',
      coat: 'Court',
      description: 'Un roux curieux du 20e.',
      tags: ['Soleil', 'Curieux'],
    },
  },
  {
    id: 'demo_2',
    number: 2,
    name: 'Ombre',
    photoUri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
    latitude: cLat - 0.0014,
    longitude: cLng + 0.0016,
    discoveredAt: '2026-07-29T18:40:00.000Z',
    views: 0,
    analysis: {
      color: 'Noir',
      breed: 'Européen',
      coat: 'Court',
      description: 'Silhouette discrète au crépuscule.',
      tags: ['Ombre', 'Mystère'],
    },
  },
  {
    id: 'demo_3',
    number: 3,
    name: 'Suki',
    photoUri: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80',
    latitude: cLat + 0.0006,
    longitude: cLng + 0.0022,
    discoveredAt: '2026-07-30T09:05:00.000Z',
    views: 0,
    analysis: {
      color: 'Siamois',
      breed: 'Siamois',
      coat: 'Court',
      description: 'Yeux bleus, démarche de prince.',
      tags: ['Rare', 'Élégant'],
    },
  },
  {
    id: 'demo_4',
    number: 4,
    name: 'Mistral',
    photoUri: 'https://images.unsplash.com/photo-1592194996308-7b1b9a1dedbc?w=800&q=80',
    latitude: cLat - 0.0021,
    longitude: cLng - 0.0018,
    discoveredAt: '2026-07-31T14:22:00.000Z',
    views: 0,
    analysis: {
      color: 'Tigré',
      breed: 'Européen',
      coat: 'Court',
      description: 'Tigré doré du square.',
      tags: ['Vif', 'Explorateur'],
    },
  },
  {
    id: 'demo_5',
    number: 5,
    name: 'Nori',
    photoUri: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&q=80',
    latitude: cLat + 0.0024,
    longitude: cLng + 0.0004,
    discoveredAt: '2026-08-01T11:00:00.000Z',
    views: 0,
    analysis: {
      color: 'Gris',
      breed: 'Européen',
      coat: 'Mi-long',
      description: 'Pelage fumée, très observateur.',
      tags: ['Rare', 'Calme'],
    },
  },
];
