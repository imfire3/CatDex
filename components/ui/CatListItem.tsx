import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CatAvatar } from '@/components/ui/CatAvatar';
import { RARITY_COLORS, type Cat } from '@/data/mock';
import { Shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MapCatMarkerProps {
  cat: Cat;
  index: number;
  onPress?: () => void;
}

export function MapCatMarker({ cat, index, onPress }: MapCatMarkerProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const rarity = RARITY_COLORS[cat.rarity];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (cat.discovered) {
      router.push(`/cat/${cat.id}`);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="items-center"
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => { scale.value = withSpring(0.85); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[animatedStyle, Shadows.soft]}
        className="items-center"
      >
        {cat.discovered ? (
          <View
            className="w-14 h-14 rounded-full overflow-hidden border-3 bg-white items-center justify-center"
            style={{ borderColor: rarity.text, borderWidth: 3 }}
          >
            <Text className="text-3xl">{cat.avatarEmoji}</Text>
          </View>
        ) : (
          <View className="w-12 h-12 rounded-full bg-slate-850/60 items-center justify-center border-2 border-white/30">
            <Text className="text-2xl opacity-60">🐱</Text>
          </View>
        )}
        <View
          className={`mt-1 px-2 py-0.5 rounded-full ${cat.discovered ? 'bg-white/90' : 'bg-slate-850/70'}`}
        >
          <Text
            className={`text-[10px] font-bold ${cat.discovered ? 'text-slate-850' : 'text-white/70'}`}
          >
            {cat.discovered ? cat.name : '???'}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

interface CatListItemProps {
  cat: Cat;
  index: number;
}

export function CatListItem({ cat, index }: CatListItemProps) {
  const router = useRouter();

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 80).springify()}
      onPress={() => router.push(`/cat/${cat.id}`)}
      style={Shadows.soft}
      className="flex-row items-center bg-white rounded-3xl p-4 mb-3"
    >
      <CatAvatar cat={cat} size="md" />
      <View className="flex-1 ml-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-slate-850">{cat.name}</Text>
          {cat.favorite && <Text>⭐</Text>}
        </View>
        <Text className="text-sm text-slate-500">{cat.breed} · {cat.location}</Text>
        <View className="flex-row items-center gap-2 mt-1">
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: RARITY_COLORS[cat.rarity].bg }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: RARITY_COLORS[cat.rarity].text }}
            >
              {RARITY_COLORS[cat.rarity].label}
            </Text>
          </View>
          <Text className="text-xs text-slate-400">{cat.personality}</Text>
        </View>
      </View>
      <Text className="text-slate-300 text-xl">›</Text>
    </AnimatedPressable>
  );
}
