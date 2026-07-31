import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'accent' | 'custom';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  /** Dominant card color — badge uses a darker shade of the same hue */
  color?: string;
  backgroundColor?: string;
};

/**
 * Small pill badges — height 24, radius full, paddingH 8 (8pt grid).
 */
export function Badge({ label, variant = 'default', color, backgroundColor }: BadgeProps) {
  const { colors, spacing, radius, fonts } = useTheme();

  const resolvedBg =
    backgroundColor ??
    (variant === 'success'
      ? colors.mintSoft
      : variant === 'warning'
        ? colors.yellowSoft
        : variant === 'accent'
          ? colors.accentSoft
          : colors.primarySoft);

  const resolvedColor =
    color ??
    (variant === 'success'
      ? colors.mint
      : variant === 'warning'
        ? colors.yellow
        : variant === 'accent'
          ? colors.accent
          : colors.textBody);

  return (
    <View
      accessibilityRole="text"
      style={{
        alignSelf: 'flex-start',
        height: spacing[24],
        backgroundColor: resolvedBg,
        borderRadius: radius.full,
        paddingHorizontal: spacing[8],
        justifyContent: 'center',
      }}
    >
      <Text
        variant="caption"
        style={{ fontFamily: fonts.bodySemi, color: resolvedColor, lineHeight: 16 }}
      >
        {label}
      </Text>
    </View>
  );
}
