import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Mission } from '@/types/cat';

type MissionsState = {
  missions: Mission[];
  streakDays: number;
  lastActiveDate: string | null;
  completeMission: (id: string) => void;
  syncFromCatsCount: (count: number) => void;
  touchStreak: () => void;
};

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'first-capture',
    title: 'Capture ton premier chat',
    description: 'Scanne un chat dans la rue pour démarrer ton CatDex.',
    completed: false,
  },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useMissionsStore = create<MissionsState>()(
  persist(
    (set, get) => ({
      missions: DEFAULT_MISSIONS,
      streakDays: 0,
      lastActiveDate: null,
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
            mission.id === 'first-capture' ? { ...mission, completed: true } : mission,
          ),
        }));
        get().touchStreak();
      },
      touchStreak: () => {
        const today = todayKey();
        const { lastActiveDate, streakDays } = get();
        if (lastActiveDate === today) return;
        if (lastActiveDate === yesterdayKey()) {
          set({ streakDays: streakDays + 1, lastActiveDate: today });
          return;
        }
        set({ streakDays: 1, lastActiveDate: today });
      },
    }),
    {
      name: 'catdex-missions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
