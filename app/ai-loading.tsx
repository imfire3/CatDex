import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LoadingDots } from '@/components/ui/ProgressBar';
import { Gradients } from '@/constants/theme';

const STEPS = [
  'Analyzing whisker patterns...',
  'Matching fur texture...',
  'Scanning eye color...',
  'Cross-referencing ChatDex...',
  'Identifying breed characteristics...',
];

export default function AiLoadingScreen() {
  const router = useRouter();
  const rotation = useSharedValue(0);
  const stepIndex = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1
    );

    const stepTimer = setInterval(() => {
      stepIndex.value = (stepIndex.value + 1) % STEPS.length;
    }, 800);

    const navTimer = setTimeout(() => {
      router.replace('/cat-analysis');
    }, 3500);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(navTimer);
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[...Gradients.twilight]}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.View entering={FadeIn.duration(600)} className="items-center px-8">
          <View className="relative mb-10">
            <Animated.View
              style={spinStyle}
              className="w-32 h-32 rounded-full border-4 border-white/20 border-t-white"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-5xl">🔍</Text>
            </View>
          </View>

          <Text className="text-3xl font-extrabold text-white text-center mb-2">
            Analyzing Cat
          </Text>
          <Text className="text-base text-white/70 text-center mb-8">
            Our AI is identifying this magnificent feline
          </Text>

          <LoadingDots color="#FFFFFF" />

          <Animated.View entering={FadeIn.delay(400)} className="mt-10">
            <View className="bg-white/10 rounded-2xl px-6 py-4 border border-white/20">
              <Text className="text-white/90 text-sm font-medium text-center">
                {STEPS[0]}
              </Text>
            </View>
          </Animated.View>

          <View className="flex-row gap-1 mt-8">
            {STEPS.map((_, i) => (
              <View
                key={i}
                className={`h-1 rounded-full ${i === 0 ? 'w-8 bg-white' : 'w-4 bg-white/30'}`}
              />
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
