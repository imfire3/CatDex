import { Platform, type TextStyle } from 'react-native';

/**
 * Typography — SF Pro on iOS, Syne (display) + Manrope (body) elsewhere.
 * Marked hierarchy for premium game feel.
 */

const iosDisplay = 'System';
const iosBody = 'System';

export const fontFamilies = {
  display: Platform.OS === 'ios' ? iosDisplay : 'Syne_700Bold',
  displaySemi: Platform.OS === 'ios' ? iosDisplay : 'Syne_600SemiBold',
  body: Platform.OS === 'ios' ? iosBody : 'Manrope_500Medium',
  bodyMedium: Platform.OS === 'ios' ? iosBody : 'Manrope_600SemiBold',
  bodySemi: Platform.OS === 'ios' ? iosBody : 'Manrope_700Bold',
  bodyBold: Platform.OS === 'ios' ? iosBody : 'Manrope_700Bold',
  bodyBlack: Platform.OS === 'ios' ? iosBody : 'Manrope_800ExtraBold',
} as const;

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'tiny'
  | 'label';

export type TypographyStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight?: TextStyle['fontWeight'];
  textTransform?: 'none' | 'uppercase';
};

export const typography: Record<TextVariant, TypographyStyle> = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -1.2,
    fontWeight: Platform.OS === 'ios' ? '800' : undefined,
  },
  h1: {
    fontFamily: fontFamilies.bodyBlack,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -1.0,
    fontWeight: Platform.OS === 'ios' ? '700' : undefined,
  },
  h2: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
  },
  h3: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
  },
  title: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.1,
    fontWeight: Platform.OS === 'ios' ? '400' : undefined,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? '400' : undefined,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: Platform.OS === 'ios' ? '500' : undefined,
  },
  tiny: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    fontWeight: Platform.OS === 'ios' ? '500' : undefined,
  },
  label: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
    textTransform: 'uppercase',
  },
};
