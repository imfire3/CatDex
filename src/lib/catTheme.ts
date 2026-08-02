/**
 * Coat themes for CatDex cards — soft pastels on white surfaces.
 * Separate from brand navy / turquoise interface tokens.
 */

const THEME_PALETTE = [
  {
    key: 'roux',
    hex: '#E8834A',
    soft: '#FFF3EC',
    badge: '#E8834A',
  },
  {
    key: 'tigré',
    hex: '#D4A017',
    soft: '#FFF8E8',
    badge: '#D4A017',
  },
  {
    key: 'siamois',
    hex: '#3B9AD9',
    soft: '#EAF6FC',
    badge: '#3B9AD9',
  },
  {
    key: 'menthe',
    hex: '#2BB88A',
    soft: '#E8F8F2',
    badge: '#2BB88A',
  },
  {
    key: 'écaille',
    hex: '#E85A8A',
    soft: '#FDEEF3',
    badge: '#E85A8A',
  },
  {
    key: 'lavande',
    hex: '#6B5CC7',
    soft: '#F0EEFA',
    badge: '#6B5CC7',
  },
  {
    key: 'noir',
    hex: '#4A5168',
    soft: '#EEF0F5',
    badge: '#4A5168',
  },
  {
    key: 'blanc',
    hex: '#8B93A7',
    soft: '#F5F6FA',
    badge: '#8B93A7',
  },
] as const;

export type CatTheme = (typeof THEME_PALETTE)[number];

export function themeFromColorLabel(label: string, seed = 0): CatTheme {
  const text = label.toLowerCase();
  if (
    text.includes('orange') ||
    text.includes('roux') ||
    text.includes('caramel') ||
    text.includes('ginger')
  ) {
    return THEME_PALETTE[0];
  }
  if (
    text.includes('tigré') ||
    text.includes('tabby') ||
    text.includes('jaune') ||
    text.includes('doré') ||
    text.includes('crème')
  ) {
    return THEME_PALETTE[1];
  }
  if (
    text.includes('bleu') ||
    text.includes('siamois') ||
    text.includes('gris bleu') ||
    text.includes('acier')
  ) {
    return THEME_PALETTE[2];
  }
  if (text.includes('vert') || text.includes('mint') || text.includes('olive')) {
    return THEME_PALETTE[3];
  }
  if (
    text.includes('écaille') ||
    text.includes('tricolore') ||
    text.includes('calico') ||
    text.includes('rose')
  ) {
    return THEME_PALETTE[4];
  }
  if (text.includes('violet') || text.includes('lavande') || text.includes('lilas')) {
    return THEME_PALETTE[5];
  }
  if (text.includes('noir') || text.includes('minuit') || text.includes('charbon')) {
    return THEME_PALETTE[6];
  }
  if (text.includes('blanc') || text.includes('ivoire') || text.includes('neige')) {
    return THEME_PALETTE[7];
  }

  const hash = [...text].reduce((acc, ch) => acc + ch.charCodeAt(0), seed);
  return THEME_PALETTE[hash % THEME_PALETTE.length];
}

/** Soft tint for coat-themed surfaces (light UI only; scheme kept for API compat). */
export function themeSoft(theme: CatTheme, _scheme: 'light' | 'dark' = 'light'): string {
  return theme.soft;
}
