import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "@/lib/storage/mmkv";
import type { CatAnalysis } from "@/types/database";
import type { DiscoveryResult } from "@/gameplay/types";

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};

type CaptureDraft = {
  photoUri: string | null;
  compressedUri: string | null;
  analysis: CatAnalysis | null;
  discoveryResult: DiscoveryResult | null;
  catName: string;
  note: string;
  latitude: number | null;
  longitude: number | null;
  zoneId: string | null;
  existingCatId: string | null;
  setPhoto: (uri: string) => void;
  setCompressed: (uri: string) => void;
  setAnalysis: (analysis: CatAnalysis) => void;
  setDiscoveryResult: (result: DiscoveryResult) => void;
  setCatName: (name: string) => void;
  setNote: (note: string) => void;
  setLocation: (lat: number, lng: number, zoneId: string) => void;
  setExistingCatId: (id: string) => void;
  reset: () => void;
};

const initialState = {
  photoUri: null,
  compressedUri: null,
  analysis: null,
  discoveryResult: null,
  catName: "",
  note: "",
  latitude: null,
  longitude: null,
  zoneId: null,
  existingCatId: null,
};

export const useCaptureStore = create<CaptureDraft>()(
  persist(
    (set) => ({
      ...initialState,
      setPhoto: (uri) => set({ photoUri: uri }),
      setCompressed: (uri) => set({ compressedUri: uri }),
      setAnalysis: (analysis) =>
        set({ analysis, catName: analysis.suggestedName }),
      setDiscoveryResult: (discoveryResult) => set({ discoveryResult }),
      setCatName: (catName) => set({ catName }),
      setNote: (note) => set({ note }),
      setLocation: (latitude, longitude, zoneId) =>
        set({ latitude, longitude, zoneId }),
      setExistingCatId: (existingCatId) => set({ existingCatId }),
      reset: () => set(initialState),
    }),
    {
      name: "capture-draft",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({
        photoUri: s.photoUri,
        compressedUri: s.compressedUri,
        analysis: s.analysis,
        discoveryResult: s.discoveryResult,
        catName: s.catName,
        note: s.note,
        latitude: s.latitude,
        longitude: s.longitude,
        zoneId: s.zoneId,
        existingCatId: s.existingCatId,
      }),
    }
  )
);

type PendingMapFocus = {
  catId: string;
  latitude: number;
  longitude: number;
};

type AppStore = {
  searchQuery: string;
  chatdexFilter: "all" | "discovered" | "favorites";
  pendingMapFocus: PendingMapFocus | null;
  setSearchQuery: (q: string) => void;
  setChatdexFilter: (f: AppStore["chatdexFilter"]) => void;
  setPendingMapFocus: (focus: PendingMapFocus) => void;
  clearPendingMapFocus: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  searchQuery: "",
  chatdexFilter: "all",
  pendingMapFocus: null,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setChatdexFilter: (chatdexFilter) => set({ chatdexFilter }),
  setPendingMapFocus: (pendingMapFocus) => set({ pendingMapFocus }),
  clearPendingMapFocus: () => set({ pendingMapFocus: null }),
}));
