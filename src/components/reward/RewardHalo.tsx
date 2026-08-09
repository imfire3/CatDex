import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  size: number;
  color?: string;
};

/** Soft brand halo behind reveal cards / photos. */
export function RewardHalo({ size, color }: Props) {
  const { colors, radius, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const glow = useSharedValue(0.55);

  useEffect(() => {
    if (reduceMotion) return;
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: motion.duration.reveal * 2 }),
        withTiming(0.45, { duration: motion.duration.reveal * 2 }),
      ),
      -1,
      false,
    );
  }, [glow, motion.duration.reveal, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.2 + glow.value * 0.45,
    transform: [{ scale: 0.88 + glow.value * 0.18 }],
  }));

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius.full,
            backgroundColor: color ?? colors.brandSoft,
          },
          style,
        ]}
      />
    </View>
  );
}
