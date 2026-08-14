import { create } from 'zustand';

export type MapFocusRequest = {
  catId: string;
  latitude: number;
  longitude: number;
  /** Bumps so the same cat can be focused again. */
  nonce: number;
};

type MapExploreState = {
  hasNearbyCat: boolean;
  setHasNearbyCat: (value: boolean) => void;
  /** One-shot focus from notifications / deep links. */
  pendingFocus: MapFocusRequest | null;
  requestFocusOnCat: (input: {
    catId: string;
    latitude: number;
    longitude: number;
  }) => void;
  consumePendingFocus: () => MapFocusRequest | null;
};

export const useMapExploreStore = create<MapExploreState>((set, get) => ({
  hasNearbyCat: false,
  setHasNearbyCat: (value) => set({ hasNearbyCat: value }),
  pendingFocus: null,
  requestFocusOnCat: ({ catId, latitude, longitude }) =>
    set((state) => ({
      pendingFocus: {
        catId,
        latitude,
        longitude,
        nonce: (state.pendingFocus?.nonce ?? 0) + 1,
      },
    })),
  consumePendingFocus: () => {
    const pending = get().pendingFocus;
    if (!pending) return null;
    set({ pendingFocus: null });
    return pending;
  },
}));
