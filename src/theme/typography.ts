import type { TextStyle } from 'react-native';

/**
 * CatDex Typography System — Kind Sans (single family).
 *
 * Canonical roles: display · headline · title · body · bodySmall ·
 * label · button · link · caption
 *
 * Legacy aliases h1/h2/h3 remain for gradual migration (Phase 5).
 */

export const KIND_SANS = {
  regular: 'KindSans-Regular',
  medium: 'KindSans-Medium',
  semibold: 'KindSans-SemiBold',
  bold: 'KindSans-Bold',
} as const;

/** Loaded via expo-font in app/_layout.tsx */
export const kindSansFontMap = {
  [KIND_SANS.regular]: require('../../assets/fonts/kindsans-regular.ttf'),
  [KIND_SANS.medium]: require('../../assets/fonts/kindsans-medium.ttf'),
  [KIND_SANS.semibold]: require('../../assets/fonts/kindsans-semibold.ttf'),
  [KIND_SANS.bold]: require('../../assets/fonts/kindsans-bold.ttf'),
} as const;

/**
 * Named faces used across the app.
 * Prefer Text `variant` over picking these manually.
 */
export const fontFamilies = {
  /** Titles / hero emphasis — Semibold (600) */
  display: KIND_SANS.semibold,
  displaySemi: KIND_SANS.semibold,
  /** Body regular (400) */
  body: KIND_SANS.regular,
  /** Medium (500) — links, light emphasis */
  bodyMedium: KIND_SANS.medium,
  /** Semibold (600) — buttons, labels, section emphasis */
  bodySemi: KIND_SANS.semibold,
  /** Bold (700) — rare true emphasis */
  bodyBold: KIND_SANS.bold,
  /**
   * @deprecated Prefer bodyBold. Black/ExtraBold removed — maps to Bold.
   */
  bodyBlack: KIND_SANS.bold,
} as const;

export type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'button'
  | 'link'
  | 'caption'
  /** @deprecated Use `headline` */
  | 'h1'
  /** @deprecated Use `title` */
  | 'h2'
  /** @deprecated Migrate to `title` or `bodySmall` — kept until Phase 5 */
  | 'h3';

export type TypographyStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight?: TextStyle['fontWeight'];
  textTransform?: 'none' | 'uppercase';
};

const displayStyle: TypographyStyle = {
  fontFamily: KIND_SANS.semibold,
  fontSize: 48,
  lineHeight: 56,
  letterSpacing: -1,
};

const headlineStyle: TypographyStyle = {
  fontFamily: KIND_SANS.semibold,
  fontSize: 32,
  lineHeight: 40,
  letterSpacing: -0.5,
};

const titleStyle: TypographyStyle = {
  fontFamily: KIND_SANS.semibold,
  fontSize: 24,
  lineHeight: 32,
  letterSpacing: -0.25,
};

const bodyStyle: TypographyStyle = {
  fontFamily: KIND_SANS.regular,
  fontSize: 16,
  lineHeight: 24,
  letterSpacing: 0,
};

const bodySmallStyle: TypographyStyle = {
  fontFamily: KIND_SANS.regular,
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0,
};

const labelStyle: TypographyStyle = {
  fontFamily: KIND_SANS.semibold,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
};

const buttonStyle: TypographyStyle = {
  fontFamily: KIND_SANS.semibold,
  fontSize: 16,
  lineHeight: 24,
  letterSpacing: 0,
};

const linkStyle: TypographyStyle = {
  fontFamily: KIND_SANS.medium,
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0,
};

const captionStyle: TypographyStyle = {
  fontFamily: KIND_SANS.regular,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 0,
};

/**
 * @deprecated Temporary 20px level until screens migrate off `h3`.
 * Prefer `title` (24) or `bodySmall` (14).
 */
const h3LegacyStyle: TypographyStyle = {
  fontFamily: KIND_SANS.semibold,
  fontSize: 20,
  lineHeight: 28,
  letterSpacing: -0.2,
};

export const typography: Record<TextVariant, TypographyStyle> = {
  display: displayStyle,
  headline: headlineStyle,
  title: titleStyle,
  body: bodyStyle,
  bodySmall: bodySmallStyle,
  label: labelStyle,
  button: buttonStyle,
  link: linkStyle,
  caption: captionStyle,
  h1: headlineStyle,
  h2: titleStyle,
  h3: h3LegacyStyle,
};

/** Canonical scale (no legacy aliases) — for docs / ThemeLab */
export const typographyScale = {
  display: displayStyle,
  headline: headlineStyle,
  title: titleStyle,
  body: bodyStyle,
  bodySmall: bodySmallStyle,
  label: labelStyle,
  button: buttonStyle,
  link: linkStyle,
  caption: captionStyle,
} as const;

export type TypographyScaleKey = keyof typeof typographyScale;

export type FontWeightToken = 'regular' | 'medium' | 'semibold' | 'bold';

export const fontWeightFamilies: Record<FontWeightToken, string> = {
  regular: KIND_SANS.regular,
  medium: KIND_SANS.medium,
  semibold: KIND_SANS.semibold,
  bold: KIND_SANS.bold,
};

/** Default weight implied by a text variant (via Kind Sans face). */
export function defaultWeightForVariant(variant: TextVariant): FontWeightToken {
  switch (variant) {
    case 'link':
      return 'medium';
    case 'body':
    case 'bodySmall':
    case 'caption':
      return 'regular';
    default:
      return 'semibold';
  }
}
