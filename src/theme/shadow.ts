import { Platform, type ViewStyle } from 'react-native';

import type { ThemeColors } from './colors';

export type ShadowToken = 'small' | 'medium' | 'large' | 'glow';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation' | 'boxShadow'
>;

/** Soft depth — never flat. Glow reserved for Scanner FAB. */
export function createShadows(colors: ThemeColors): Record<ShadowToken, ShadowStyle> {
  if (Platform.OS === 'web') {
    return {
      small: { boxShadow: `0 4px 16px ${colors.shadowColor}55` },
      medium: { boxShadow: `0 8px 28px ${colors.shadowColor}66` },
      large: { boxShadow: `0 16px 40px ${colors.shadowColor}77` },
      glow: { boxShadow: `0 0 28px ${colors.gradientStart}88, 0 8px 24px ${colors.shadowColor}66` },
    };
  }

  return {
    small: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 4,
    },
    medium: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 20,
      elevation: 8,
    },
    large: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.55,
      shadowRadius: 28,
      elevation: 12,
    },
    glow: {
      shadowColor: colors.gradientStart,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 20,
      elevation: 14,
    },
  };
}

export function createAccentShadow(colors: ThemeColors): ShadowStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: `0 0 32px ${colors.gradientStart}99, 0 10px 28px ${colors.shadowColor}66` };
  }
  return {
    shadowColor: colors.gradientStart,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 22,
    elevation: 14,
  };
}

export const shadow = createShadows({
  shadowColor: '#000000',
  gradientStart: '#6E87FF',
  accent: '#6E87FF',
} as ThemeColors);

export const accentShadow = createAccentShadow({
  gradientStart: '#6E87FF',
  accent: '#6E87FF',
} as ThemeColors);
