import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { formatCatDefaultName } from '@/lib/constants';
import type { Cat, CatAnalysis } from '@/types/cat';

type AddCatInput = {
  photoUri: string;
  latitude: number;
  longitude: number;
  name?: string;
  notes?: string;
  analysis: CatAnalysis;
};

type CatsState = {
  cats: Cat[];
  nextNumber: number;
  addCat: (input: AddCatInput) => Cat;
  incrementViews: (id: string) => void;
  updateCat: (id: string, patch: Partial<Pick<Cat, 'name' | 'notes'>>) => void;
  getCat: (id: string) => Cat | undefined;
};

export const useCatsStore = create<CatsState>()(
  persist(
    (set, get) => ({
      cats: [],
      nextNumber: 1,
      addCat: (input) => {
        const number = get().nextNumber;
        const cat: Cat = {
          id: `cat_${Date.now()}_${number}`,
          number,
          name: input.name?.trim() || formatCatDefaultName(number),
          photoUri: input.photoUri,
          latitude: input.latitude,
          longitude: input.longitude,
          discoveredAt: new Date().toISOString(),
          views: 0,
          notes: input.notes?.trim() || undefined,
          analysis: input.analysis,
        };

        set((state) => ({
          cats: [cat, ...state.cats],
          nextNumber: state.nextNumber + 1,
        }));

        return cat;
      },
      incrementViews: (id) =>
        set((state) => ({
          cats: state.cats.map((cat) =>
            cat.id === id ? { ...cat, views: cat.views + 1 } : cat,
          ),
        })),
      updateCat: (id, patch) =>
        set((state) => ({
          cats: state.cats.map((cat) =>
            cat.id === id ? { ...cat, ...patch } : cat,
          ),
        })),
      getCat: (id) => get().cats.find((cat) => cat.id === id),
    }),
    {
      name: 'catdex-cats',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
