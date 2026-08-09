import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { RewardHalo } from '@/components/reward/RewardHalo';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playHapticImpact, playRevealSound } from '@/lib/gameFeedback';
import { useTheme } from '@/theme/ThemeProvider';
import { useEffect, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  width: number;
  /** Border color (rarity). */
  borderColor?: string;
  /** Soft halo tint behind the card. */
  glowColor?: string;
  onFlipComplete?: () => void;
};

/** Card enter + Y-flip reveal with rarity border + halo. */
export function RewardCardFlip({
  children,
  width,
  borderColor,
  glowColor,
  onFlipComplete,
}: Props) {
  const { colors, radius, shadow, motion, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const flip = useSharedValue(reduceMotion ? 1 : 0);
  const enterY = useSharedValue(reduceMotion ? 0 : 80);
  const enterScale = useSharedValue(reduceMotion ? 1 : 0.7);

  useEffect(() => {
    void playRevealSound();
    void playHapticImpact();

    if (reduceMotion) {
      onFlipComplete?.();
      return;
    }

    enterY.value = withSpring(0, { damping: 13, stiffness: 120 });
    enterScale.value = withSpring(1, { damping: 11, stiffness: 140 });
    flip.value = withDelay(
      220,
      withSequence(
        withTiming(0.5, { duration: 220, easing: Easing.in(Easing.cubic) }),
        withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }),
      ),
    );

    const t = setTimeout(() => onFlipComplete?.(), 780);
    return () => clearTimeout(t);
  }, [enterScale, enterY, flip, onFlipComplete, reduceMotion]);

  const cardStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 0.5, 1], [-18, 90, 0]);
    return {
      transform: [
        { perspective: 900 },
        { translateY: enterY.value },
        { scale: enterScale.value },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <RewardHalo size={width + spacing[48]} color={glowColor} />
      <Animated.View
        style={[
          cardStyle,
          {
            width,
            borderRadius: radius.cta,
            overflow: 'hidden',
            backgroundColor: colors.surfaceElevated,
            borderWidth: 3,
            borderColor: borderColor ?? colors.brand,
          },
          shadow.floating,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}
