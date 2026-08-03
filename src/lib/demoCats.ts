/**
 * In-memory preview cats for __DEV__ when the collection is empty.
 * Spread around Paris 20e so Explorer pins are visible (not stacked).
 * Not written to AsyncStorage.
 */
import { PARIS_20E } from '@/lib/constants';
import type { Cat } from '@/types/cat';

const { latitude: lat0, longitude: lng0 } = PARIS_20E.center;

export const DEMO_CATS: Cat[] = [
  {
    id: 'demo_1',
    number: 1,
    name: 'Caramel',
    photoUri: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
    discoveredAt: '2026-07-28T10:12:00.000Z',
    latitude: lat0 + 0.0012,
    longitude: lng0 - 0.0018,
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
    discoveredAt: '2026-07-29T18:40:00.000Z',
    latitude: lat0 - 0.0015,
    longitude: lng0 + 0.0022,
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
    name: 'Nuage',
    photoUri: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80',
    discoveredAt: '2026-07-30T09:05:00.000Z',
    latitude: lat0 + 0.0024,
    longitude: lng0 + 0.0009,
    views: 0,
    analysis: {
      color: 'Blanc',
      breed: 'Européen',
      coat: 'Mi-long',
      description: 'Blanc ivoire, regard clair.',
      tags: ['Doux', 'Calme'],
    },
  },
  {
    id: 'demo_4',
    number: 4,
    name: 'Mistral',
    photoUri: 'https://images.unsplash.com/photo-1592194996308-7b1b9a1dedbc?w=800&q=80',
    discoveredAt: '2026-07-31T14:22:00.000Z',
    latitude: lat0 - 0.0008,
    longitude: lng0 - 0.0026,
    views: 0,
    analysis: {
      color: 'Tigré',
      breed: 'Européen',
      coat: 'Court',
      description: 'Tigré doré du square.',
      tags: ['Vif', 'Explorateur'],
    },
  },
];
