import { Platform, type ViewStyle } from 'react-native';

import type { ThemeColors } from './colors';

export type ShadowToken =
  | 'none'
  | 'soft'
  | 'card'
  | 'lifted'
  | 'sheet'
  | 'small'
  | 'medium'
  | 'large'
  | 'glow'
  | 'low'
  | 'floating';

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

const INK = '#111827';

/**
 * Soft Apple-style elevation from Figma:
 * soft · card · lifted · sheet
 * Aliases (low/medium/floating/…) kept for existing call sites.
 */
export function createShadows(colors: ThemeColors): Record<ShadowToken, ShadowStyle> {
  const ink = colors.shadowColor || INK;

  if (Platform.OS === 'web') {
    return {
      none: NONE,
      soft: {
        boxShadow: `0 4px 12px ${ink}0D, 0 1px 2px ${ink}0A`,
      },
      card: {
        boxShadow: `0 12px 24px ${ink}14, 0 2px 8px ${ink}0D`,
      },
      lifted: {
        boxShadow: `0 8px 24px ${ink}24`,
      },
      sheet: {
        boxShadow: `0 -8px 40px ${ink}29`,
      },
      small: {
        boxShadow: `0 4px 12px ${ink}0D, 0 1px 2px ${ink}0A`,
      },
      low: {
        boxShadow: `0 4px 12px ${ink}0D, 0 1px 2px ${ink}0A`,
      },
      medium: {
        boxShadow: `0 12px 24px ${ink}14, 0 2px 8px ${ink}0D`,
      },
      large: {
        boxShadow: `0 8px 24px ${ink}24`,
      },
      floating: {
        boxShadow: `0 -8px 40px ${ink}29`,
      },
      glow: { boxShadow: `0 4px 16px ${colors.accent}40` },
    };
  }

  return {
    none: NONE,
    soft: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    card: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    },
    lifted: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 6,
    },
    sheet: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.16,
      shadowRadius: 40,
      elevation: 8,
    },
    small: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    low: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    medium: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    },
    large: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 6,
    },
    floating: {
      shadowColor: ink,
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.16,
      shadowRadius: 40,
      elevation: 8,
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
  shadowColor: INK,
  accent: '#6C63FF',
} as ThemeColors);

export const accentShadow = createAccentShadow({
  shadowColor: INK,
  accent: '#6C63FF',
} as ThemeColors);
