import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type FloatingActionButtonProps = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FloatingActionButton({
  onPress,
  label = 'Scanner',
  accessibilityLabel,
  disabled,
  icon,
  style,
}: FloatingActionButtonProps) {
  const { colors, spacing, radius, accentShadow, iconStroke } = useTheme();

  return (
    <View style={[styles.wrap, style]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.accent,
            borderRadius: radius.full,
            width: spacing[64],
            height: spacing[64],
            opacity: disabled ? 0.45 : 1,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
          accentShadow,
        ]}
      >
        {icon ?? (
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="12"
              cy="12"
              r="3.2"
              stroke={colors.onAccent}
              strokeWidth={iconStroke.regular}
            />
            <Path
              d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
              stroke={colors.onAccent}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
            />
          </Svg>
        )}
      </Pressable>
      {label ? (
        <Text variant="caption" color="textSecondary" style={{ marginTop: spacing[4] }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
