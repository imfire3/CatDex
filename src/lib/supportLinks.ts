export const SUPPORT_EMAIL = 'vincentgiacalonepro@gmail.com';

export const IN_APP_TERMS_PATH = '/settings/legal-terms' as const;
export const IN_APP_PRIVACY_PATH = '/settings/legal-privacy' as const;

export function openSupportMail(subject: string, body?: string) {
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}
