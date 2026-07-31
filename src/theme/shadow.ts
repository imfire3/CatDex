import { Platform, type ViewStyle } from 'react-native';

import type { ThemeColors } from './colors';

export type ShadowToken = 'none' | 'small' | 'medium' | 'large' | 'glow' | 'low' | 'floating';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation' | 'boxShadow'
>;

const NONE: ShadowStyle = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
  ...(Platform.OS === 'web' ? { boxShadow: 'none' } : null),
};

/**
 * Soft brand-tinted elevation — Apple-like, never harsh.
 */
export function createShadows(colors: ThemeColors): Record<ShadowToken, ShadowStyle> {
  const ink = colors.shadowColor || '#2D3B8F';

  if (Platform.OS === 'web') {
    return {
      none: NONE,
      small: { boxShadow: `0 2px 8px ${ink}0F` },
      low: { boxShadow: `0 2px 8px ${ink}0F` },
      medium: { boxShadow: `0 8px 24px ${ink}14` },
      large: { boxShadow: `0 16px 40px ${ink}18` },
      floating: { boxShadow: `0 16px 40px ${ink}18` },
      glow: { boxShadow: `0 8px 28px ${colors.accent}55` },
    };
  }

  return {
    none: NONE,
    small: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 1,
    },
    low: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 1,
    },
    medium: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 3,
    },
    large: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 6,
    },
    floating: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 6,
    },
    glow: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 5,
    },
  };
}

export function createAccentShadow(colors: ThemeColors): ShadowStyle {
  return createShadows(colors).glow;
}

export const shadow = createShadows({
  shadowColor: '#2D3B8F',
  accent: '#43D2C8',
} as ThemeColors);

export const accentShadow = createAccentShadow({
  shadowColor: '#2D3B8F',
  accent: '#43D2C8',
} as ThemeColors);
