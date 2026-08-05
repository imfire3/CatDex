import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { formatCatDefaultName } from '@/lib/constants';
import {
  mergeRemoteCats,
  pullMyCatsFromSupabase,
  pushCatToSupabase,
} from '@/lib/catSync';
import {
  deleteCatPhoto,
  migrateInlineCatPhotos,
  persistCatPhoto,
  reclaimPhotoQuotaFromLocalStorage,
} from '@/lib/photoStorage';
import { isDurablePhotoUri } from '@/lib/photoUri';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Cat, CatAnalysis } from '@/types/cat';

type AddCatInput = {
  photoUri: string;
  latitude: number;
  longitude: number;
  name?: string;
  notes?: string;
  analysis: CatAnalysis;
  /** World pin id being captured (`world-*`). */
  sourceWorldId?: string;
};

type CatsState = {
  cats: Cat[];
  nextNumber: number;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  addCat: (input: AddCatInput) => Promise<Cat>;
  incrementViews: (id: string) => void;
  updateCat: (id: string, patch: Partial<Pick<Cat, 'name' | 'notes' | 'remoteId' | 'photoUri'>>) => void;
  removeCat: (id: string) => void;
  getCat: (id: string) => Cat | undefined;
  syncFromRemote: () => Promise<void>;
  /** Wipe local collection (call on sign-out to avoid cross-account leaks). */
  clearLocal: () => void;
};

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = 'name' in error ? String(error.name) : '';
  const message = 'message' in error ? String(error.message) : String(error);
  return (
    name === 'QuotaExceededError' ||
    /quota/i.test(message) ||
    /exceeded/i.test(message)
  );
}

const safeCatsStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      if (!isQuotaError(error)) throw error;
      await reclaimPhotoQuotaFromLocalStorage();
      try {
        const parsed = JSON.parse(value) as {
          state?: { cats?: Array<{ photoUri?: string }> };
        };
        if (parsed.state?.cats) {
          parsed.state.cats = parsed.state.cats.map((cat) =>
            typeof cat.photoUri === 'string' && cat.photoUri.startsWith('data:')
              ? { ...cat, photoUri: '' }
              : cat,
          );
          await AsyncStorage.setItem(name, JSON.stringify(parsed));
          return;
        }
      } catch {
        // fall through
      }
      console.warn('[cats] storage quota exceeded — could not persist');
    }
  },
  removeItem: (name) => AsyncStorage.removeItem(name),
};

void reclaimPhotoQuotaFromLocalStorage();

export const useCatsStore = create<CatsState>()(
  persist(
    (set, get) => ({
      cats: [],
      nextNumber: 1,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      addCat: async (input) => {
        const number = get().nextNumber;
        const id = `cat_${Date.now()}_${number}`;

        let photoUri = '';
        try {
          photoUri = await persistCatPhoto(id, input.photoUri);
        } catch (error) {
          console.warn('[cats] photo persist failed', error);
          // Keep a durable URI so CatDex / map pins still show the capture.
          photoUri = isDurablePhotoUri(input.photoUri) ? input.photoUri : '';
        }

        let cat: Cat = {
          id,
          number,
          name: input.name?.trim() || formatCatDefaultName(number),
          photoUri,
          latitude: input.latitude,
          longitude: input.longitude,
          discoveredAt: new Date().toISOString(),
          views: 0,
          notes: input.notes?.trim() || undefined,
          analysis: input.analysis,
          sourceWorldId: input.sourceWorldId,
        };

        if (isSupabaseConfigured) {
          const remoteId = await pushCatToSupabase(cat);
          if (remoteId) {
            cat = {
              ...cat,
              remoteId,
              photoUri: cat.photoUri || photoUri,
            };
          }
        }

        set((state) => ({
          cats: [cat, ...state.cats],
          nextNumber: state.nextNumber + 1,
        }));

        return cat;
      },

      incrementViews: (id) =>
        set((state) => ({
          cats: state.cats.map((cat) =>
            cat.id === id || cat.remoteId === id
              ? { ...cat, views: cat.views + 1 }
              : cat,
          ),
        })),

      updateCat: (id, patch) =>
        set((state) => ({
          cats: state.cats.map((cat) =>
            cat.id === id || cat.remoteId === id ? { ...cat, ...patch } : cat,
          ),
        })),

      removeCat: (id) => {
        const existing = get().cats.find(
          (cat) => cat.id === id || cat.remoteId === id,
        );
        if (existing?.photoUri) {
          void deleteCatPhoto(existing.photoUri);
        }
        set((state) => ({
          cats: state.cats.filter(
            (cat) => cat.id !== id && cat.remoteId !== id,
          ),
        }));
      },

      getCat: (id) =>
        get().cats.find((cat) => cat.id === id || cat.remoteId === id),

      syncFromRemote: async () => {
        if (!isSupabaseConfigured) return;
        const remote = await pullMyCatsFromSupabase();
        if (remote.length === 0) return;

        set((state) => {
          const merged = mergeRemoteCats(state.cats, remote);
          const maxNumber = merged.reduce(
            (max, cat) => Math.max(max, cat.number || 0),
            0,
          );
          return {
            cats: merged,
            nextNumber: Math.max(state.nextNumber, maxNumber + 1),
          };
        });
      },

      clearLocal: () => set({ cats: [], nextNumber: 1 }),
    }),
    {
      name: 'catdex-cats',
      storage: createJSONStorage(() => safeCatsStorage),
      partialize: (state) => ({
        cats: state.cats,
        nextNumber: state.nextNumber,
      }),
      onRehydrateStorage: () => (state) => {
        void (async () => {
          try {
            if (state?.cats?.length) {
              const migrated = await migrateInlineCatPhotos(state.cats);
              if (migrated !== state.cats) {
                useCatsStore.setState({ cats: migrated });
              }
            }
          } catch (error) {
            console.warn('[cats] photo migration failed', error);
          } finally {
            useCatsStore.getState().setHydrated(true);
          }
        })();
      },
    },
  ),
);
