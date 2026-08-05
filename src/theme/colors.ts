/**
 * CatDex Design System — white-first · soft purple primary (#6C63FF)
 *
 * brand / accent → primary actions, headings, active nav
 * Coat/rarity colors live in src/lib/catTheme.ts — not here.
 */

const BRAND = '#6C63FF';
const BRAND_HOVER = '#756CFF';
const BRAND_PRESSED = '#5C53F5';
const BRAND_SOFT = '#F0EFFF';
const SECONDARY_BG = '#F8F9FC';
const APP_BG = '#FFFFFF';
const ELEVATED = '#FCFCFE';

const light = {
  brand: BRAND,
  brandHover: BRAND_HOVER,
  brandPressed: BRAND_PRESSED,
  brandSoft: BRAND_SOFT,
  captureFabHalo: 'rgba(108, 99, 255, 0.28)',
  accent: BRAND,
  accentPressed: BRAND_PRESSED,
  accentSoft: BRAND_SOFT,
  accentStrong: BRAND_PRESSED,
  primary: BRAND,
  primarySoft: BRAND_SOFT,
  violet: BRAND,
  violetSoft: BRAND_SOFT,

  background: APP_BG,
  surface: APP_BG,
  /** Elevated cards and sheets on the app canvas. */
  surfaceElevated: ELEVATED,
  surfaceSecondary: SECONDARY_BG,
  surfaceTertiary: SECONDARY_BG,
  surfaceMuted: SECONDARY_BG,
  surfaceDisabled: '#F3F4F7',

  /** Secondary CTA — light fill, brand label */
  ctaSecondary: '#FFFFFF',
  ctaSecondaryPressed: SECONDARY_BG,
  ctaSecondaryBorder: '#D7D9E2',
  ctaSecondaryLabel: BRAND,

  /** Social auth — Google (official-adjacent) */
  authGoogleBorder: '#E5E7EB',
  authGoogleLabel: '#202124',
  authGooglePressed: SECONDARY_BG,
  /** Social auth — Apple HIG */
  authAppleBg: '#000000',
  authApplePressed: '#1A1A1A',
  authAppleLabel: '#FFFFFF',

  text: '#181A25',
  textBrand: BRAND,
  textBody: 'rgba(24, 26, 37, 0.78)',
  textSecondary: '#6F7283',
  textMuted: '#9CA0AF',
  placeholder: '#9CA0AF',
  textInverse: '#FFFFFF',
  textDisabled: '#B7BDC8',

  border: '#E5E7EB',
  borderDefault: '#E5E7EB',
  borderStrong: '#D7D9E2',
  focusRing: BRAND,
  borderError: '#EF4444',

  mint: '#22C55E',
  mintSoft: '#ECFDF3',
  yellow: '#F59E0B',
  yellowSoft: '#FFF7E6',
  orange: '#F59E0B',
  orangeSoft: '#FFF7E6',
  sky: '#3B82F6',
  skySoft: '#EFF6FF',
  rose: '#EF4444',
  roseSoft: '#FEF2F2',
  success: '#22C55E',
  successSoft: '#ECFDF3',
  warning: '#F59E0B',
  warningSoft: '#FFF7E6',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',

  /** Map player dot — Google Maps–style blue */
  mapPlayer: '#4285F4',
  mapPlayerSoft: 'rgba(66, 133, 244, 0.32)',
  mapPlayerRing: '#FFFFFF',

  overlay: 'rgba(108, 99, 255, 0.4)',
  onAccent: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onBrand: '#FFFFFF',
  onSurface: '#181A25',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F8F9FC',
  glassFill: 'rgba(255, 255, 255, 0.9)',
  shadowColor: '#181A25',
  mapPinRing: '#FFFFFF',
  tabBar: 'rgba(255, 255, 255, 0.96)',
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
  brandHover: string;
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
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
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
