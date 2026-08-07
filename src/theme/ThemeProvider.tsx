import React, { createContext, useContext, useEffect, useMemo } from 'react'

import { useThemeLabStore } from '@/store/themeLab'

import { resolveThemeColors, type ColorScheme, type ThemeColors } from './colors'
import { gradients } from './gradients'
import { iconSize, iconStroke } from './icons'
import { motion } from './motion'
import { createAccentShadow, createShadows } from './shadow'
import { spacing } from './spacing'
import {
  applyBrandToColors,
  applyShapeToRadius,
  type ThemeRadius,
} from './themeOverrides'
import { fontFamilies, typography } from './typography'

export type Theme = {
  scheme: ColorScheme
  colors: ThemeColors
  spacing: typeof spacing
  radius: ThemeRadius
  typography: typeof typography
  fonts: typeof fontFamilies
  shadow: ReturnType<typeof createShadows>
  accentShadow: ReturnType<typeof createAccentShadow>
  motion: typeof motion
  iconSize: typeof iconSize
  iconStroke: typeof iconStroke
  gradients: typeof gradients
  /** @deprecated use radius */
  radii: ThemeRadius
}

export const ThemeContext = createContext<Theme | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // CatDex is white-first — single light palette
  const scheme: ColorScheme = 'light'
  const overrides = useThemeLabStore((s) => s.overrides)
  const hydrate = useThemeLabStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const value = useMemo<Theme>(() => {
    const baseColors = resolveThemeColors(scheme)
    const colors = applyBrandToColors(baseColors, overrides.brandId)
    const nextRadius = applyShapeToRadius(overrides.shape)
    return {
      scheme,
      colors,
      spacing,
      radius: nextRadius,
      typography,
      fonts: fontFamilies,
      shadow: createShadows(colors),
      accentShadow: createAccentShadow(colors),
      motion,
      iconSize,
      iconStroke,
      gradients,
      radii: nextRadius,
    }
  }, [scheme, overrides.brandId, overrides.shape])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const theme = useContext(ThemeContext)
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return theme
}
