import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Session, AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import type { User } from '@/types/cat';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
};

type OAuthProviderId = 'google' | 'apple';

type AuthState = {
  user: User | null;
  session: Session | null;
  onboardingCompleted: boolean;
  hydrated: boolean;
  loading: boolean;
  error: AuthError | string | null;
  /** Providers disabled after Supabase returns “provider is not enabled”. */
  oauthDisabled: Partial<Record<OAuthProviderId, boolean>>;
  setHydrated: (value: boolean) => void;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  handleAuthUrl: (url: string) => Promise<boolean>;
};

function isOAuthProviderDisabledError(error: unknown): boolean {
  const message =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : '';
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';
  const errorCode =
    error && typeof error === 'object' && 'error_code' in error
      ? String((error as { error_code?: unknown }).error_code ?? '')
      : '';
  return (
    /provider is not enabled/i.test(message) ||
    /unsupported provider/i.test(message) ||
    ((errorCode === 'validation_failed' || code === 'validation_failed') &&
      /provider/i.test(message))
  );
}

function isGuestUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    user.id.startsWith('user_guest_') ||
    user.email === 'invite@catdex.app' ||
    user.displayName === 'Invité'
  );
}

function providerFromUser(user: { app_metadata?: { provider?: string } }): User['provider'] {
  const provider = user.app_metadata?.provider;
  if (provider === 'google' || provider === 'apple') return provider;
  return 'email';
}

async function profileForUser(userId: string, email: string | undefined) {
  if (!supabase) return null;
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
  }
  return (
    profile ?? {
      display_name: email?.split('@')[0] || 'User',
      avatar_url: null as string | null,
    }
  );
}

function toAppUser(
  sessionUser: {
    id: string;
    email?: string | null;
    app_metadata?: { provider?: string };
  },
  profile: { display_name?: string | null; avatar_url?: string | null } | null,
): User {
  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    displayName:
      profile?.display_name || sessionUser.email?.split('@')[0] || 'User',
    provider: providerFromUser(sessionUser),
    avatarUrl: profile?.avatar_url || undefined,
  };
}

