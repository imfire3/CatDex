import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Session, AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { isAppleAuthEnabled, isGoogleAuthEnabled } from '@/lib/authProviders';
import type { User } from '@/types/cat';
import {
  clearLocalSupabaseSession,
  isSupabaseConfigured,
  supabase,
} from '@/lib/supabase';

function authErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '');
  }
  return '';
}

/** Stale refresh token / bad key — clear local session instead of crashing Expo Go. */
function isRecoverableAuthError(error: unknown): boolean {
  const message = authErrorMessage(error);
  const status =
    error && typeof error === 'object' && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : NaN;
  return (
    /invalid refresh token/i.test(message) ||
    /refresh token not found/i.test(message) ||
    /invalid jwt/i.test(message) ||
    /invalid api key/i.test(message) ||
    /jwt expired/i.test(message) ||
    /session from session_id claim in jwt does not exist/i.test(message) ||
    /user from sub claim in jwt does not exist/i.test(message) ||
    status === 401 ||
    status === 403
  );
}

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
  /** User ids that already finished intro + permissions on this device. */
  onboardingCompletedUserIds: string[];
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
  updateProfile: (input: { displayName: string }) => Promise<void>;
  /** Update password for the signed-in user (Supabase session required). */
  updatePassword: (newPassword: string) => Promise<void>;
  /** Send a password-reset email to the current account. */
  sendPasswordResetEmail: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  handleAuthUrl: (url: string) => Promise<boolean>;
};

function hasCompletedOnboarding(
  userId: string | undefined | null,
  completedIds: string[],
  email?: string | null,
): boolean {
  if (!userId) return false;
  if (completedIds.includes(userId)) return true;
  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail && completedIds.includes(`email:${normalizedEmail}`)) {
    return true;
  }
  return false;
}

/** Stable mock ids so returning logins skip intro on devices without Supabase. */
function mockEmailUserId(email: string): string {
  return `user_email_${email.trim().toLowerCase()}`;
}

function onboardingKeysForUser(
  userId: string | undefined | null,
  email?: string | null,
): string[] {
  const keys: string[] = [];
  if (userId) keys.push(userId);
  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail) keys.push(`email:${normalizedEmail}`);
  return keys;
}

function withOnboardingCompleted(
  completedIds: string[],
  userId: string | undefined | null,
  email?: string | null,
): string[] {
  const next = [...completedIds];
  for (const key of onboardingKeysForUser(userId, email)) {
    if (!next.includes(key)) next.push(key);
  }
  return next;
}

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

