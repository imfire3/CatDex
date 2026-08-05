/**
 * Social auth is opt-in: Google/Apple must be enabled in Supabase AND
 * flagged here, otherwise the web app redirects to a raw JSON 400 page
 * ("Unsupported provider: provider is not enabled").
 */
function envFlag(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  return /^(1|true|yes|on)$/i.test(raw.trim());
}

export const isGoogleAuthEnabled = envFlag('EXPO_PUBLIC_AUTH_GOOGLE', false);
export const isAppleAuthEnabled = envFlag('EXPO_PUBLIC_AUTH_APPLE', false);

export const isAnyOAuthEnabled = isGoogleAuthEnabled || isAppleAuthEnabled;
