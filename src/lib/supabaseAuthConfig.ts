import { isSupabaseConfigured } from '@/lib/supabase';

export type SupabaseAuthPublicSettings = {
  mailerAutoconfirm: boolean;
  disableSignup: boolean;
};

let cached: SupabaseAuthPublicSettings | null = null;
let inflight: Promise<SupabaseAuthPublicSettings | null> | null = null;

/**
 * Public GoTrue settings (no secret). Used to detect "Confirm email" which
 * blocks instant login and burns the free email rate limit on every signup.
 */
export async function fetchSupabaseAuthSettings(
  force = false,
): Promise<SupabaseAuthPublicSettings | null> {
  if (!force && cached) return cached;
  if (!force && inflight) return inflight;
  if (!isSupabaseConfigured) return null;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  inflight = (async () => {
    try {
      const res = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as {
        mailer_autoconfirm?: boolean;
        disable_signup?: boolean;
      };
      cached = {
        mailerAutoconfirm: Boolean(json.mailer_autoconfirm),
        disableSignup: Boolean(json.disable_signup),
      };
      return cached;
    } catch (error) {
      console.warn('[auth] settings fetch failed', error);
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Confirm-email is ON when autoconfirm is false. */
export function isEmailConfirmRequired(
  settings: SupabaseAuthPublicSettings | null | undefined,
): boolean {
  if (!settings) return false;
  return !settings.mailerAutoconfirm;
}
