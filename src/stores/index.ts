import { create } from 'zustand';
import type { ChatDexFilters } from '@/types';

interface OfflineState {
  isOnline: boolean;
  pendingUploads: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
  setOnline: (online: boolean) => void;
  setPendingUploads: (count: number) => void;
  setLastSyncTime: (time: string | null) => void;
  setSyncing: (syncing: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: true,
  pendingUploads: 0,
  lastSyncTime: null,
  isSyncing: false,
  setOnline: (isOnline) => set({ isOnline }),
  setPendingUploads: (pendingUploads) => set({ pendingUploads }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  setSyncing: (isSyncing) => set({ isSyncing }),
}));

interface ChatDexState {
  filters: ChatDexFilters;
  setFilters: (filters: Partial<ChatDexFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: ChatDexFilters = {
  search: '',
  rarity: 'all',
  breed: 'all',
  favoritesOnly: false,
  sortBy: 'date',
};

export const useChatDexStore = create<ChatDexState>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

interface CameraState {
  capturedUri: string | null;
  isUploading: boolean;
  uploadError: string | null;
  setCapturedUri: (uri: string | null) => void;
  setUploading: (uploading: boolean) => void;
  setUploadError: (error: string | null) => void;
  reset: () => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  capturedUri: null,
  isUploading: false,
  uploadError: null,
  setCapturedUri: (capturedUri) => set({ capturedUri }),
  setUploading: (isUploading) => set({ isUploading }),
  setUploadError: (uploadError) => set({ uploadError }),
  reset: () => set({ capturedUri: null, isUploading: false, uploadError: null }),
}));
