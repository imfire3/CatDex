import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  label: string;
  value: number;
  color?: string;
};

function resolveFill(value: number, colors: { success: string; primary: string; warning: string; textSecondary: string }) {
  if (value >= 80) return colors.warning;
  if (value >= 55) return colors.success;
  if (value >= 35) return colors.primary;
  return colors.textSecondary;
}

export function StatBar({ label, value, color }: Props) {
  const { colors, fonts, spacing } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  const fill = color ?? resolveFill(clamped, colors);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[16] }}>
      <Text
        variant="bodySmall"
        color="textSecondary"
        style={{ width: spacing[64] + spacing[16], fontFamily: fonts.bodySemi }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        variant="bodySmall"
        style={{ width: spacing[32], textAlign: 'right', fontFamily: fonts.bodyBlack }}
      >
        {clamped}
      </Text>
      <View
        style={{
          flex: 1,
          height: spacing[8],
          borderRadius: spacing[4],
          backgroundColor: colors.surfaceTertiary,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped}%`,
            height: '100%',
            borderRadius: spacing[4],
            backgroundColor: fill,
          }}
        />
      </View>
    </View>
  );
}
