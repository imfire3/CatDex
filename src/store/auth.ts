import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Session, AuthError } from '@supabase/supabase-js';

import type { User } from '@/types/cat';
import { supabase } from '@/lib/supabase';

type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  onboardingCompleted: boolean;
  hydrated: boolean;
  loading: boolean;
  error: AuthError | null;
  setHydrated: (value: boolean) => void;
  signIn: (provider: User['provider'], email?: string, displayName?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
};

function isGuestUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    user.id.startsWith('user_guest_') ||
    user.email === 'invite@catdex.app' ||
    user.displayName === 'Invité'
  );
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

      setHydrated: (value) => set({ hydrated: value }),

      initialize: async () => {
        // Skip Supabase initialization if not configured
        if (!supabase) {
          console.log('📝 Using mock authentication (Supabase not configured)');
          set({ loading: false, hydrated: true });
          return;
        }

        try {
          set({ loading: true, error: null });

          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;

          if (session?.user) {
            // Fetch user profile from database
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching profile:', profileError);
            }

            set({
              session,
              user: {
                id: session.user.id,
                email: session.user.email || '',
                displayName: profile?.display_name || session.user.email?.split('@')[0] || 'User',
                provider: (session.user.app_metadata.provider as User['provider']) || 'email',
                avatarUrl: profile?.avatar_url,
              },
              loading: false,
            });
          } else {
            set({ session: null, user: null, loading: false });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              set({
                session,
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                  displayName: profile?.display_name || session.user.email?.split('@')[0] || 'User',
                  provider: (session.user.app_metadata.provider as User['provider']) || 'email',
                  avatarUrl: profile?.avatar_url,
                },
              });
            } else {
              set({ session: null, user: null });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false, error: error as AuthError });
        }
      },

      signIn: async (provider, email, displayName) => {
        // Legacy method for compatibility - redirects to appropriate method
        if (provider === 'email' && email) {
          // For email, this would need a password - kept for backward compatibility
          const resolvedEmail = email?.trim() || 'explorer@catdex.app';
          set({
            user: {
              id: `user_${provider}_${Date.now()}`,
              email: resolvedEmail,
              displayName: displayName?.trim() || resolvedEmail.split('@')[0] || 'Explorer',
              provider,
            },
          });
        } else if (provider === 'google') {
          await get().signInWithGoogle();
        } else if (provider === 'apple') {
          await get().signInWithApple();
        }
      },

      signInWithEmail: async (email, password) => {
        // Fallback to mock if Supabase not configured
        if (!supabase) {
          set({
            user: {
              id: `user_email_${Date.now()}`,
              email: email.trim(),
              displayName: email.split('@')[0],
              provider: 'email',
            },
            loading: false,
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
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({
              session: data.session,
              user: {
                id: data.user.id,
                email: data.user.email || '',
                displayName: profile?.display_name || data.user.email?.split('@')[0] || 'User',
                provider: 'email',
                avatarUrl: profile?.avatar_url,
              },
              loading: false,
            });
          }
        } catch (error) {
          console.error('Sign in error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signUp: async ({ email, password, displayName }) => {
        // Fallback to mock if Supabase not configured
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
          });
          return;
        }

        try {
          set({ loading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                display_name: displayName.trim(),
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            // Create profile
            const { error: profileError } = await supabase.from('profiles').insert({
              id: data.user.id,
              email: email.trim(),
              display_name: displayName.trim(),
            });

            if (profileError) {
              console.error('Profile creation error:', profileError);
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
          }
        } catch (error) {
          console.error('Sign up error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        // Fallback to mock if Supabase not configured
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

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'catdex://auth/callback',
            },
          });

          if (error) throw error;

          set({ loading: false });
        } catch (error) {
          console.error('Google sign in error:', error);
          set({ loading: false, error: error as AuthError });
          throw error;
        }
      },

      signInWithApple: async () => {
        // Fallback to mock if Supabase not configured
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

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
              redirectTo: 'catdex://auth/callback',
            },
          });

          if (error) throw error;

          set({ loading: false });
        } catch (error) {
          console.error('Apple sign in error:', error);
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
          set({ user: null, session: null, onboardingCompleted: false, loading: false });
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
        useAuthStore.getState().setHydrated(true);
        // Initialize Supabase auth after rehydration
        useAuthStore.getState().initialize();
      },
    },
  ),
);

/** Post-auth destination: onboarding if needed, otherwise map. */
export function getPostAuthHref(onboardingCompleted: boolean) {
  return onboardingCompleted ? '/(tabs)/map' : '/(auth)/intro';
}
