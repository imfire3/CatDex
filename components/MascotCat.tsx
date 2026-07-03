import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Shadows } from '@/constants/theme';

interface MascotCatProps {
  size?: number;
  message?: string;
  animate?: boolean;
}

export function MascotCat({ size = 120, message, animate = true }: MascotCatProps) {
  const bounce = useSharedValue(0);
  const whiskerWiggle = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1200 }),
        withTiming(0, { duration: 1200 })
      ),
      -1
    );
    whiskerWiggle.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(3, { duration: 200 })),
        withTiming(-3, { duration: 400 }),
        withTiming(0, { duration: 200 })
      ),
      -1
    );
  }, [animate]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(600)} className="items-center">
      <Animated.View
        style={[bodyStyle, Shadows.glow, { width: size, height: size }]}
        className="rounded-full bg-white items-center justify-center border-4 border-coral-200"
      >
        <Text style={{ fontSize: size * 0.55 }}>🐱</Text>
        <View className="absolute -bottom-1 flex-row gap-6">
          <Text style={{ fontSize: size * 0.08 }}>〰️</Text>
          <Text style={{ fontSize: size * 0.08 }}>〰️</Text>
        </View>
      </Animated.View>
      {message && (
        <View
          style={Shadows.soft}
          className="bg-white rounded-3xl px-6 py-4 mt-6 max-w-xs"
        >
          <View className="absolute -top-2 left-1/2 w-4 h-4 bg-white rotate-45 -ml-2" />
          <Text className="text-base text-slate-700 text-center leading-6 font-medium">
            {message}
          </Text>
          <Text className="text-xs text-coral-500 font-bold text-center mt-2">
            — Moustache
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
