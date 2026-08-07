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

/** Prefer the richer record when the same cat appears twice (by id / remoteId). */
function pickRicherCat(a: Cat, b: Cat): Cat {
  const aScore =
    (a.photoUri ? 2 : 0) + (a.remoteId ? 1 : 0) + (a.analysis ? 1 : 0);
  const bScore =
    (b.photoUri ? 2 : 0) + (b.remoteId ? 1 : 0) + (b.analysis ? 1 : 0);
  if (bScore > aScore) {
    return {
      ...a,
      ...b,
      photoUri: b.photoUri || a.photoUri,
      remoteId: b.remoteId || a.remoteId,
      sourceWorldId: a.sourceWorldId ?? b.sourceWorldId,
    };
  }
  return {
    ...b,
    ...a,
    photoUri: a.photoUri || b.photoUri,
    remoteId: a.remoteId || b.remoteId,
    sourceWorldId: a.sourceWorldId ?? b.sourceWorldId,
  };
}

function mergeCatsById(primary: Cat[], secondary: Cat[]): Cat[] {
  const byKey = new Map<string, Cat>();

  const upsert = (cat: Cat) => {
    const keys = [cat.id, cat.remoteId].filter(Boolean) as string[];
    let existing: Cat | undefined;
    for (const key of keys) {
      existing = byKey.get(key);
      if (existing) break;
    }
    const next = existing ? pickRicherCat(existing, cat) : cat;
    byKey.set(next.id, next);
    if (next.remoteId) byKey.set(next.remoteId, next);
  };

  for (const cat of primary) upsert(cat);
  for (const cat of secondary) upsert(cat);

  const unique = new Map<string, Cat>();
  for (const cat of byKey.values()) {
    unique.set(cat.id, cat);
  }
  return Array.from(unique.values()).sort((a, b) => b.number - a.number);
}

function maxNextNumber(cats: Cat[], fallback: number): number {
  const maxNumber = cats.reduce((max, cat) => Math.max(max, cat.number || 0), 0);
  return Math.max(fallback, maxNumber + 1);
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
        // Avoid losing the capture to a late persist rehydrate overwrite.
        await waitForCatsHydration();

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
          cats: mergeCatsById([cat], state.cats),
          nextNumber: Math.max(state.nextNumber, number + 1),
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
          return {
            cats: merged,
            nextNumber: maxNextNumber(merged, state.nextNumber),
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
      // Keep in-flight captures when persisted state lands late.
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<CatsState>;
        const mergedCats = mergeCatsById(
          Array.isArray(persisted.cats) ? persisted.cats : [],
          currentState.cats,
        );
        return {
          ...currentState,
          ...persisted,
          cats: mergedCats,
          nextNumber: maxNextNumber(
            mergedCats,
            Math.max(persisted.nextNumber ?? 1, currentState.nextNumber),
          ),
          hydrated: currentState.hydrated,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        // Unblock CatDex immediately; migrate photos in the background.
        useCatsStore.setState({ hydrated: true });
        if (error || !state?.cats?.length) return;

        void (async () => {
          try {
            const migrated = await migrateInlineCatPhotos(state.cats);
            const live = useCatsStore.getState().cats;
            const next = mergeCatsById(migrated, live);
            useCatsStore.setState({
              cats: next,
              nextNumber: maxNextNumber(
                next,
                useCatsStore.getState().nextNumber,
              ),
            });
          } catch (migrationError) {
            console.warn('[cats] photo migration failed', migrationError);
          }
        })();
      },
    },
  ),
);

async function waitForCatsHydration(): Promise<void> {
  if (useCatsStore.getState().hydrated) return;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      unsub();
      resolve();
    };
    const unsub = useCatsStore.subscribe((state) => {
      if (state.hydrated) finish();
    });
    if (useCatsStore.getState().hydrated) {
      finish();
      return;
    }
    // Safety valve — never block capture forever if rehydrate hangs.
    setTimeout(finish, 2500);
  });
}
