/**
 * CatDex Design System — Figma Cat-DEX-UI foundations
 * Primary indigo (#6C63FF) · white-first · calm surfaces
 *
 * Source: https://www.figma.com/design/qIYWbKuvILi9hjSmT60rmn/Cat-DEX-UI?node-id=218-40
 * Coat colors live in src/lib/catTheme.ts — rarity accents only.
 */

const PRIMARY = '#6C63FF';
const PRIMARY_HOVER = '#756CFF';
const PRIMARY_PRESSED = '#5C53F5';
const PRIMARY_SOFT = 'rgba(108, 99, 255, 0.12)';
const SURFACE = '#F8F9FC';
const BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';

const light = {
  brand: PRIMARY,
  brandPressed: PRIMARY_PRESSED,
  brandHover: PRIMARY_HOVER,
  brandSoft: PRIMARY_SOFT,
  captureFabHalo: 'rgba(108, 99, 255, 0.28)',
  accent: PRIMARY,
  accentPressed: PRIMARY_PRESSED,
  accentHover: PRIMARY_HOVER,
  accentSoft: PRIMARY_SOFT,
  accentStrong: PRIMARY_PRESSED,
  primary: PRIMARY,
  primaryHover: PRIMARY_HOVER,
  primaryPressed: PRIMARY_PRESSED,
  primarySoft: PRIMARY_SOFT,
  violet: PRIMARY,
  violetSoft: PRIMARY_SOFT,

  background: '#FFFFFF',
  surface: SURFACE,
  /** White cards and sheets on muted surfaces. */
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: SURFACE,
  surfaceTertiary: SURFACE,
  surfaceMuted: SURFACE,
  surfaceDisabled: '#F0EFFF',

  /** Secondary CTA — soft surface fill, primary label */
  ctaSecondary: SURFACE,
  ctaSecondaryPressed: '#EEF0F5',
  ctaSecondaryBorder: BORDER,
  ctaSecondaryLabel: TEXT_PRIMARY,

  /** Social auth — Google (official-adjacent) */
  authGoogleBorder: BORDER,
  authGoogleLabel: '#202124',
  authGooglePressed: SURFACE,
  /** Social auth — Apple HIG */
  authAppleBg: '#000000',
  authApplePressed: '#1A1A1A',
  authAppleLabel: '#FFFFFF',

  text: TEXT_PRIMARY,
  textBrand: PRIMARY,
  textBody: 'rgba(17, 24, 39, 0.78)',
  textSecondary: TEXT_SECONDARY,
  textMuted: '#9CA3AF',
  placeholder: '#9CA3AF',
  textInverse: '#FFFFFF',
  textDisabled: '#B7BDC8',

  border: BORDER,
  borderDefault: BORDER,
  borderStrong: '#D1D5DB',
  focusRing: PRIMARY,
  borderError: '#EF4444',

  mint: '#22C55E',
  mintSoft: 'rgba(34, 197, 94, 0.12)',
  yellow: '#F59E0B',
  yellowSoft: 'rgba(245, 158, 11, 0.12)',
  orange: '#F59E0B',
  orangeSoft: 'rgba(245, 158, 11, 0.12)',
  sky: PRIMARY,
  skySoft: PRIMARY_SOFT,
  rose: '#EF4444',
  roseSoft: 'rgba(239, 68, 68, 0.12)',
  success: '#22C55E',
  successSoft: 'rgba(34, 197, 94, 0.12)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
  info: PRIMARY,
  infoSoft: PRIMARY_SOFT,

  /** Map player dot — Google Maps–style blue */
  mapPlayer: '#4285F4',
  mapPlayerSoft: 'rgba(66, 133, 244, 0.32)',
  mapPlayerRing: '#FFFFFF',

  overlay: 'rgba(17, 24, 39, 0.4)',
  onAccent: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onBrand: '#FFFFFF',
  onSurface: TEXT_PRIMARY,
  skeleton: SURFACE,
  skeletonHighlight: '#F3F4F6',
  glassFill: 'rgba(255, 255, 255, 0.9)',
  shadowColor: TEXT_PRIMARY,
  mapPinRing: '#FFFFFF',
  tabBar: '#FFFFFF',
  gradientStart: PRIMARY,
  gradientEnd: PRIMARY_PRESSED,
} as const;

export const palette = {
  light,
  dark: light,
} as const;

export type ColorScheme = keyof typeof palette;

export type ThemeColors = {
  brand: string;
  brandPressed: string;
  brandHover: string;
  brandSoft: string;
  captureFabHalo: string;
  accent: string;
  accentPressed: string;
  accentHover: string;
  accentSoft: string;
  accentStrong: string;
  primary: string;
  primaryHover: string;
  primaryPressed: string;
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
