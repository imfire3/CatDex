import { useEffect, type ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

type BreathingProps = {
  children: ReactNode;
  /** Peak scale delta (default 0.04). */
  amount?: number;
};

/** Soft continuous breathe — logo / halo. */
export function Breathing({ children, amount = 0.04 }: BreathingProps) {
  const { motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1 + amount, { duration: motion.duration.reveal * 2 }),
        withTiming(1, { duration: motion.duration.reveal * 2 }),
      ),
      -1,
      false,
    );
  }, [amount, motion.duration.reveal, pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

type FloatProps = {
  children: ReactNode;
  distance?: number;
};

/** Gentle vertical float for cards. */
export function Float({ children, distance = 6 }: FloatProps) {
  const { motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    y.value = withRepeat(
      withSequence(
        withTiming(-distance, { duration: motion.duration.reveal * 2.2 }),
        withTiming(0, { duration: motion.duration.reveal * 2.2 }),
      ),
      -1,
      false,
    );
  }, [distance, motion.duration.reveal, reduceMotion, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

type CascadeInProps = {
  children: ReactNode;
  index?: number;
  delayStep?: number;
};

/** Staggered fade+rise entrance. */
export function CascadeIn({ children, index = 0, delayStep = 90 }: CascadeInProps) {
  const { motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const y = useSharedValue(reduceMotion ? 0 : 16);

  useEffect(() => {
    if (reduceMotion) return;
    const delay = index * delayStep;
    opacity.value = withDelay(delay, withTiming(1, { duration: motion.duration.normal }));
    y.value = withDelay(delay, withTiming(0, { duration: motion.duration.normal }));
  }, [delayStep, index, motion.duration.normal, opacity, reduceMotion, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
