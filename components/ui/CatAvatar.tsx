import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { RARITY_COLORS, type Cat } from '@/data/mock';
import { Shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CatAvatarProps {
  cat: Pick<Cat, 'avatarEmoji' | 'name' | 'rarity' | 'imageUrl' | 'discovered'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  showName?: boolean;
}

const SIZES = { sm: 48, md: 64, lg: 80, xl: 120 };

export function CatAvatar({ cat, size = 'md', onPress, showName = false }: CatAvatarProps) {
  const dim = SIZES[size];
  const scale = useSharedValue(1);
  const rarity = RARITY_COLORS[cat.rarity];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View className="items-center">
      <Animated.View
        style={[
          animatedStyle,
          Shadows.soft,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderWidth: 3,
            borderColor: cat.discovered ? rarity.text : '#D1D5DB',
          },
        ]}
        className="overflow-hidden bg-white items-center justify-center"
      >
        {cat.discovered ? (
          <Image
            source={{ uri: cat.imageUrl }}
            style={{ width: dim, height: dim }}
            contentFit="cover"
          />
        ) : (
          <Text style={{ fontSize: dim * 0.45, opacity: 0.3 }}>🐱</Text>
        )}
      </Animated.View>
      {showName && (
        <Text className="text-xs font-semibold text-slate-600 mt-1.5" numberOfLines={1}>
          {cat.discovered ? cat.name : '???'}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

interface EmojiAvatarProps {
  emoji: string;
  color: string;
  size?: number;
  border?: boolean;
}

export function EmojiAvatar({ emoji, color, size = 64, border = true }: EmojiAvatarProps) {
  return (
    <View
      style={[
        Shadows.soft,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '30',
          borderWidth: border ? 3 : 0,
          borderColor: color,
        },
      ]}
      className="items-center justify-center"
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

interface RarityBadgeProps {
  rarity: Cat['rarity'];
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const config = RARITY_COLORS[rarity];
  return (
    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: config.bg }}>
      <Text className="text-xs font-bold" style={{ color: config.text }}>
        {config.label}
      </Text>
    </View>
  );
}
