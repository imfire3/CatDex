import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ label, value, hint, style }: StatCardProps) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
      style={[
        {
          flex: 1,
          minWidth: '40%',
          padding: spacing[16],
          borderRadius: radius.xl,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          gap: spacing[4],
        },
        shadow.small,
        style,
      ]}
    >
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      <Text variant="h3" style={{ fontFamily: fonts.bodySemi }} numberOfLines={2}>
        {value}
      </Text>
      {hint ? (
        <Text variant="caption" color="textSecondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
