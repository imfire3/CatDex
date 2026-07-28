/**
 * Typography tokens — Syne (brand/display) + Manrope (UI).
 */

export const fontFamilies = {
  display: 'Syne_700Bold',
  displaySemi: 'Syne_600SemiBold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

export type TypographyStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'none' | 'uppercase';
};

export const typography: Record<TextVariant, TypographyStyle> = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1,
  },
  h1: {
    fontFamily: fontFamilies.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  h2: {
    fontFamily: fontFamilies.displaySemi,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  h3: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
};
