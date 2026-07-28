import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { resolveThemeColors, type ColorScheme, type ThemeColors } from './colors';
import { iconSize, iconStroke } from './icons';
import { motion } from './motion';
import { radius } from './radius';
import { accentShadow, shadow } from './shadow';
import { spacing } from './spacing';
import { fontFamilies, typography } from './typography';

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fonts: typeof fontFamilies;
  shadow: typeof shadow;
  accentShadow: typeof accentShadow;
  motion: typeof motion;
  iconSize: typeof iconSize;
  iconStroke: typeof iconStroke;
  /** @deprecated use radius — kept for Phase 0 screen compatibility */
  radii: typeof radius;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const scheme: ColorScheme = system === 'dark' ? 'dark' : 'light';

  const value = useMemo<Theme>(
    () => ({
      scheme,
      colors: resolveThemeColors(scheme),
      spacing,
      radius,
      typography,
      fonts: fontFamilies,
      shadow,
      accentShadow,
      motion,
      iconSize,
      iconStroke,
      radii: radius,
    }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
}
