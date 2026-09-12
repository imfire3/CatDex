/** Beta admin account — unlocks gallery import on production. */
export const ADMIN_EMAIL = 'admin@gmail.com';

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === ADMIN_EMAIL;
}

/** Staging / local hosts where testers need gallery import (camera often missing). */
export function isStagingHost(hostname: string | null | undefined): boolean {
  const host = (hostname ?? '').trim().toLowerCase();
  if (!host) return false;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('staging--') ||
    host.startsWith('staging.')
  );
}

function currentWebHostname(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.hostname;
}

/** Gallery import: admins everywhere, everyone on staging / local / __DEV__. */
export function canImportGalleryPhotos(
  email: string | null | undefined,
): boolean {
  if (isAdminEmail(email)) return true;
  if (typeof __DEV__ !== 'undefined' && __DEV__) return true;
  return isStagingHost(currentWebHostname());
}
