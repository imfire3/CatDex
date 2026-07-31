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
 * Soft navy-tinted elevation — borders remain primary depth cue.
 * Prefer elevation.low/medium/floating; small/medium/large kept as aliases.
 */
export function createShadows(colors: ThemeColors): Record<ShadowToken, ShadowStyle> {
  const ink = colors.shadowColor || '#11145A';

  if (Platform.OS === 'web') {
    return {
      none: NONE,
      small: { boxShadow: `0 1px 3px ${ink}14` },
      low: { boxShadow: `0 1px 3px ${ink}14` },
      medium: { boxShadow: `0 4px 12px ${ink}16` },
      large: { boxShadow: `0 8px 24px ${ink}18` },
      floating: { boxShadow: `0 8px 24px ${ink}18` },
      glow: { boxShadow: `0 4px 16px ${colors.accent}40` },
    };
  }

  return {
    none: NONE,
    small: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    low: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    medium: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
    large: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    },
    floating: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    },
    glow: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 4,
    },
  };
}

export function createAccentShadow(colors: ThemeColors): ShadowStyle {
  return createShadows(colors).glow;
}

export const shadow = createShadows({
  shadowColor: '#11145A',
  accent: '#2EC9C3',
} as ThemeColors);

export const accentShadow = createAccentShadow({
  shadowColor: '#11145A',
  accent: '#2EC9C3',
} as ThemeColors);
