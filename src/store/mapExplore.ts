import { create } from 'zustand';

type MapExploreState = {
  hasNearbyCat: boolean;
  setHasNearbyCat: (value: boolean) => void;
};

export const useMapExploreStore = create<MapExploreState>((set) => ({
  hasNearbyCat: false,
  setHasNearbyCat: (value) => set({ hasNearbyCat: value }),
}));
