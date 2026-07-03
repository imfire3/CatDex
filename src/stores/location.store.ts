import { create } from 'zustand';
import type { LocationCoords } from '@/utils/location';
import type { NearbyCat } from '@/types';

interface LocationState {
  coords: LocationCoords | null;
  nearbyCats: NearbyCat[];
  isTracking: boolean;
  permissionGranted: boolean;
  setCoords: (coords: LocationCoords | null) => void;
  setNearbyCats: (cats: NearbyCat[]) => void;
  setTracking: (tracking: boolean) => void;
  setPermissionGranted: (granted: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  nearbyCats: [],
  isTracking: false,
  permissionGranted: false,
  setCoords: (coords) => set({ coords }),
  setNearbyCats: (nearbyCats) => set({ nearbyCats }),
  setTracking: (isTracking) => set({ isTracking }),
  setPermissionGranted: (permissionGranted) => set({ permissionGranted }),
}));
