import { create } from 'zustand'

import type { Cat } from '@/types/cat'

type CommunityCatsState = {
  /** Other players' sightings — same list the Explorer map uses. */
  cats: Cat[]
  setCats: (cats: Cat[]) => void
}

/**
 * Shared community pins so CatDex and the map stay in sync
 * (grey “À découvrir” tiles = uncaptured map cats).
 */
export const useCommunityCatsStore = create<CommunityCatsState>((set) => ({
  cats: [],
  setCats: (cats) => set({ cats }),
}))
