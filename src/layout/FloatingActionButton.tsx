import { useEffect } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export const CAPTURE_FAB_OUTER_SIZE = 96;
const CAPTURE_FAB_CORE_SIZE = 64;

export type FloatingActionButtonProps = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  embedded?: boolean;
  /** Stronger pulse when a cat is nearby. */
  proximityActive?: boolean;
};

function ViewfinderIcon({ color, size }: { color: string; size: number }) {
  const { iconStroke } = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="12" r="2.75" stroke={color} strokeWidth={iconStroke.regular} />
    </Svg>
  );
}

/** Capture FAB — purple core, white ring, breathing halo. */
export function FloatingActionButton({
  onPress,
  label,
  accessibilityLabel = 'Scanner',
  disabled,
  icon,
  style,
  embedded = true,
  proximityActive = false,
}: FloatingActionButtonProps) {
  const { colors, spacing, radius, iconSize, motion } = useTheme();
  const pulse = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: proximityActive ? 900 : 1400,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    breathe.value = withRepeat(
      withTiming(proximityActive ? 1.08 : 1.04, {
        duration: proximityActive ? 700 : 1200,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [breathe, proximityActive, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: proximityActive ? 0.55 + pulse.value * 0.35 : 0.35 + pulse.value * 0.25,
    transform: [{ scale: (proximityActive ? 0.92 : 0.96) + pulse.value * 0.14 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <View
      style={[styles.wrap, embedded && { width: CAPTURE_FAB_OUTER_SIZE }, style]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.halo,
          {
            width: CAPTURE_FAB_OUTER_SIZE,
            height: CAPTURE_FAB_OUTER_SIZE,
            borderRadius: radius.full,
            backgroundColor: proximityActive ? colors.brand : colors.captureFabHalo,
          },
          haloStyle,
        ]}
      >
        <View
          style={{
            width: CAPTURE_FAB_CORE_SIZE,
            height: CAPTURE_FAB_CORE_SIZE,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
              {
                opacity: disabled ? 0.45 : 1,
                transform: [{ scale: pressed ? motion.pressScale : 1 }],
              },
            ]}
          >
            <Animated.View
              style={[
                {
                  width: CAPTURE_FAB_CORE_SIZE,
                  height: CAPTURE_FAB_CORE_SIZE,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.brand,
                },
                coreStyle,
              ]}
            >
              {icon ?? <ViewfinderIcon color={colors.onBrand} size={iconSize.md} />}
            </Animated.View>
          </Pressable>
        </View>
      </Animated.View>
      {label && !embedded ? (
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
    justifyContent: 'center',
  },
  halo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
