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
 * Soft ink-tinted elevation — borders remain the primary depth cue.
 * Prefer low / medium / floating; small / large kept as aliases.
 */
export function createShadows(colors: ThemeColors): Record<ShadowToken, ShadowStyle> {
  const ink = colors.shadowColor || '#181A25';
  const accent = colors.accent || '#6C63FF';

  if (Platform.OS === 'web') {
    return {
      none: NONE,
      small: { boxShadow: `0 2px 8px ${ink}0F` },
      low: { boxShadow: `0 2px 8px ${ink}0F` },
      medium: { boxShadow: `0 8px 24px ${ink}14` },
      large: { boxShadow: `0 8px 24px ${ink}14` },
      floating: { boxShadow: `0 8px 24px ${ink}14` },
      glow: { boxShadow: `0 10px 30px ${accent}38` },
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
      shadowRadius: 24,
      elevation: 3,
    },
    large: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    },
    floating: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
    },
    glow: {
      shadowColor: accent,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
      shadowRadius: 30,
      elevation: 4,
    },
  };
}

export function createAccentShadow(colors: ThemeColors): ShadowStyle {
  return createShadows(colors).glow;
}

export const shadow = createShadows({
  shadowColor: '#181A25',
  accent: '#6C63FF',
} as ThemeColors);

export const accentShadow = createAccentShadow({
  shadowColor: '#181A25',
  accent: '#6C63FF',
} as ThemeColors);
