import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { AVATAR_OPTIONS } from '@/data/mock';
import { Shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AvatarScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);

  return (
    <GradientBackground variant="warm">
      <ScreenContainer className="px-6">
        <Animated.View entering={FadeInUp.springify()} className="pt-8 mb-6">
          <Text className="text-4xl font-extrabold text-slate-850 tracking-tight">
            Choose Your Avatar
          </Text>
          <Text className="text-lg text-slate-500 mt-2">
            Pick a companion to represent you on your cat discovery journey.
          </Text>
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-center gap-4 py-4">
            {AVATAR_OPTIONS.map((option, i) => (
              <AvatarOption
                key={option.label}
                option={option}
                selected={selected === i}
                index={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected(i);
                }}
              />
            ))}
          </View>
        </ScrollView>

        <Animated.View entering={FadeInUp.delay(300).springify()} className="items-center py-6">
          <View
            style={[Shadows.glow, { borderColor: AVATAR_OPTIONS[selected].color, borderWidth: 4 }]}
            className="w-32 h-32 rounded-full items-center justify-center bg-white mb-4"
          >
            <Text className="text-6xl">{AVATAR_OPTIONS[selected].emoji}</Text>
          </View>
          <Text className="text-lg font-bold text-slate-850">
            {AVATAR_OPTIONS[selected].label}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} className="pb-6">
          <Button
            title="Continue"
            onPress={() => router.push('/username')}
            fullWidth
          />
        </Animated.View>
      </ScreenContainer>
    </GradientBackground>
  );
}

function AvatarOption({
  option,
  selected,
  index,
  onPress,
}: {
  option: (typeof AVATAR_OPTIONS)[0];
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.9); }}
        onPressOut={() => { scale.value = withSpring(selected ? 1.05 : 1); }}
        style={[
          animatedStyle,
          Shadows.soft,
          {
            borderWidth: 3,
            borderColor: selected ? option.color : 'transparent',
            backgroundColor: option.color + '15',
          },
        ]}
        className="w-28 h-32 rounded-3xl items-center justify-center"
      >
        <Text className="text-5xl mb-2">{option.emoji}</Text>
        <Text className="text-sm font-bold text-slate-700">{option.label}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
}
