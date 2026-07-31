/**
 * Coat themes + rarity for CatDex collection chrome.
 * Separate from brand interface tokens — coat accents only.
 */

const THEME_PALETTE = [
  {
    key: 'roux',
    hex: '#E8834A',
    soft: '#FFF3EC',
    softDark: '#FFF3EC',
    badge: '#E8834A',
  },
  {
    key: 'tigré',
    hex: '#D4A017',
    soft: '#FFF8E8',
    softDark: '#FFF8E8',
    badge: '#D4A017',
  },
  {
    key: 'siamois',
    hex: '#3B9AD9',
    soft: '#EAF6FC',
    softDark: '#EAF6FC',
    badge: '#3B9AD9',
  },
  {
    key: 'menthe',
    hex: '#2BB88A',
    soft: '#E8F8F2',
    softDark: '#E8F8F2',
    badge: '#2BB88A',
  },
  {
    key: 'écaille',
    hex: '#E85A8A',
    soft: '#FDEEF3',
    softDark: '#FDEEF3',
    badge: '#E85A8A',
  },
  {
    key: 'lavande',
    hex: '#8B5CF6',
    soft: '#F3EEFF',
    softDark: '#F3EEFF',
    badge: '#8B5CF6',
  },
  {
    key: 'noir',
    hex: '#4A5168',
    soft: '#EEF0F5',
    softDark: '#EEF0F5',
    badge: '#4A5168',
  },
  {
    key: 'blanc',
    hex: '#8B93A7',
    soft: '#F5F6FA',
    softDark: '#F5F6FA',
    badge: '#8B93A7',
  },
] as const;

export type CatTheme = (typeof THEME_PALETTE)[number];

export type RarityId = 'common' | 'uncommon' | 'rare' | 'legendary';

export const rarityTokens: Record<
  RarityId,
  { label: string; foreground: string; background: string; border: string; ring: string }
> = {
  common: {
    label: 'Commun',
    foreground: '#69758F',
    background: '#EEF2F7',
    border: '#E7EAF3',
    ring: '#43D2C8',
  },
  uncommon: {
    label: 'Peu commun',
    foreground: '#2D3B8F',
    background: 'rgba(45, 59, 143, 0.10)',
    border: 'rgba(45, 59, 143, 0.24)',
    ring: '#2D3B8F',
  },
  rare: {
    label: 'Rare',
    foreground: '#8B5CF6',
    background: 'rgba(139, 92, 246, 0.14)',
    border: 'rgba(139, 92, 246, 0.28)',
    ring: '#8B5CF6',
  },
  legendary: {
    label: 'Légendaire',
    foreground: '#F59E0B',
    background: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.28)',
    ring: '#F59E0B',
  },
};

/** UI-only rarity from coat / color / seed — does not change data models. */
export function rarityFromCat(colorLabel: string, coatLabel: string, seed = 0): RarityId {
  const text = `${colorLabel} ${coatLabel}`.toLowerCase();
  if (
    text.includes('écaille') ||
    text.includes('calico') ||
    text.includes('tricolore') ||
    text.includes('lavande')
  ) {
    return 'legendary';
  }
  if (
    text.includes('siamois') ||
    text.includes('bleu') ||
    text.includes('violet') ||
    text.includes('noir')
  ) {
    return 'rare';
  }
  if (text.includes('tigré') || text.includes('tabby') || text.includes('roux')) {
    return 'uncommon';
  }
  const hash = [...text].reduce((acc, ch) => acc + ch.charCodeAt(0), seed);
  const ladder: RarityId[] = ['common', 'common', 'uncommon', 'rare', 'legendary'];
  return ladder[hash % ladder.length];
}

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

export function themeSoft(theme: CatTheme, _scheme: 'light' | 'dark' = 'light') {
  return theme.soft;
}

export function dexNumberLabel(n: number) {
  return `#${String(n).padStart(3, '0')}`;
}
