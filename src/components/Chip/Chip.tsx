import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  static?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export function Chip({ label, selected, onPress, static: isStatic, disabled, icon }: ChipProps) {
  const { colors, fonts, spacing, radius, motion } = useTheme();

  const backgroundColor = selected ? colors.accentSoft : colors.surface;
  const textColor = selected ? colors.accentPressed : colors.textSecondary;
  const borderColor = selected ? colors.accent : colors.border;

  const body = (
    <View
      style={{
        backgroundColor,
        borderRadius: radius.pill,
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[8],
        borderWidth: 1,
        borderColor,
        opacity: disabled ? 0.45 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[8],
        minHeight: spacing[40],
      }}
    >
      {icon}
      <Text variant="bodySmall" style={{ fontFamily: fonts.bodySemi, color: textColor }}>
        {label}
      </Text>
    </View>
  );

  if (isStatic || !onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { transform: [{ scale: pressed ? motion.pressScale : 1 }] },
      ]}
    >
      {body}
    </Pressable>
  );
}
