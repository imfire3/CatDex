import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'accent';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { colors, spacing, radius } = useTheme();

  const backgroundColor =
    variant === 'success'
      ? colors.success
      : variant === 'warning'
        ? colors.warning
        : variant === 'accent'
          ? colors.accent
          : colors.surfaceSecondary;

  const color =
    variant === 'default' ? ('text' as const) : ('onAccent' as const);

  return (
    <View
      accessibilityRole="text"
      style={{
        alignSelf: 'flex-start',
        backgroundColor,
        borderRadius: radius.full,
        paddingHorizontal: spacing[8],
        paddingVertical: spacing[4],
      }}
    >
      <Text variant="caption" color={color} style={{ fontFamily: 'Manrope_600SemiBold' }}>
        {label}
      </Text>
    </View>
  );
}
