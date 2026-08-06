import { create } from 'zustand';

import type { CatAnalysis } from '@/types/cat';

export type PendingCapture = {
  photoUri: string;
  /** Original camera/gallery URI preferred for CatDex tiles. */
  photoBase64?: string;
  photoMimeType?: string;
  analysis: CatAnalysis;
  latitude: number;
  longitude: number;
  nextNumber: number;
  sourceWorldId?: string;
};

type PendingCaptureState = {
  pending: PendingCapture | null;
  setPending: (pending: PendingCapture) => void;
  clearPending: () => void;
};

/**
 * In-memory draft between scanner analysis and reward confirmation.
 * Not persisted — clearing the app drops an unfinished capture.
 */
export const usePendingCaptureStore = create<PendingCaptureState>((set) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
  clearPending: () => set({ pending: null }),
}));
