/**
 * CatDex Design System — luminous game UI
 *
 * Primary (indigo navy) → brand, headings, secondary chrome
 * Accent (turquoise) → primary CTAs, FAB, progress, focus
 * Rare / Legendary → collection rarity only (also in catTheme)
 */

const light = {
  brand: '#2D3B8F',
  brandPressed: '#243074',
  brandSoft: 'rgba(45, 59, 143, 0.10)',
  accent: '#43D2C8',
  accentPressed: '#36B8AF',
  accentSoft: 'rgba(67, 210, 200, 0.16)',
  accentStrong: '#36B8AF',
  primary: '#43D2C8',
  primarySoft: 'rgba(67, 210, 200, 0.16)',
  violet: '#8B5CF6',
  violetSoft: 'rgba(139, 92, 246, 0.14)',
  rare: '#8B5CF6',
  rareSoft: 'rgba(139, 92, 246, 0.14)',
  legendary: '#F59E0B',
  legendarySoft: 'rgba(245, 158, 11, 0.14)',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceTertiary: '#EEF2F7',
  surfaceMuted: '#EEF2F7',
  surfaceDisabled: '#E7EAF3',

  text: '#1A1E3A',
  textBrand: '#2D3B8F',
  textBody: 'rgba(26, 30, 58, 0.82)',
  textSecondary: '#69758F',
  textMuted: '#69758F',
  placeholder: '#69758F',
  textInverse: '#FFFFFF',
  textDisabled: '#A8B0C2',

  border: '#E7EAF3',
  borderDefault: '#E7EAF3',
  borderStrong: '#C9D0DE',
  focusRing: '#43D2C8',
  borderError: '#FF5C5C',

  mint: '#34C759',
  mintSoft: 'rgba(52, 199, 89, 0.14)',
  yellow: '#F59E0B',
  yellowSoft: 'rgba(245, 158, 11, 0.14)',
  orange: '#F59E0B',
  orangeSoft: 'rgba(245, 158, 11, 0.14)',
  sky: '#2D3B8F',
  skySoft: 'rgba(45, 59, 143, 0.10)',
  rose: '#FF5C5C',
  roseSoft: 'rgba(255, 92, 92, 0.14)',
  success: '#34C759',
  successSoft: 'rgba(52, 199, 89, 0.14)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.14)',
  danger: '#FF5C5C',
  dangerSoft: 'rgba(255, 92, 92, 0.14)',
  info: '#2D3B8F',
  infoSoft: 'rgba(45, 59, 143, 0.10)',

  overlay: 'rgba(26, 30, 58, 0.40)',
  onAccent: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onBrand: '#FFFFFF',
  onSurface: '#1A1E3A',
  skeleton: '#E7EAF3',
  skeletonHighlight: '#F8FAFC',
  glassFill: 'rgba(255, 255, 255, 0.92)',
  shadowColor: '#2D3B8F',
  mapPinRing: '#FFFFFF',
  tabBar: 'rgba(255, 255, 255, 0.96)',
  gradientStart: '#43D2C8',
  gradientEnd: '#36B8AF',
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
  rare: string;
  rareSoft: string;
  legendary: string;
  legendarySoft: string;
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
