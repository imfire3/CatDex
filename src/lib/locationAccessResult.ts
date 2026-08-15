/**
 * Pure helpers for web geolocation outcome classification (Safari-safe).
 */

export function classifyGeolocationErrorCode(
  code: number | undefined,
): 'denied' | 'unavailable' {
  if (code === 1) return 'denied';
  return 'unavailable';
}

export function locationRequestFromWebOutcomes(
  outcomes: Array<'ok' | 'denied' | 'unavailable'>,
): { granted: boolean; denied: boolean } {
  if (outcomes.includes('ok')) return { granted: true, denied: false };
  if (outcomes.includes('denied')) return { granted: false, denied: true };
  // TIMEOUT / POSITION_UNAVAILABLE after the OS prompt → treat as granted so
  // the in-app modal can dismiss (Safari often grants then fails the first fix).
  if (outcomes.includes('unavailable')) return { granted: true, denied: false };
  return { granted: false, denied: false };
}