async function clearCatsOnSignOut() {
  try {
    const { useCatsStore } = await import('@/store/cats');
    useCatsStore.getState().clearLocal();
  } catch (error) {
    console.warn('[auth] clear cats on sign-out failed', error);
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

  // Providers are opt-in via EXPO_PUBLIC_AUTH_*. On web, prefer navigating
  // directly — a CORS-blocked probe would abort an otherwise valid OAuth.
  if (Platform.OS === 'web') {
    try {
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
        if (isOAuthProviderDisabledError(err)) throw err;
        // Non-provider HTTP errors: still try the redirect.
      }
    } catch (probeError) {
      if (isOAuthProviderDisabledError(probeError)) throw probeError;
      // Network / CORS — continue to authorize URL.
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
      onboardingCompletedUserIds: [],
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

          if (sessionError) {
            console.warn('[auth] getSession error — clearing local session', sessionError);
            await clearLocalSupabaseSession();
            set({ session: null, user: null, loading: false, error: null });
          } else if (session?.user) {
            const profile = await profileForUser(session.user.id, session.user.email);
            const completedIds = get().onboardingCompletedUserIds;
            set({
              session,
              user: toAppUser(session.user, profile),
              onboardingCompleted: hasCompletedOnboarding(
                session.user.id,
                completedIds,
                session.user.email,
              ),
              loading: false,
            });
            void syncCatsAfterAuth();
          } else {
            set({ session: null, user: null, loading: false });
          }

          supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            try {
              if (nextSession?.user) {
                const profile = await profileForUser(
                  nextSession.user.id,
                  nextSession.user.email,
                );
                const completedIds = get().onboardingCompletedUserIds;
                set({
                  session: nextSession,
                  user: toAppUser(nextSession.user, profile),
                  onboardingCompleted: hasCompletedOnboarding(
                    nextSession.user.id,
                    completedIds,
                    nextSession.user.email,
                  ),
                });
                void syncCatsAfterAuth();
              } else {
                set({ session: null, user: null, onboardingCompleted: false });
              }
            } catch (error) {
              console.warn('[auth] onAuthStateChange error', error);
              if (isRecoverableAuthError(error)) {
                await clearLocalSupabaseSession();
                set({ session: null, user: null, onboardingCompleted: false });
              }
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          if (isRecoverableAuthError(error)) {
            await clearLocalSupabaseSession();
            set({ session: null, user: null, loading: false, error: null });
            return;
          }
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
          const mockId = mockEmailUserId(normalizedEmail);
          const completedIds = get().onboardingCompletedUserIds;
          set({
            user: {
              id: mockId,
              email: normalizedEmail,
              displayName: normalizedEmail.split('@')[0],
              provider: 'email',
            },
            onboardingCompleted: hasCompletedOnboarding(
              mockId,
              completedIds,
              normalizedEmail,
            ),
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
            const completedIds = get().onboardingCompletedUserIds;
            set({
              session: data.session,
              user: toAppUser(data.user, profile),
              onboardingCompleted: hasCompletedOnboarding(
                data.user.id,
                completedIds,
                data.user.email ?? normalizedEmail,
              ),
              loading: false,
            });
            void syncCatsAfterAuth();
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error('Sign in error:', error);
          set({ loading: false, error: error as AuthError });
          // Surface via store — avoid uncaught AuthApiError in Expo Go LogBox.
        }
      },

      signUp: async ({ email, password, displayName }) => {
        if (!supabase) {
          // New account → always show intro + permissions.
          const normalizedEmail = email.trim().toLowerCase();
          set({
            user: {
              id: mockEmailUserId(normalizedEmail),
              email: normalizedEmail,
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
          if (!isNewUser) {
            throw new Error(
              'Un compte existe déjà avec cet e-mail. Connecte-toi.',
            );
          }

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
              if (
                /email not confirmed/i.test(message) ||
                /invalid login credentials/i.test(message)
              ) {
                throw new Error(
                  'Compte créé, mais Supabase exige une confirmation e-mail. Désactive Authentication → Providers → Email → Confirm email pour te connecter directement.',
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

          // New account → always show intro + permissions (not per-device skip).
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
          // Surface via store — avoid uncaught AuthApiError in Expo Go LogBox.
        }
      },

      signInWithGoogle: async () => {
        if (!isGoogleAuthEnabled) {
          throw new Error(
            'Google n’est pas activé. Utilise e-mail / mot de passe.',
          );
        }
        if (!supabase) {
          const mockId = 'user_google_stable';
          const completedIds = get().onboardingCompletedUserIds;
          set({
            user: {
              id: mockId,
              email: 'google@catdex.app',
              displayName: 'Google User',
              provider: 'google',
            },
            onboardingCompleted: hasCompletedOnboarding(
              mockId,
              completedIds,
              'google@catdex.app',
            ),
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
          const mockId = 'user_apple_stable';
          const completedIds = get().onboardingCompletedUserIds;
          set({
            user: {
              id: mockId,
              email: 'apple@catdex.app',
              displayName: 'Apple User',
              provider: 'apple',
            },
            onboardingCompleted: hasCompletedOnboarding(
              mockId,
              completedIds,
              'apple@catdex.app',
            ),
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

      completeOnboarding: () => {
        const current = get().user;
        set((state) => ({
          onboardingCompleted: true,
          onboardingCompletedUserIds: withOnboardingCompleted(
            state.onboardingCompletedUserIds,
            current?.id,
            current?.email,
          ),
        }));
      },

      updatePassword: async (newPassword) => {
        const trimmed = newPassword.trim();
        if (trimmed.length < 8) {
          throw new Error('Le mot de passe doit faire au moins 8 caractères.');
        }
        const current = get().user;
        if (!current) {
          throw new Error('Connecte-toi pour modifier ton mot de passe.');
        }
        if (!supabase || current.id.startsWith('user_')) {
          throw new Error(
            'La modification du mot de passe nécessite un compte cloud connecté.',
          );
        }
        try {
          set({ error: null });
          const { error } = await supabase.auth.updateUser({ password: trimmed });
          if (error) throw error;
        } catch (error) {
          console.error('Update password error:', error);
          set({ error: error as AuthError });
          throw error;
        }
      },

      sendPasswordResetEmail: async () => {
        const current = get().user;
        if (!current?.email) {
          throw new Error('Aucune adresse e-mail associée à ce compte.');
        }
        if (!supabase || current.id.startsWith('user_')) {
          throw new Error(
            'La réinitialisation nécessite un compte cloud connecté.',
          );
        }
        try {
          set({ error: null });
          const redirectTo =
            Platform.OS === 'web' && typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : Linking.createURL('auth/callback');
          const { error } = await supabase.auth.resetPasswordForEmail(
            current.email,
            { redirectTo },
          );
          if (error) throw error;
        } catch (error) {
          console.error('Password reset email error:', error);
          set({ error: error as AuthError });
          throw error;
        }
      },

      updateProfile: async ({ displayName }) => {
        const trimmed = displayName.trim();
        if (!trimmed) {
          throw new Error('Le pseudo ne peut pas être vide.');
        }
        if (trimmed.length < 2) {
          throw new Error('Le pseudo doit faire au moins 2 caractères.');
        }
        if (trimmed.length > 32) {
          throw new Error('Le pseudo est trop long (32 caractères max).');
        }

        const current = get().user;
        if (!current) {
          throw new Error('Connecte-toi pour modifier ton profil.');
        }

        try {
          set({ loading: true, error: null });

          if (supabase && !current.id.startsWith('user_')) {
            const { error } = await supabase
              .from('profiles')
              .upsert(
                {
                  id: current.id,
                  email: current.email,
                  display_name: trimmed,
                },
                { onConflict: 'id' },
              );
            if (error) throw error;
          }

          set({
            user: { ...current, displayName: trimmed },
            loading: false,
          });
        } catch (error) {
          console.error('Update profile error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          if (supabase) {
            await supabase.auth.signOut();
          }
          await clearCatsOnSignOut();
          // Keep onboardingCompletedUserIds so returning users skip intro.
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
        onboardingCompletedUserIds: state.onboardingCompletedUserIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (isGuestUser(state?.user)) {
          useAuthStore.setState({ user: null });
        }
        // Drop stale mock users when Supabase is configured (keep onboarding ids).
        if (
          isSupabaseConfigured &&
          state?.user?.id?.startsWith('user_')
        ) {
          useAuthStore.setState({ user: null });
        }
        // Migrate legacy device-level flag → per-user for the persisted user.
        const userId = state?.user?.id;
        const email = state?.user?.email;
        const ids = state?.onboardingCompletedUserIds ?? [];
        if (state?.onboardingCompleted && userId) {
          useAuthStore.setState({
            onboardingCompletedUserIds: withOnboardingCompleted(
              ids,
              userId,
              email,
            ),
            onboardingCompleted: true,
          });
        } else if (userId && hasCompletedOnboarding(userId, ids, email)) {
          useAuthStore.setState({ onboardingCompleted: true });
        }
        useAuthStore.getState().setHydrated(true);
        void useAuthStore.getState().initialize().catch((error) => {
          console.warn('[auth] initialize rejected', error);
        });
      },
    },
  ),
);

export function getPostAuthHref(onboardingCompleted: boolean) {
  // New users → intro then permissions (GPS + camera).
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
    return 'E-mail ou mot de passe incorrect.';
  }
  if (/invalid api key/i.test(message)) {
    return 'Clé Supabase invalide. Vérifie EXPO_PUBLIC_SUPABASE_ANON_KEY dans .env.';
  }
  if (/invalid refresh token|refresh token not found/i.test(message)) {
    return 'Session expirée. Reconnecte-toi.';
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
