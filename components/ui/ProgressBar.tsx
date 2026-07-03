import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = '#FF6B4A',
  height = 8,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View>
      {showLabel && label && (
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm font-semibold text-slate-600">{label}</Text>
          <Text className="text-sm font-bold text-coral-500">{Math.round(percentage)}%</Text>
        </View>
      )}
      <View
        className="bg-slate-100 rounded-full overflow-hidden"
        style={{ height }}
      >
        <View
          className="rounded-full h-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  color?: string;
}

export function StatBar({ label, value, color = '#FF6B4A' }: StatBarProps) {
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-sm font-semibold text-slate-600">{label}</Text>
        <Text className="text-sm font-bold text-slate-850">{value}</Text>
      </View>
      <ProgressBar value={value} color={color} height={6} />
    </View>
  );
}

interface XpBarProps {
  current: number;
  max: number;
  level: number;
}

export function XpBar({ current, max, level }: XpBarProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="bg-coral-500 px-3 py-1 rounded-full">
            <Text className="text-white font-bold text-sm">Lv. {level}</Text>
          </View>
          <Text className="text-sm font-semibold text-slate-500">
            {current.toLocaleString()} / {max.toLocaleString()} XP
          </Text>
        </View>
      </View>
      <ProgressBar value={current} max={max} color="#FF6B4A" height={10} />
    </View>
  );
}

interface PulsingDotProps {
  color?: string;
  size?: number;
}

export function PulsingDot({ color = '#10B981', size = 10 }: PulsingDotProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center" style={{ width: size * 2, height: size * 2 }}>
      <Animated.View
        style={[
          style,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

interface LoadingDotsProps {
  color?: string;
}

export function LoadingDots({ color = '#FF6B4A' }: LoadingDotsProps) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animate = (sv: { value: number }, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-8, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1
        )
      );
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  const style1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  const dotStyle = { width: 10, height: 10, borderRadius: 5, backgroundColor: color };

  return (
    <View className="flex-row items-center gap-2">
      <Animated.View style={[style1, dotStyle]} />
      <Animated.View style={[style2, dotStyle]} />
      <Animated.View style={[style3, dotStyle]} />
    </View>
  );
}
