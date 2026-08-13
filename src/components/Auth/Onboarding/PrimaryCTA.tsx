import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

type PrimaryCTAProps = {
  title: string;
  onPress: () => void;
  /** Micro-copy under the button */
  subtitle?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Optional secondary action (e.g. Plus tard) */
  secondary?: ReactNode;
};

/**
 * CTA immersif — point focal de l’écran.
 * Grand, coins pill (expérience onboarding), ombre douce, gradient violet, pulse léger.
 */
export function PrimaryCTA({
  title,
  onPress,
  subtitle = 'Première capture en moins de 2 minutes',
  disabled = false,
  loading = false,
  secondary,
}: PrimaryCTAProps) {
  const { colors, spacing, radius, shadow, motion, gradients } = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);
  const isDisabled = disabled || loading;

  useEffect(() => {
    if (reduceMotion || isDisabled) {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: motion.duration.fast });
      return undefined;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: motion.duration.reveal + motion.duration.slow }),
        withTiming(1, { duration: motion.duration.reveal + motion.duration.slow }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [isDisabled, motion.duration.fast, motion.duration.reveal, motion.duration.slow, pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handlePress = () => {
    if (isDisabled) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        {
          borderRadius: radius.full,
          overflow: 'hidden' as const,
          minHeight: spacing[56],
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
        },
        shadow.medium,
      ]}
    >
      <LinearGradient
        colors={[...gradients.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          minHeight: spacing[56],
          paddingHorizontal: spacing[32],
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.brandPressed }}
      >
        {loading ? (
          <ActivityIndicator color={colors.onAccent} />
        ) : (
          <Text variant="button" color="onAccent" align="center">
            {title}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );

  return (
    <View style={{ gap: spacing[16], alignSelf: 'stretch' }}>
      {reduceMotion ? button : <Animated.View style={pulseStyle}>{button}</Animated.View>}
      {subtitle ? (
        <Text variant="caption" color="textMuted" align="center">
          {subtitle}
        </Text>
      ) : null}
      {secondary}
    </View>
  );
}
