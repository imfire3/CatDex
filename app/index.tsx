import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Gradients } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const pawRotation = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 600 }),
      withTiming(1, { duration: 300 })
    );
    pawRotation.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 400 }),
          withTiming(-15, { duration: 400 }),
          withTiming(0, { duration: 200 })
        ),
        2
      )
    );

    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const pawStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${pawRotation.value}deg` }],
  }));

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[...Gradients.sunset]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.View style={logoStyle} className="items-center">
          <Animated.Text style={pawStyle} className="text-8xl mb-4">
            🐾
          </Animated.Text>
          <Text className="text-5xl font-extrabold text-white tracking-tight">
            CatDex
          </Text>
          <Text className="text-lg text-white/80 font-medium mt-2 tracking-widest">
            DISCOVER · DOCUMENT · DELIGHT
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1200).duration(600)}
          className="absolute bottom-20"
        >
          <View className="flex-row gap-2">
            {[0, 1, 2].map((i) => (
              <PawDot key={i} delay={i * 200} />
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

function PawDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={style}
      className="w-2.5 h-2.5 rounded-full bg-white"
    />
  );
}
