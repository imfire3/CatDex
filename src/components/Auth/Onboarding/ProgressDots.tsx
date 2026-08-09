import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

type ProgressDotsProps = {
  /** 0-based current step */
  step: number;
  total?: number;
  labels?: string[];
};

/**
 * Indicateur de progression minimal — dots animés, style Arc / Linear.
 * Remplace le stepper verbeux « Étape 1 / 2 ».
 */
export function ProgressDots({
  step,
  total = 2,
  labels,
}: ProgressDotsProps) {
  const { colors, spacing, radius, motion } = useTheme();
  const clamped = Math.max(0, Math.min(total - 1, step));
  const label = labels?.[clamped];

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={
        label
          ? `Étape ${clamped + 1} sur ${total} : ${label}`
          : `Étape ${clamped + 1} sur ${total}`
      }
      accessibilityValue={{ min: 1, max: total, now: clamped + 1 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[8],
        paddingVertical: spacing[4],
      }}
    >
      {Array.from({ length: total }, (_, index) => (
        <ProgressDot
          key={index}
          active={index === clamped}
          completed={index < clamped}
          colors={colors}
          spacing={spacing}
          radius={radius}
          motion={motion}
        />
      ))}
    </View>
  );
}

function ProgressDot({
  active,
  completed,
  colors,
  spacing,
  radius,
  motion,
}: {
  active: boolean;
  completed: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  radius: ReturnType<typeof useTheme>['radius'];
  motion: ReturnType<typeof useTheme>['motion'];
}) {
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(active ? spacing[24] : spacing[8]);

  useEffect(() => {
    if (reduceMotion) {
      width.value = active ? spacing[24] : spacing[8];
      return;
    }
    width.value = withSpring(active ? spacing[24] : spacing[8], motion.easing.standard);
  }, [active, motion.easing.standard, reduceMotion, spacing, width]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
  }));

  return (
    <Animated.View
      style={[
        {
          height: spacing[8],
          borderRadius: radius.full,
          backgroundColor: active || completed ? colors.brand : colors.border,
          opacity: completed && !active ? 0.55 : 1,
        },
        style,
      ]}
    />
  );
}
