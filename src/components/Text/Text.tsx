import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { TextVariant } from '@/theme/typography';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?:
    | 'text'
    | 'textBrand'
    | 'textBody'
    | 'textSecondary'
    | 'textMuted'
    | 'placeholder'
    | 'accent'
    | 'primary'
    | 'brand'
    | 'mint'
    | 'yellow'
    | 'success'
    | 'warning'
    | 'danger'
    | 'rare'
    | 'legendary'
    | 'onAccent'
    | 'onPrimary';
  align?: TextStyle['textAlign'];
};

export function Text({
  variant = 'body',
  color = 'text',
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();
  const token = typography[variant];
  const defaultColor =
    color === 'text' && (variant === 'body' || variant === 'bodySmall')
      ? colors.textBody
      : undefined;
  const colorMap: Record<NonNullable<TextProps['color']>, string> = {
    text: colors.text,
    textBrand: colors.textBrand,
    textBody: colors.textBody,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    placeholder: colors.placeholder,
    accent: colors.accent,
    primary: colors.primary,
    brand: colors.brand,
    mint: colors.mint,
    yellow: colors.yellow,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    rare: colors.rare,
    legendary: colors.legendary,
    onAccent: colors.onAccent,
    onPrimary: colors.onPrimary,
  };

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing,
          fontWeight: token.fontWeight,
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
