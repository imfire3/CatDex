import { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { NEW_DISCOVERY_CAT, RARITY_COLORS } from '@/data/mock';
import { Gradients } from '@/constants/theme';

const { width } = Dimensions.get('window');

const CONFETTI = ['🎉', '⭐', '✨', '🐾', '🎊', '💫'];

export default function DiscoveryCelebrationScreen() {
  const router = useRouter();
  const cat = NEW_DISCOVERY_CAT;
  const rarity = RARITY_COLORS[cat.rarity];
  const glow = useSharedValue(1);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    glow.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
  }));

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[...Gradients.sunset]}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {CONFETTI.map((emoji, i) => (
          <Animated.Text
            key={i}
            entering={FadeIn.delay(i * 100)}
            style={{
              position: 'absolute',
              top: `${10 + (i * 13) % 70}%`,
              left: `${5 + (i * 17) % 85}%`,
              fontSize: 24 + (i % 3) * 8,
            }}
          >
            {emoji}
          </Animated.Text>
        ))}

        <Animated.View entering={FadeInDown.springify()} className="items-center px-8">
          <Text className="text-sm font-bold text-white/80 uppercase tracking-[0.2em] mb-2">
            New Discovery
          </Text>
          <Text className="text-5xl font-extrabold text-white text-center tracking-tight mb-8">
            Congratulations!
          </Text>

          <Animated.View style={glowStyle}>
            <Animated.View
              entering={ZoomIn.delay(300).springify()}
              className="w-44 h-44 rounded-full overflow-hidden border-4 border-white mb-6"
            >
              <Image
                source={{ uri: cat.imageUrl }}
                style={{ width: 176, height: 176 }}
                contentFit="cover"
              />
            </Animated.View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(500).springify()}
            className="text-4xl font-extrabold text-white mb-2"
          >
            {cat.name}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(600).springify()} className="flex-row items-center gap-3 mb-4">
            <View className="px-4 py-1.5 rounded-full" style={{ backgroundColor: rarity.bg }}>
              <Text className="font-bold" style={{ color: rarity.text }}>
                {rarity.label}
              </Text>
            </View>
            <Text className="text-white/80 font-semibold">{cat.breed}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(700).springify()}
            className="bg-white/20 rounded-2xl px-6 py-3 border border-white/30 mb-8"
          >
            <Text className="text-white font-bold text-center">
              +150 XP · ChatDex Entry #{cat.id}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).springify()} className="w-full gap-3" style={{ width: width - 48 }}>
            <Button
              title="View Cat Profile"
              onPress={() => router.replace(`/cat/${cat.id}`)}
              fullWidth
            />
            <Button
              title="Keep Exploring"
              variant="ghost"
              onPress={() => router.replace('/(main)/map')}
              fullWidth
            />
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