async function syncCatsAfterAuth() {
  try {
    const { useCatsStore } = await import('@/store/cats');
    await useCatsStore.getState().syncFromRemote();
  } catch (error) {
    console.warn('[auth] cat sync failed', error);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      onboardingCompleted: false,
      hydrated: false,
      loading: false,
      error: null,
      oauthDisabled: {},

      setHydrated: (value) => set({ hydrated: value }),
      clearError: () => set({ error: null }),

      initialize: async () => {
        if (!supabase) {
          console.log('📝 Auth mock (Supabase non configuré)');
          set({ loading: false, hydrated: true });
          return;
        }

        try {
          set({ loading: true, error: null });

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          if (session?.user) {
            const profile = await profileForUser(session.user.id, session.user.email);
            set({
              session,
              user: toAppUser(session.user, profile),
              loading: false,
            });
            void syncCatsAfterAuth();
          } else {
            set({ session: null, user: null, loading: false });
          }

          supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            if (nextSession?.user) {
              const profile = await profileForUser(
                nextSession.user.id,
                nextSession.user.email,
              );
              set({
                session: nextSession,
                user: toAppUser(nextSession.user, profile),
              });
              void syncCatsAfterAuth();
            } else {
              set({ session: null, user: null });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false, error: error as AuthError });
        }
      },

      handleAuthUrl: async (url: string) => {
        if (!supabase) return false;
        try {
          // Prefer PKCE code exchange when present
          if (url.includes('code=')) {
            const { error } = await supabase.auth.exchangeCodeForSession(url);
            if (error) throw error;
            return true;
          }
          // Implicit hash tokens (web)
          if (url.includes('access_token') || url.includes('#')) {
            const hash = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if (access_token && refresh_token) {
              const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (error) throw error;
              return true;
            }
          }
        } catch (error) {
          console.error('Auth URL handling error:', error);
          set({ error: error as AuthError });
        }
        return false;
      },

      signInWithEmail: async (email, password) => {
        if (!supabase) {
          set({
            user: {
              id: `user_email_${Date.now()}`,
              email: email.trim(),
              displayName: email.split('@')[0],
              provider: 'email',
            },
            loading: false,
            error: null,
          });
          return;
        }

        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw error;

          if (data.user) {
            const profile = await profileForUser(data.user.id, data.user.email);
            set({
              session: data.session,
              user: toAppUser(data.user, profile),
              loading: false,
            });
            void syncCatsAfterAuth();
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error('Sign in error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signUp: async ({ email, password, displayName }) => {
        if (!supabase) {
          set({
            user: {
              id: `user_email_${Date.now()}`,
              email: email.trim(),
              displayName: displayName.trim(),
              provider: 'email',
            },
            onboardingCompleted: false,
            loading: false,
            error: null,
          });
          return;
        }

        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: { display_name: displayName.trim() },
            },
          });
          if (error) throw error;

          if (data.user) {
            // Profile is created by DB trigger; upsert is best-effort only.
            await supabase.from('profiles').upsert(
              {
                id: data.user.id,
                email: email.trim(),
                display_name: displayName.trim(),
              },
              { onConflict: 'id' },
            );

            if (!data.session) {
              set({
                loading: false,
                error:
                  'Compte créé — confirme ton e-mail puis reconnecte-toi.',
              });
              return;
            }

            set({
              session: data.session,
              user: {
                id: data.user.id,
                email: email.trim(),
                displayName: displayName.trim(),
                provider: 'email',
              },
              onboardingCompleted: false,
              loading: false,
            });
            void syncCatsAfterAuth();
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error('Sign up error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        if (!supabase) {
          set({
            user: {
              id: `user_google_${Date.now()}`,
              email: 'google@catdex.app',
              displayName: 'Google User',
              provider: 'google',
            },
            loading: false,
          });
          return;
        }

        try {
          set({ loading: true, error: null });
          const redirectTo =
            Platform.OS === 'web' && typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : Linking.createURL('auth/callback');

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo,
              skipBrowserRedirect: Platform.OS !== 'web',
            },
          });
          if (error) throw error;

          if (Platform.OS !== 'web' && data.url) {
            await Linking.openURL(data.url);
          }
          set({ loading: false });
        } catch (error) {
          console.error('Google sign in error:', error);
          if (isOAuthProviderDisabledError(error)) {
            set((state) => ({
              loading: false,
              oauthDisabled: { ...state.oauthDisabled, google: true },
              error: 'Google n’est pas activé sur ce projet Supabase. Utilise e-mail / mot de passe.',
            }));
            throw new Error(
              'Google n’est pas activé sur ce projet Supabase. Utilise e-mail / mot de passe.',
            );
          }
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signInWithApple: async () => {
        if (!supabase) {
          set({
            user: {
              id: `user_apple_${Date.now()}`,
              email: 'apple@catdex.app',
              displayName: 'Apple User',
              provider: 'apple',
            },
            loading: false,
          });
          return;
        }

        try {
          set({ loading: true, error: null });
          const redirectTo =
            Platform.OS === 'web' && typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : Linking.createURL('auth/callback');

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
              redirectTo,
              skipBrowserRedirect: Platform.OS !== 'web',
            },
          });
          if (error) throw error;

          if (Platform.OS !== 'web' && data.url) {
            await Linking.openURL(data.url);
          }
          set({ loading: false });
        } catch (error) {
          console.error('Apple sign in error:', error);
          if (isOAuthProviderDisabledError(error)) {
            set((state) => ({
              loading: false,
              oauthDisabled: { ...state.oauthDisabled, apple: true },
              error: 'Apple n’est pas activé sur ce projet Supabase. Utilise e-mail / mot de passe.',
            }));
            throw new Error(
              'Apple n’est pas activé sur ce projet Supabase. Utilise e-mail / mot de passe.',
            );
          }
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      completeOnboarding: () => set({ onboardingCompleted: true }),

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          if (supabase) {
            await supabase.auth.signOut();
          }
          set({
            user: null,
            session: null,
            onboardingCompleted: false,
            loading: false,
          });
        } catch (error) {
          console.error('Sign out error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },
    }),
    {
      name: 'catdex-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        onboardingCompleted: state.onboardingCompleted,
      }),
      onRehydrateStorage: () => (state) => {
        if (isGuestUser(state?.user)) {
          useAuthStore.setState({ user: null, onboardingCompleted: false });
        }
        // Drop stale mock users when Supabase is configured
        if (
          isSupabaseConfigured &&
          state?.user?.id?.startsWith('user_')
        ) {
          useAuthStore.setState({ user: null, onboardingCompleted: false });
        }
        useAuthStore.getState().setHydrated(true);
        void useAuthStore.getState().initialize();
      },
    },
  ),
);

export function getPostAuthHref(onboardingCompleted: boolean) {
  return onboardingCompleted ? '/(tabs)/map' : '/(auth)/intro';
}

export function getAuthErrorMessage(error: AuthError | string | null | undefined): string {
  if (!error) return 'Une erreur est survenue.';
  if (typeof error === 'string') {
    if (isOAuthProviderDisabledError(error)) {
      return 'Google / Apple ne sont pas activés dans Supabase. Connecte-toi avec e-mail.';
    }
    return error;
  }
  const message = error.message || 'Une erreur est survenue.';
  if (isOAuthProviderDisabledError(error) || isOAuthProviderDisabledError(message)) {
    return 'Google / Apple ne sont pas activés dans Supabase. Connecte-toi avec e-mail.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'E-mail ou mot de passe incorrect.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Confirme ton e-mail avant de te connecter.';
  }
  if (/already registered/i.test(message)) {
    return 'Un compte existe déjà avec cet e-mail.';
  }
  return message;
}
