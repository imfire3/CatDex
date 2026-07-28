import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Mission } from '@/types/cat';

type MissionsState = {
  missions: Mission[];
  completeMission: (id: string) => void;
  syncFromCatsCount: (count: number) => void;
};

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'first-capture',
    title: 'Capture ton premier chat',
    description: 'Scanne un chat dans la rue pour démarrer ton CatDex.',
    completed: false,
  },
];

export const useMissionsStore = create<MissionsState>()(
  persist(
    (set) => ({
      missions: DEFAULT_MISSIONS,
      completeMission: (id) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === id ? { ...mission, completed: true } : mission,
          ),
        })),
      syncFromCatsCount: (count) => {
        if (count < 1) return;
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === 'first-capture'
              ? { ...mission, completed: true }
              : mission,
          ),
        }));
      },
    }),
    {
      name: 'catdex-missions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
