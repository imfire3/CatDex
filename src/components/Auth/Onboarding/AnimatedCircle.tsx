import { useEffect } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { DEMO_CAT_IMAGE } from './demoCat';

type AnimatedCircleProps = {
  /** Accessibility label for the hero image. */
  label?: string;
  size?: number;
};

/**
 * Grand cercle immersif — photo de chat + pulse très léger.
 * Évoque le radar Pokémon GO / le focus Monument Valley.
 */
export function AnimatedCircle({
  label = 'Ton premier compagnon',
  size,
}: AnimatedCircleProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const reduceMotion = useReducedMotion();
  const diameter = size ?? spacing[96] + spacing[24];
  const photoSize = spacing[96];
  const pulse = useSharedValue(0);
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [floatY, pulse, reduceMotion]);

  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + pulse.value * 0.22,
    transform: [{ scale: 0.92 + pulse.value * 0.12 }],
  }));

  const midRingStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + pulse.value * 0.2,
    transform: [{ scale: 0.94 + pulse.value * 0.08 }],
  }));

  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{
        alignSelf: 'center',
        width: diameter,
        height: diameter,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: diameter,
            height: diameter,
            borderRadius: radius.full,
            borderWidth: 1.5,
            borderColor: colors.brand,
          },
          outerRingStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: photoSize + spacing[16],
            height: photoSize + spacing[16],
            borderRadius: radius.full,
            borderWidth: 1,
            borderColor: colors.brand,
            backgroundColor: colors.brandSoft,
          },
          midRingStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: photoSize,
            height: photoSize,
            borderRadius: radius.full,
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: colors.surfaceElevated,
            backgroundColor: colors.surfaceSecondary,
          },
          shadow.medium,
          photoStyle,
        ]}
      >
        <Image
          source={DEMO_CAT_IMAGE}
          resizeMode="cover"
          style={{ width: photoSize, height: photoSize }}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
    </View>
  );
}
