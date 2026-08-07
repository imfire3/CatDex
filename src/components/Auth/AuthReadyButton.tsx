import { useEffect } from 'react';
import { type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/Button';

type AuthReadyButtonProps = {
  title: string;
  /** 0 → 1 form completion (progressive activation). */
  progress: number;
  /** Fully valid — enables pulse. */
  ready: boolean;
  loading?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Primary auth CTA: stays primary (disabled until valid), pulses when ready.
 */
export function AuthReadyButton({
  title,
  progress,
  ready,
  loading = false,
  onPress,
  style,
}: AuthReadyButtonProps) {
  const progressSv = useSharedValue(Math.min(1, Math.max(0, progress)));
  const pulse = useSharedValue(1);
  const isDisabled = !ready || loading;

  useEffect(() => {
    progressSv.value = withSpring(Math.min(1, Math.max(0, progress)), {
      damping: 18,
      stiffness: 160,
    });
  }, [progress, progressSv]);

  useEffect(() => {
    if (ready && !loading) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      return () => cancelAnimation(pulse);
    }
    cancelAnimation(pulse);
    pulse.value = withTiming(1, { duration: 180 });
    return undefined;
  }, [ready, loading, pulse]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progressSv.value, [0, 0.35, 1], [0.92, 0.96, 1]),
    transform: [
      {
        scale: interpolate(progressSv.value, [0, 1], [0.99, 1]) * pulse.value,
      },
    ],
  }));

  return (
    <Animated.View style={[wrapStyle, style]}>
      <Button
        title={title}
        variant="primary"
        loading={loading}
        disabled={isDisabled}
        onPress={onPress}
      />
    </Animated.View>
  );
}
