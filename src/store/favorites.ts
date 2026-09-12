import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoritesState = {
  favoriteIds: string[];
  companionId: string | null;
  isFavorite: (catId: string) => boolean;
  toggleFavorite: (catId: string) => void;
  setCompanion: (catId: string | null) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      companionId: null,
      isFavorite: (catId) => get().favoriteIds.includes(catId),
      toggleFavorite: (catId) => {
        const { favoriteIds, companionId } = get();
        const isFav = favoriteIds.includes(catId);
        if (isFav) {
          const nextIds = favoriteIds.filter((id) => id !== catId);
          set({
            favoriteIds: nextIds,
            companionId: companionId === catId ? (nextIds[0] ?? null) : companionId,
          });
          return;
        }
        set({
          favoriteIds: [...favoriteIds, catId],
          companionId: companionId ?? catId,
        });
      },
      setCompanion: (catId) => set({ companionId: catId }),
    }),
    {
      name: 'catdex-favorites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteIds: state.favoriteIds,
        companionId: state.companionId,
      }),
    },
  ),
);
