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

/** Filter chip — pill shape; selected = solid primary + white label (Figma). */
export function Chip({ label, selected, onPress, static: isStatic, disabled, icon }: ChipProps) {
  const { colors, spacing, radius, motion, shadow } = useTheme();

  const backgroundColor = selected ? colors.primary : colors.background;
  const borderColor = selected ? colors.primary : colors.border;

  const body = (
    <View
      style={[
        {
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
          minHeight: 36,
        },
        selected ? shadow.soft : null,
      ]}
    >
      {icon}
      <Text variant="button" color={selected ? 'onPrimary' : 'textSecondary'}>
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
