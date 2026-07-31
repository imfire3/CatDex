import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type FloatingActionButtonProps = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  embedded?: boolean;
};

/** Center Capture FAB — Pokémon GO style lift + turquoise glow */
export function FloatingActionButton({
  onPress,
  label,
  accessibilityLabel = 'Capture',
  disabled,
  icon,
  style,
  embedded = true,
}: FloatingActionButtonProps) {
  const { colors, spacing, radius, iconStroke, iconSize, gradients, motion, shadow } =
    useTheme();
  const size = spacing[64] + spacing[8];

  return (
    <View
      style={[styles.wrap, embedded && { width: size + spacing[24] }, style]}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          {
            width: size,
            height: size,
            borderRadius: radius.full,
            opacity: disabled ? 0.45 : 1,
            transform: [
              { scale: pressed ? motion.pressScale : 1 },
              { translateY: embedded ? -spacing[24] : 0 },
            ],
            overflow: 'hidden',
            borderWidth: 4,
            borderColor: colors.background,
            backgroundColor: pressed ? colors.accentPressed : colors.accent,
          },
          shadow.glow,
        ]}
      >
        <LinearGradient
          colors={[gradients.primary[0], gradients.primary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {icon ?? (
            <Svg width={iconSize.lg} height={iconSize.lg} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
                stroke={colors.onAccent}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
              <Path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke={colors.onAccent}
                strokeWidth={iconStroke.regular}
              />
            </Svg>
          )}
        </LinearGradient>
      </Pressable>
      {label && !embedded ? (
        <Text variant="tiny" color="textSecondary" style={{ marginTop: spacing[4] }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
