import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key'),
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase non configuré — auth mock locale. Ajoute EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY dans .env (voir docs/ops/SUPABASE_SETUP.md).',
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Web OAuth / magic-link hash fragments
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

/**
 * Drop a corrupt / expired local session so GoTrue’s boot recover does not
 * surface an uncaught AuthApiError in Expo Go (LogBox red bar).
 */
export async function clearLocalSupabaseSession(): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // ignore — storage may already be empty
  }
}

if (supabase) {
  void supabase.auth
    .getSession()
    .then(async ({ error }) => {
      if (!error) return;
      console.warn('[supabase] boot getSession error — clearing local auth', error.message);
      await clearLocalSupabaseSession();
    })
    .catch(async (error: unknown) => {
      console.warn('[supabase] boot getSession rejected — clearing local auth', error);
      await clearLocalSupabaseSession();
    });
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase n’est pas configuré. Renseigne EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
}
