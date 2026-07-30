/**
 * Coat themes for CatDex cards — luminous accents on dark surfaces.
 */

const THEME_PALETTE = [
  {
    key: 'roux',
    hex: '#FF9F6B',
    soft: '#2A1C16',
    softDark: '#1A1412',
    badge: '#FF9F6B',
  },
  {
    key: 'tigré',
    hex: '#FFD56A',
    soft: '#2A2412',
    softDark: '#1A1810',
    badge: '#FFD56A',
  },
  {
    key: 'siamois',
    hex: '#6EC8FF',
    soft: '#12202A',
    softDark: '#0E1620',
    badge: '#6EC8FF',
  },
  {
    key: 'menthe',
    hex: '#5EE4B0',
    soft: '#12241E',
    softDark: '#0E1A16',
    badge: '#5EE4B0',
  },
  {
    key: 'écaille',
    hex: '#FF8FB3',
    soft: '#2A181E',
    softDark: '#1A1216',
    badge: '#FF8FB3',
  },
  {
    key: 'lavande',
    hex: '#8D7BFF',
    soft: '#1E162A',
    softDark: '#14101C',
    badge: '#8D7BFF',
  },
  {
    key: 'noir',
    hex: '#A8B0C8',
    soft: '#161A28',
    softDark: '#10141E',
    badge: '#A8B0C8',
  },
  {
    key: 'blanc',
    hex: '#E8EAF4',
    soft: '#1A1E2C',
    softDark: '#12161F',
    badge: '#E8EAF4',
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

export function themeSoft(theme: CatTheme, _scheme: 'light' | 'dark') {
  return theme.softDark;
}

export function deriveCatStats(id: string) {
  const seed = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const pick = (offset: number) => 35 + ((seed * (offset + 3)) % 61);
  return [
    { key: 'curiosite', label: 'Curiosité', value: pick(1), color: '#5EE4B0' },
    { key: 'vitesse', label: 'Vitesse', value: pick(2), color: '#6EC8FF' },
    { key: 'charisme', label: 'Charisme', value: pick(3), color: '#8D7BFF' },
    { key: 'discretion', label: 'Discrétion', value: pick(4), color: '#A8B0C8' },
    { key: 'appetit', label: 'Appétit', value: pick(5), color: '#FF9F6B' },
  ] as const;
}
