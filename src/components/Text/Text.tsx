import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import {
  defaultWeightForVariant,
  fontWeightFamilies,
  type FontWeightToken,
  type TextVariant,
} from '@/theme/typography';

export type TextColor =
  | 'text'
  | 'textPrimary'
  | 'textBrand'
  | 'textBody'
  | 'textSecondary'
  | 'textMuted'
  | 'textDisabled'
  | 'textInverse'
  | 'placeholder'
  | 'accent'
  | 'primary'
  | 'brand'
  | 'mint'
  | 'yellow'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onAccent'
  | 'onPrimary'
  | 'onBrand';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** Override Kind Sans face when it differs from the variant default. */
  weight?: FontWeightToken;
  color?: TextColor;
  align?: TextStyle['textAlign'];
};

/**
 * CatDex text — always prefer `variant` (+ optional `weight`) over local fontSize / fontFamily.
 * Color is independent of variant.
 */
export function Text({
  variant = 'body',
  weight,
  color = 'text',
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();
  const token = typography[variant];
  const resolvedWeight = weight ?? defaultWeightForVariant(variant);
  const fontFamily = fontWeightFamilies[resolvedWeight];

  const readingVariants: TextVariant[] = ['body', 'bodySmall', 'caption', 'link'];
  const defaultColor =
    color === 'text' && readingVariants.includes(variant) ? colors.textBody : undefined;

  const colorMap: Record<TextColor, string> = {
    text: colors.text,
    textPrimary: colors.text,
    textBrand: colors.textBrand,
    textBody: colors.textBody,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    textDisabled: colors.textDisabled,
    textInverse: colors.textInverse,
    placeholder: colors.placeholder,
    accent: colors.accent,
    primary: colors.primary,
    brand: colors.brand,
    mint: colors.mint,
    yellow: colors.yellow,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    onAccent: colors.onAccent,
    onPrimary: colors.onPrimary,
    onBrand: colors.onBrand,
  };

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing,
          textTransform: token.textTransform,
          color: defaultColor ?? colorMap[color],
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
