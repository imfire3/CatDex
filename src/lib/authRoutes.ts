const PUBLIC_AUTH_PATHS = new Set([
  '/',
  '/welcome',
  '/login',
  '/signup',
  '/(auth)/welcome',
  '/(auth)/login',
  '/(auth)/signup',
  '/auth/callback',
]);

export function isPublicAuthPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const normalized = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  return PUBLIC_AUTH_PATHS.has(normalized);
}

/** After a hard refresh, send anyone without a session to Welcome. */
export function shouldRedirectToWelcome(
  hydrated: boolean,
  user: { id: string } | null | undefined,
  pathname: string | null | undefined,
): boolean {
  if (!hydrated) return false;
  if (user) return false;
  return !isPublicAuthPath(pathname);
}
