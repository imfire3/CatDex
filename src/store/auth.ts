import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/types/cat';

type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
};

type AuthState = {
  user: User | null;
  onboardingCompleted: boolean;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  signIn: (provider: User['provider'], email?: string, displayName?: string) => void;
  signUp: (input: SignUpInput) => void;
  continueAsGuest: () => void;
  completeOnboarding: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      onboardingCompleted: false,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      signIn: (provider, email, displayName) => {
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
            displayName:
              displayName?.trim() ||
              resolvedEmail.split('@')[0] ||
              'Explorer',
            provider,
          },
        });
      },
      signUp: ({ email, displayName }) => {
        set({
          user: {
            id: `user_email_${Date.now()}`,
            email: email.trim(),
            displayName: displayName.trim(),
            provider: 'email',
          },
          onboardingCompleted: false,
        });
      },
      continueAsGuest: () => {
        set({
          user: {
            id: `user_guest_${Date.now()}`,
            email: 'invite@catdex.app',
            displayName: 'Invité',
            provider: 'email',
          },
          onboardingCompleted: false,
        });
      },
      completeOnboarding: () => set({ onboardingCompleted: true }),
      signOut: () => set({ user: null }),
    }),
    {
      name: 'catdex-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        onboardingCompleted: state.onboardingCompleted,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.getState().setHydrated(true);
      },
    },
  ),
);

/** Post-auth destination: onboarding if needed, otherwise map. */
export function getPostAuthHref(onboardingCompleted: boolean) {
  return onboardingCompleted ? '/(tabs)/map' : '/(auth)/intro';
}
