import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Session, AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { isAppleAuthEnabled, isGoogleAuthEnabled } from '@/lib/authProviders';
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

/**
 * Always skip the automatic browser redirect: on web, supabase-js would
 * navigate to /authorize before any JS catch can run, and a disabled
 * provider shows raw JSON (`provider is not enabled`).
 */
async function startOAuth(provider: OAuthProviderId): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase non configuré');
  }

  const redirectTo =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) {
    throw new Error('URL OAuth manquante');
  }

  // Client only builds the URL; probe the authorize endpoint so a disabled
  // provider never replaces the app with a JSON error page.
  if (Platform.OS === 'web') {
    const probe = await fetch(data.url, {
      method: 'GET',
      redirect: 'manual',
      credentials: 'omit',
    });
    if (probe.status >= 400) {
      let payload: unknown = null;
      try {
        payload = await probe.json();
      } catch {
        payload = { message: await probe.text() };
      }
      const msg =
        payload &&
        typeof payload === 'object' &&
        ('msg' in payload || 'message' in payload || 'error_description' in payload)
          ? String(
              (payload as { msg?: string; message?: string; error_description?: string })
                .msg ??
                (payload as { message?: string }).message ??
                (payload as { error_description?: string }).error_description ??
                '',
            )
          : `OAuth HTTP ${probe.status}`;
      const err = Object.assign(new Error(msg || `OAuth HTTP ${probe.status}`), {
        code:
          payload && typeof payload === 'object' && 'error_code' in payload
            ? String((payload as { error_code?: unknown }).error_code ?? '')
            : String(probe.status),
        error_code:
          payload && typeof payload === 'object' && 'error_code' in payload
            ? String((payload as { error_code?: unknown }).error_code ?? '')
            : undefined,
        status: probe.status,
      });
      throw err;
    }
    window.location.assign(data.url);
    return;
  }

  await Linking.openURL(data.url);
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
        const normalizedEmail = email.trim().toLowerCase();
        if (!supabase) {
          set({
            user: {
              id: `user_email_${Date.now()}`,
              email: normalizedEmail,
              displayName: normalizedEmail.split('@')[0],
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
            email: normalizedEmail,
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
              email: email.trim().toLowerCase(),
              displayName: displayName.trim(),
              provider: 'email',
            },
            onboardingCompleted: false,
            loading: false,
            error: null,
          });
          return;
        }

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = displayName.trim();

        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              data: { display_name: trimmedName },
            },
          });
          if (error) {
            const code =
              typeof error === 'object' && error && 'code' in error
                ? String((error as { code?: unknown }).code ?? '')
                : '';
            if (
              code === 'over_email_send_rate_limit' ||
              /rate limit|over_email/i.test(error.message || '')
            ) {
              throw new Error(
                'Limite d’e-mails Supabase atteinte (Confirm email est activé). Désactive Authentication → Providers → Email → Confirm email, attends quelques minutes, puis recrée ton compte.',
              );
            }
            throw error;
          }

          if (!data.user) {
            set({ loading: false });
            throw new Error('Création du compte impossible.');
          }

          // Empty identities = e-mail already registered (Supabase anti-enumeration).
          const isNewUser = (data.user.identities?.length ?? 0) > 0;

          // With "Confirm email" disabled, signUp returns a session. If not,
          // sign in immediately so the user is logged in without a second step.
          let session = data.session;
          if (!session) {
            const { data: signInData, error: signInError } =
              await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password,
              });

            if (signInError) {
              const message = signInError.message || '';
              if (/email not confirmed/i.test(message)) {
                throw new Error(
                  'Compte créé, mais Supabase exige une confirmation e-mail. Désactive Authentication → Providers → Email → Confirm email pour te connecter directement.',
                );
              }
              if (!isNewUser || /invalid login credentials/i.test(message)) {
                throw new Error(
                  'Un compte existe déjà avec cet e-mail. Connecte-toi.',
                );
              }
              throw signInError;
            }
            session = signInData.session;
          }

          if (!session?.user) {
            set({ loading: false });
            throw new Error(
              'Compte créé mais connexion impossible. Réessaie depuis Connexion.',
            );
          }

          // Profile is created by DB trigger; upsert is best-effort only.
          await supabase.from('profiles').upsert(
            {
              id: session.user.id,
              email: trimmedEmail,
              display_name: trimmedName,
            },
            { onConflict: 'id' },
          );

          set({
            session,
            user: {
              id: session.user.id,
              email: trimmedEmail,
              displayName: trimmedName,
              provider: 'email',
            },
            onboardingCompleted: false,
            loading: false,
            error: null,
          });
          void syncCatsAfterAuth();
        } catch (error) {
          console.error('Sign up error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        if (!isGoogleAuthEnabled) {
          throw new Error(
            'Google n’est pas activé. Utilise e-mail / mot de passe.',
          );
        }
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
          await startOAuth('google');
          set({ loading: false });
        } catch (error) {
          console.error('Google sign in error:', error);
          if (isOAuthProviderDisabledError(error)) {
            set((state) => ({
              loading: false,
              oauthDisabled: { ...state.oauthDisabled, google: true },
              error:
                'Google n’est pas activé sur ce projet Supabase. Utilise e-mail / mot de passe.',
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
        if (!isAppleAuthEnabled) {
          throw new Error(
            'Apple n’est pas activé. Utilise e-mail / mot de passe.',
          );
        }
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
          await startOAuth('apple');
          set({ loading: false });
        } catch (error) {
          console.error('Apple sign in error:', error);
          if (isOAuthProviderDisabledError(error)) {
            set((state) => ({
              loading: false,
              oauthDisabled: { ...state.oauthDisabled, apple: true },
              error:
                'Apple n’est pas activé sur ce projet Supabase. Utilise e-mail / mot de passe.',
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
  const code =
    'code' in error && error.code != null ? String(error.code) : '';
  if (isOAuthProviderDisabledError(error) || isOAuthProviderDisabledError(message)) {
    return 'Google / Apple ne sont pas activés dans Supabase. Connecte-toi avec e-mail.';
  }
  if (
    code === 'over_email_send_rate_limit' ||
    /rate limit|over_email/i.test(message)
  ) {
    return 'Limite d’e-mails Supabase atteinte. Désactive Confirm email (Auth → Providers → Email), attends un peu, puis recrée ton compte.';
  }
  if (/invalid login credentials/i.test(message) || code === 'invalid_credentials') {
    return 'E-mail ou mot de passe incorrect. Si tu viens de t’inscrire : le compte n’a peut‑être pas été créé (Confirm email / limite d’e-mails Supabase). Désactive Confirm email puis recrée le compte.';
  }
  if (/email not confirmed/i.test(message) || code === 'email_not_confirmed') {
    return 'E-mail non confirmé. Dans Supabase, désactive Authentication → Providers → Email → Confirm email, puis recrée ton compte.';
  }
  if (/confirmation e-mail est activée|Limite d’e-mails/i.test(message)) {
    return message;
  }
  if (/already registered/i.test(message)) {
    return 'Un compte existe déjà avec cet e-mail.';
  }
  return message;
}
