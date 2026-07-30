/**
 * CatDex Design System — Premium dark “Pokémon GO of cats”
 * Background #060816 · Cards #10152B · Accent gradient #6E87FF → #8D7BFF
 */

export const palette = {
  light: {
    background: '#060816',
    surface: '#10152B',
    surfaceSecondary: '#161D38',
    surfaceTertiary: '#1C2444',
    text: '#FFFFFF',
    textBody: 'rgba(255,255,255,0.78)',
    textSecondary: 'rgba(255,255,255,0.55)',
    placeholder: 'rgba(255,255,255,0.35)',
    accent: '#6E87FF',
    accentSoft: 'rgba(110, 135, 255, 0.18)',
    accentStrong: '#8D7BFF',
    primary: '#6E87FF',
    primarySoft: 'rgba(110, 135, 255, 0.16)',
    mint: '#5EE4B0',
    mintSoft: 'rgba(94, 228, 176, 0.16)',
    yellow: '#FFD56A',
    yellowSoft: 'rgba(255, 213, 106, 0.16)',
    orange: '#FF9F6B',
    orangeSoft: 'rgba(255, 159, 107, 0.16)',
    sky: '#6EC8FF',
    skySoft: 'rgba(110, 200, 255, 0.16)',
    violet: '#8D7BFF',
    violetSoft: 'rgba(141, 123, 255, 0.16)',
    rose: '#FF8FB3',
    roseSoft: 'rgba(255, 143, 179, 0.16)',
    success: '#5EE4B0',
    warning: '#FFD56A',
    danger: '#FF6B8A',
    border: 'rgba(255,255,255,0.08)',
    overlay: 'rgba(6, 8, 22, 0.72)',
    focusRing: '#6E87FF',
    onAccent: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSurface: '#FFFFFF',
    skeleton: '#161D38',
    skeletonHighlight: '#1C2444',
    glassFill: 'rgba(16, 21, 43, 0.72)',
    shadowColor: '#000000',
    mapPinRing: '#FFFFFF',
    tabBar: 'rgba(6, 8, 22, 0.92)',
    gradientStart: '#6E87FF',
    gradientEnd: '#8D7BFF',
  },
  dark: {
    background: '#060816',
    surface: '#10152B',
    surfaceSecondary: '#161D38',
    surfaceTertiary: '#1C2444',
    text: '#FFFFFF',
    textBody: 'rgba(255,255,255,0.78)',
    textSecondary: 'rgba(255,255,255,0.55)',
    placeholder: 'rgba(255,255,255,0.35)',
    accent: '#6E87FF',
    accentSoft: 'rgba(110, 135, 255, 0.18)',
    accentStrong: '#8D7BFF',
    primary: '#6E87FF',
    primarySoft: 'rgba(110, 135, 255, 0.16)',
    mint: '#5EE4B0',
    mintSoft: 'rgba(94, 228, 176, 0.16)',
    yellow: '#FFD56A',
    yellowSoft: 'rgba(255, 213, 106, 0.16)',
    orange: '#FF9F6B',
    orangeSoft: 'rgba(255, 159, 107, 0.16)',
    sky: '#6EC8FF',
    skySoft: 'rgba(110, 200, 255, 0.16)',
    violet: '#8D7BFF',
    violetSoft: 'rgba(141, 123, 255, 0.16)',
    rose: '#FF8FB3',
    roseSoft: 'rgba(255, 143, 179, 0.16)',
    success: '#5EE4B0',
    warning: '#FFD56A',
    danger: '#FF6B8A',
    border: 'rgba(255,255,255,0.08)',
    overlay: 'rgba(6, 8, 22, 0.72)',
    focusRing: '#6E87FF',
    onAccent: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSurface: '#FFFFFF',
    skeleton: '#161D38',
    skeletonHighlight: '#1C2444',
    glassFill: 'rgba(16, 21, 43, 0.72)',
    shadowColor: '#000000',
    mapPinRing: '#FFFFFF',
    tabBar: 'rgba(6, 8, 22, 0.92)',
    gradientStart: '#6E87FF',
    gradientEnd: '#8D7BFF',
  },
} as const;

export type ColorScheme = keyof typeof palette;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  /** @deprecated use surfaceSecondary */
  surface2: string;
  text: string;
  textBody: string;
  textSecondary: string;
  /** @deprecated use textSecondary */
  textMuted: string;
  placeholder: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  primary: string;
  primarySoft: string;
  mint: string;
  mintSoft: string;
  yellow: string;
  yellowSoft: string;
  orange: string;
  orangeSoft: string;
  sky: string;
  skySoft: string;
  violet: string;
  violetSoft: string;
  rose: string;
  roseSoft: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  overlay: string;
  focusRing: string;
  onAccent: string;
  onPrimary: string;
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
    textMuted: base.textSecondary,
  };
}

/** @deprecated Prefer resolveThemeColors(scheme) via useTheme().colors */
export const colors = palette;
