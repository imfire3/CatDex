import React, { createContext, useContext, useMemo } from 'react';

import { resolveThemeColors, type ColorScheme, type ThemeColors } from './colors';
import { gradients } from './gradients';
import { iconSize, iconStroke } from './icons';
import { motion } from './motion';
import { opacity } from './opacity';
import { radius } from './radius';
import { createAccentShadow, createShadows } from './shadow';
import { spacing } from './spacing';
import { fontFamilies, typography } from './typography';

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fonts: typeof fontFamilies;
  shadow: ReturnType<typeof createShadows>;
  accentShadow: ReturnType<typeof createAccentShadow>;
  motion: typeof motion;
  opacity: typeof opacity;
  iconSize: typeof iconSize;
  iconStroke: typeof iconStroke;
  gradients: typeof gradients;
  /** @deprecated use radius */
  radii: typeof radius;
};

export const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme: ColorScheme = 'light';

  const value = useMemo<Theme>(() => {
    const colors = resolveThemeColors(scheme);
    return {
      scheme,
      colors,
      spacing,
      radius,
      typography,
      fonts: fontFamilies,
      shadow: createShadows(colors),
      accentShadow: createAccentShadow(colors),
      motion,
      opacity,
      iconSize,
      iconStroke,
      gradients,
      radii: radius,
    };
  }, [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
}
