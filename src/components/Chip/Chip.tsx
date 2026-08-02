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

/** Filter chip — selected uses primary CTA colors (solid accent + white label). */
export function Chip({ label, selected, onPress, static: isStatic, disabled, icon }: ChipProps) {
  const { colors, fonts, spacing, radius, motion } = useTheme();

  const backgroundColor = selected ? colors.accent : colors.surface;
  const borderColor = selected ? colors.accent : colors.borderDefault;

  const body = (
    <View
      style={{
        backgroundColor,
        borderRadius: radius[8],
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[8],
        borderWidth: 1,
        borderColor,
        opacity: disabled ? 0.45 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[8],
        minHeight: 40,
      }}
    >
      {icon}
      <Text
        variant="bodySmall"
        color={selected ? 'onAccent' : 'textSecondary'}
        style={{ fontFamily: fonts.bodySemi }}
      >
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
        {
          transform: [{ scale: pressed && !disabled ? motion.pressScale : 1 }],
          opacity: pressed && !disabled ? 0.92 : 1,
        },
      ]}
    >
      {body}
    </Pressable>
  );
}
