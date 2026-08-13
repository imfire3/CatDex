import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type GlassIconButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  children?: React.ReactNode;
  /** Optional text label instead of icon children */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/** Shared glass circular / pill control for HUD and detail headers. */
export function GlassIconButton({
  onPress,
  accessibilityLabel,
  children,
  label,
  style,
}: GlassIconButtonProps) {
  const { colors, spacing, radius, shadow, motion } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minWidth: spacing[48],
          height: spacing[48],
          paddingHorizontal: label ? spacing[16] : 0,
          borderRadius: radius.full,
          backgroundColor: colors.glassFill,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        },
        shadow.small,
        style,
      ]}
    >
      {label ? (
        <Text variant="caption" weight="semibold" style={{ color: colors.text }}>
          {label}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
