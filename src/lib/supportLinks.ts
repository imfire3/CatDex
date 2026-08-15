/** Support / tip jar — CatDex stays free; optional Revolut contribution. */
export const SUPPORT_REVOLUT_URL =
  'https://revolut.me/vincentgln/pocket/z6jnWY0st1';

export const SUPPORT_CTA_LABEL = 'Soutenir via Revolut';

export const SUPPORT_EMAIL = 'vincentgiacalonepro@gmail.com';

export const IN_APP_TERMS_PATH = '/settings/legal-terms' as const;
export const IN_APP_PRIVACY_PATH = '/settings/legal-privacy' as const;

export function openSupportMail(subject: string, body?: string) {
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}
