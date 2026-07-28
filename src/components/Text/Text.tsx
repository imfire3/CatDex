import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { TextVariant } from '@/theme/typography';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: 'text' | 'textSecondary' | 'accent' | 'success' | 'warning' | 'danger' | 'onAccent';
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

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing,
          textTransform: token.textTransform,
          color: colors[color === 'text' ? 'text' : color === 'textSecondary' ? 'textSecondary' : color],
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
