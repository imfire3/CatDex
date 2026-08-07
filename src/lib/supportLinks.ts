export const SUPPORT_EMAIL = 'support@catdex.app';
export const TERMS_URL = 'https://catdex.app/terms';
export const PRIVACY_URL = 'https://catdex.app/privacy';
export const DISCORD_URL = 'https://discord.gg/catdex';
export const INSTAGRAM_URL = 'https://instagram.com/catdex.app';

export function openSupportMail(subject: string, body?: string) {
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}
