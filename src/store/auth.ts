import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/types/cat';

type AuthState = {
  user: User | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  signIn: (provider: User['provider'], email?: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      signIn: (provider, email) => {
        const resolvedEmail =
          email?.trim() ||
          (provider === 'apple'
            ? 'apple@catdex.app'
            : provider === 'google'
              ? 'google@catdex.app'
              : 'explorer@catdex.app');

        set({
          user: {
            id: `user_${provider}_${Date.now()}`,
            email: resolvedEmail,
            displayName: resolvedEmail.split('@')[0] ?? 'Explorer',
            provider,
          },
        });
      },
      signOut: () => set({ user: null }),
    }),
    {
      name: 'catdex-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.getState().setHydrated(true);
      },
    },
  ),
);
