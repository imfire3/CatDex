/** Beta admin account — unlocks gallery import on the scanner. */
export const ADMIN_EMAIL = 'admin@gmail.com';

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === ADMIN_EMAIL;
}
