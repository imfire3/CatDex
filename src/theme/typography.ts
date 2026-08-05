import { Platform, type TextStyle } from 'react-native';

/**
 * Typography — Inter (Figma Cat-DEX-UI).
 * Display / Heading / Title / Body / Caption / Button / Label
 */

const inter = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontFamilies = {
  display: inter.bold,
  displaySemi: inter.semi,
  body: inter.regular,
  bodyMedium: inter.medium,
  bodySemi: inter.semi,
  bodyBold: inter.bold,
  bodyBlack: inter.bold,
  button: inter.semi,
  label: inter.semi,
} as const;

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

export type TypographyStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight?: TextStyle['fontWeight'];
  textTransform?: 'none' | 'uppercase';
};

/** Letter-spacing from Figma % tracking → px (size * percent / 100) */
export const typography: Record<TextVariant, TypographyStyle> = {
  /** Display — Inter Bold · 34 / 40 · -2% */
  display: {
    fontFamily: fontFamilies.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.68,
    fontWeight: Platform.OS === 'ios' ? '700' : undefined,
  },
  /** Heading — Inter Bold · 28 / 34 · -2% */
  h1: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
    fontWeight: Platform.OS === 'ios' ? '700' : undefined,
  },
  /** Title — Inter Semibold · 20 / 26 */
  h2: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
  },
  /** Title (compact screens) */
  h3: {
    fontFamily: fontFamilies.bodySemi,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
  },
  /** Body — Inter Regular · 16 / 24 */
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? '400' : undefined,
  },
  /** Caption — Inter Regular · 13 / 18 */
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? '400' : undefined,
  },
  /** Caption — Inter Regular · 13 / 18 */
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? '400' : undefined,
  },
  /** Label — Inter Semibold · 12 / 16 · +2% */
  label: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.24,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
  },
  /** Button — Inter Semibold · 15 / 22 */
  button: {
    fontFamily: fontFamilies.button,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? '600' : undefined,
  },
};
