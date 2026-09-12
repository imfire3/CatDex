import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { formatDistanceMeters } from '@/lib/constants';

export type AppNotification = {
  id: string;
  type: 'nearby' | 'mission' | 'badge';
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  catId?: string;
  latitude?: number;
  longitude?: number;
};

type NotificationsState = {
  items: AppNotification[];
  pushNearby: (input: {
    catId: string;
    catName: string;
    breed?: string | null;
    latitude: number;
    longitude: number;
  }) => void;
  pushMissedCat: (input: {
    catId: string;
    catName: string;
    neighborhood: string;
    latitude: number;
    longitude: number;
  }) => void;
  pushRareNearby: (input: {
    catId: string;
    catName: string;
    distanceM: number;
    latitude: number;
    longitude: number;
  }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
};

const MAX_ITEMS = 40;

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      pushNearby: ({ catId, catName, breed, latitude, longitude }) => {
        const recent = get().items.find(
          (item) =>
            item.type === 'nearby' &&
            item.catId === catId &&
            Date.now() - item.createdAt < 30 * 60 * 1000,
        );
        if (recent) return;

        const breedLabel = breed?.trim() || 'Chat';
        const next: AppNotification = {
          id: `nearby-${catId}-${Date.now()}`,
          type: 'nearby',
          title: `À côté de ${catName}`,
          body: `Tu es passé à côté de ${catName} · ${breedLabel}.`,
          createdAt: Date.now(),
          read: false,
          catId,
          latitude,
          longitude,
        };

        set((state) => ({
          items: [next, ...state.items].slice(0, MAX_ITEMS),
        }));
      },
      pushMissedCat: ({ catId, catName, neighborhood, latitude, longitude }) => {
        const recent = get().items.find(
          (item) =>
            item.type === 'mission' &&
            item.catId === catId &&
            Date.now() - item.createdAt < 12 * 60 * 60 * 1000,
        );
        if (recent) return;

        const next: AppNotification = {
          id: `missed-${catId}-${Date.now()}`,
          type: 'mission',
          title: `${catName} t’attend`,
          body: `Pas vu depuis quelques jours · ${neighborhood}.`,
          createdAt: Date.now(),
          read: false,
          catId,
          latitude,
          longitude,
        };

        set((state) => ({
          items: [next, ...state.items].slice(0, MAX_ITEMS),
        }));
      },
      pushRareNearby: ({ catId, catName, distanceM, latitude, longitude }) => {
        const recent = get().items.find(
          (item) =>
            item.type === 'nearby' &&
            item.catId === catId &&
            Date.now() - item.createdAt < 30 * 60 * 1000,
        );
        if (recent) return;

        const next: AppNotification = {
          id: `rare-${catId}-${Date.now()}`,
          type: 'nearby',
          title: 'Chat rare tout près',
          body: `${catName} · ${formatDistanceMeters(distanceM)}.`,
          createdAt: Date.now(),
          read: false,
          catId,
          latitude,
          longitude,
        };

        set((state) => ({
          items: [next, ...state.items].slice(0, MAX_ITEMS),
        }));
      },
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        })),
      markAllRead: () =>
        set((state) => ({
          items: state.items.map((item) =>
            item.read ? item : { ...item, read: true },
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'catdex-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function selectUnreadCount(items: AppNotification[]): number {
  return items.reduce((count, item) => (item.read ? count : count + 1), 0);
}
