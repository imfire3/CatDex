import { create } from 'zustand';

import type { Cat, CatAnalysis } from '@/types/cat';

export type ClaimTarget = {
  sourceWorldId: string;
  name: string;
  analysis: CatAnalysis;
  latitude: number;
  longitude: number;
};

type ClaimTargetState = {
  target: ClaimTarget | null;
  setTarget: (target: ClaimTarget) => void;
  clearTarget: () => void;
};

/**
 * Snapshot of a discoverable community pin the player is claiming.
 * Survives camera permission modals; cleared after a successful CatDex add.
 */
export const useClaimTargetStore = create<ClaimTargetState>((set) => ({
  target: null,
  setTarget: (target) => set({ target }),
  clearTarget: () => set({ target: null }),
}));

export function claimTargetFromCat(cat: Cat): ClaimTarget {
  return {
    sourceWorldId: cat.remoteId || cat.id,
    name: cat.name,
    analysis: { ...cat.analysis },
    latitude: cat.latitude,
    longitude: cat.longitude,
  };
}
