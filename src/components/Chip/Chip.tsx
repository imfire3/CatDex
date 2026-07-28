import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Static chips are not pressable */
  static?: boolean;
  disabled?: boolean;
};

export function Chip({ label, selected, onPress, static: isStatic, disabled }: ChipProps) {
  const { colors, spacing, radius } = useTheme();

  const backgroundColor = selected ? colors.accent : colors.surfaceSecondary;
  const textColor = selected ? ('onAccent' as const) : ('text' as const);

  const body = (
    <View
      style={{
        backgroundColor,
        borderRadius: radius.full,
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[8],
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.border,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Text variant="bodySmall" color={textColor} style={{ fontFamily: 'Manrope_600SemiBold' }}>
        {label}
      </Text>
    </View>
  );

  if (isStatic || !onPress) {
    return body;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
    >
      {body}
    </Pressable>
  );
}
