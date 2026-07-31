/**
 * CatDex Design System — white-first, navy brand, turquoise accent
 *
 * brand (navy) → headings, active nav, secondary CTAs
 * accent/primary (turquoise) → primary buttons, scanner, progress
 * Coat/rarity colors live in src/lib/catTheme.ts — not here.
 */

const light = {
  brand: '#11145A',
  brandPressed: '#0C0F42',
  brandSoft: 'rgba(17, 20, 90, 0.08)',
  accent: '#2EC9C3',
  accentPressed: '#24A8A3',
  accentSoft: 'rgba(46, 201, 195, 0.14)',
  accentStrong: '#24A8A3',
  primary: '#2EC9C3',
  primarySoft: 'rgba(46, 201, 195, 0.14)',
  violet: '#11145A',
  violetSoft: 'rgba(17, 20, 90, 0.08)',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F7F8FC',
  surfaceTertiary: '#F2F4F8',
  surfaceMuted: '#F2F4F8',
  surfaceDisabled: '#ECEFF3',

  text: '#15172B',
  textBrand: '#11145A',
  textBody: 'rgba(21, 23, 43, 0.78)',
  textSecondary: '#667085',
  textMuted: '#98A2B3',
  placeholder: '#98A2B3',
  textInverse: '#FFFFFF',
  textDisabled: '#B7BDC8',

  border: '#E8EAF0',
  borderDefault: '#D9DDE6',
  borderStrong: '#BCC3D0',
  focusRing: '#2EC9C3',
  borderError: '#E5484D',

  mint: '#12B76A',
  mintSoft: 'rgba(18, 183, 106, 0.12)',
  yellow: '#F79009',
  yellowSoft: 'rgba(247, 144, 9, 0.12)',
  orange: '#F79009',
  orangeSoft: 'rgba(247, 144, 9, 0.12)',
  sky: '#2E90FA',
  skySoft: 'rgba(46, 144, 250, 0.12)',
  rose: '#F63D68',
  roseSoft: 'rgba(246, 61, 104, 0.12)',
  success: '#12B76A',
  successSoft: 'rgba(18, 183, 106, 0.12)',
  warning: '#F79009',
  warningSoft: 'rgba(247, 144, 9, 0.12)',
  danger: '#E5484D',
  dangerSoft: 'rgba(229, 72, 77, 0.12)',
  info: '#2E90FA',
  infoSoft: 'rgba(46, 144, 250, 0.12)',

  overlay: 'rgba(17, 20, 90, 0.4)',
  onAccent: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onBrand: '#FFFFFF',
  onSurface: '#15172B',
  skeleton: '#EBEEF5',
  skeletonHighlight: '#F7F8FC',
  glassFill: 'rgba(255, 255, 255, 0.9)',
  shadowColor: '#11145A',
  mapPinRing: '#FFFFFF',
  tabBar: 'rgba(255, 255, 255, 0.96)',
  gradientStart: '#2EC9C3',
  gradientEnd: '#24A8A3',
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
  surfaceSecondary: string;
  surfaceTertiary: string;
  surfaceMuted: string;
  surfaceDisabled: string;
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
