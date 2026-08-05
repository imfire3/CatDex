/**
 * CatDex Design System — white cards on soft gray canvas (#F2F2F2), indigo brand (#6A69F8)
 *
 * brand / accent → primary actions, headings, active nav
 * soft gray → muted fills, nested areas, photo placeholders
 * Coat/rarity colors live in src/lib/catTheme.ts — not here.
 */

const BRAND = '#6A69F8';
const BRAND_PRESSED = '#5554E0';
const BRAND_SOFT = 'rgba(106, 105, 248, 0.12)';
const SOFT_GRAY = '#EEF0F2';
/** App canvas */
const APP_BG = '#ECECFE';
const CARD_BG = '#FFFFFF';

const light = {
  brand: BRAND,
  brandPressed: BRAND_PRESSED,
  brandSoft: BRAND_SOFT,
  captureFabHalo: 'rgba(106, 105, 248, 0.28)',
  accent: BRAND,
  accentPressed: BRAND_PRESSED,
  accentSoft: BRAND_SOFT,
  accentStrong: BRAND_PRESSED,
  primary: BRAND,
  primarySoft: BRAND_SOFT,
  violet: BRAND,
  violetSoft: BRAND_SOFT,

  background: APP_BG,
  /** Default card / panel fill — white on the gray canvas. */
  surface: CARD_BG,
  /** White cards and sheets on the app canvas (#ECECFE). */
  surfaceElevated: CARD_BG,
  surfaceSecondary: SOFT_GRAY,
  surfaceTertiary: SOFT_GRAY,
  surfaceMuted: SOFT_GRAY,
  surfaceDisabled: SOFT_GRAY,

  /** Secondary CTA — white fill, brand label */
  ctaSecondary: CARD_BG,
  ctaSecondaryPressed: '#F3F3F7',
  ctaSecondaryBorder: '#D8DBDF',
  ctaSecondaryLabel: BRAND,

  /** Social auth — Google (official-adjacent) */
  authGoogleBorder: SOFT_GRAY,
  authGoogleLabel: '#202124',
  authGooglePressed: SOFT_GRAY,
  /** Social auth — Apple HIG */
  authAppleBg: '#000000',
  authApplePressed: '#1A1A1A',
  authAppleLabel: '#FFFFFF',

  text: '#15172B',
  textBrand: BRAND,
  textBody: 'rgba(21, 23, 43, 0.78)',
  textSecondary: '#667085',
  textMuted: '#98A2B3',
  placeholder: '#98A2B3',
  textInverse: '#FFFFFF',
  textDisabled: '#B7BDC8',

  border: SOFT_GRAY,
  borderDefault: '#D8DBDF',
  borderStrong: '#BCC3D0',
  focusRing: BRAND,
  borderError: '#E5484D',

  mint: '#12B76A',
  mintSoft: 'rgba(18, 183, 106, 0.12)',
  yellow: '#F79009',
  yellowSoft: 'rgba(247, 144, 9, 0.12)',
  orange: '#F79009',
  orangeSoft: 'rgba(247, 144, 9, 0.12)',
  sky: BRAND,
  skySoft: BRAND_SOFT,
  rose: '#F63D68',
  roseSoft: 'rgba(246, 61, 104, 0.12)',
  success: '#12B76A',
  successSoft: 'rgba(18, 183, 106, 0.12)',
  warning: '#F79009',
  warningSoft: 'rgba(247, 144, 9, 0.12)',
  danger: '#E5484D',
  dangerSoft: 'rgba(229, 72, 77, 0.12)',
  info: BRAND,
  infoSoft: BRAND_SOFT,

  /** Map player dot — Google Maps–style blue */
  mapPlayer: '#4285F4',
  mapPlayerSoft: 'rgba(66, 133, 244, 0.32)',
  mapPlayerRing: '#FFFFFF',

  overlay: 'rgba(106, 105, 248, 0.4)',
  onAccent: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onBrand: '#FFFFFF',
  onSurface: '#15172B',
  skeleton: SOFT_GRAY,
  skeletonHighlight: '#F7F8FA',
  glassFill: 'rgba(255, 255, 255, 0.9)',
  shadowColor: BRAND,
  mapPinRing: '#FFFFFF',
  tabBar: CARD_BG,
  gradientStart: BRAND,
  gradientEnd: BRAND_PRESSED,
} as const;

export const palette = {
  light,
  dark: light,
} as const;

export type ColorScheme = keyof typeof palette;

export type ThemeColors = {
  brand: string;
  brandPressed: string;
  brandSoft: string;
  captureFabHalo: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  accentStrong: string;
  primary: string;
  primarySoft: string;
  violet: string;
  violetSoft: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  surfaceMuted: string;
  surfaceDisabled: string;
  ctaSecondary: string;
  ctaSecondaryPressed: string;
  ctaSecondaryBorder: string;
  ctaSecondaryLabel: string;
  authGoogleBorder: string;
  authGoogleLabel: string;
  authGooglePressed: string;
  authAppleBg: string;
  authApplePressed: string;
  authAppleLabel: string;
  /** @deprecated use surfaceSecondary */
  surface2: string;
  text: string;
  textBrand: string;
  textBody: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;
  textInverse: string;
  textDisabled: string;
  border: string;
  borderDefault: string;
  borderStrong: string;
  focusRing: string;
  borderError: string;
  mint: string;
  mintSoft: string;
  yellow: string;
  yellowSoft: string;
  orange: string;
  orangeSoft: string;
  sky: string;
  skySoft: string;
  rose: string;
  roseSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  mapPlayer: string;
  mapPlayerSoft: string;
  mapPlayerRing: string;
  overlay: string;
  onAccent: string;
  onPrimary: string;
  onBrand: string;
  onSurface: string;
  skeleton: string;
  skeletonHighlight: string;
  glassFill: string;
  shadowColor: string;
  mapPinRing: string;
  tabBar: string;
  gradientStart: string;
  gradientEnd: string;
};

export function resolveThemeColors(scheme: ColorScheme): ThemeColors {
  const base = palette[scheme];
  return {
    ...base,
    surface2: base.surfaceSecondary,
  };
}

/** @deprecated Prefer resolveThemeColors(scheme) via useTheme().colors */
export const colors = palette;
