import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ label, value, hint, icon, style }: StatCardProps) {
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
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          gap: spacing[8],
        },
        shadow.low,
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
        {icon ? (
          <View
            style={{
              width: spacing[32],
              height: spacing[32],
              borderRadius: radius.sm,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
        ) : null}
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
      </View>
      <Text variant="h3" color="textBrand" style={{ fontFamily: fonts.bodySemi }} numberOfLines={2}>
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
