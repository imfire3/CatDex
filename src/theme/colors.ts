/**
 * CatDex Design System — Color tokens
 * Accent (coral) is reserved for Scanner, primary CTAs, discovery, and active states.
 */

export const palette = {
  light: {
    background: '#F3F2EF',
    surface: '#FFFFFF',
    surfaceSecondary: '#EAE8E3',
    text: '#14151A',
    textSecondary: '#6E717A',
    accent: '#E4572E',
    accentSoft: '#F6D5C8',
    success: '#2F6F4E',
    warning: '#B8751A',
    danger: '#C0392B',
    border: '#DDDAD3',
    overlay: 'rgba(14, 15, 18, 0.48)',
    focusRing: '#E4572E',
    onAccent: '#FFFFFF',
    onSurface: '#14151A',
    skeleton: '#E2DFD8',
    skeletonHighlight: '#F3F2EF',
    glassFill: 'rgba(255, 255, 255, 0.62)',
    shadowColor: '#0E0F12',
    mapPinRing: '#FFFFFF',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#0E0F12',
    surface: '#17181C',
    surfaceSecondary: '#22242A',
    text: '#F2F1EE',
    textSecondary: '#9A9DA6',
    accent: '#FF6A3D',
    accentSoft: '#3A221C',
    success: '#5CB88A',
    warning: '#E6A84A',
    danger: '#FF6B6B',
    border: '#2C2E35',
    overlay: 'rgba(0, 0, 0, 0.62)',
    focusRing: '#FF6A3D',
    onAccent: '#FFFFFF',
    onSurface: '#F2F1EE',
    skeleton: '#2A2C33',
    skeletonHighlight: '#3A3D46',
    glassFill: 'rgba(23, 24, 28, 0.62)',
    shadowColor: '#000000',
    mapPinRing: '#17181C',
    tabBar: '#17181C',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  /** @deprecated use surfaceSecondary */
  surface2: string;
  text: string;
  textSecondary: string;
  /** @deprecated use textSecondary */
  textMuted: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  overlay: string;
  focusRing: string;
  onAccent: string;
  onSurface: string;
  skeleton: string;
  skeletonHighlight: string;
  glassFill: string;
  shadowColor: string;
  mapPinRing: string;
  tabBar: string;
};

export function resolveThemeColors(scheme: ColorScheme): ThemeColors {
  const base = palette[scheme];
  return {
    ...base,
    surface2: base.surfaceSecondary,
    textMuted: base.textSecondary,
  };
}

/** @deprecated Prefer resolveThemeColors(scheme) via useTheme().colors */
export const colors = palette;
