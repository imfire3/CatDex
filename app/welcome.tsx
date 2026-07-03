import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Camera, MapPin, Heart } from 'lucide-react-native';

const FEATURES = [
  { icon: MapPin, text: 'Explore your neighborhood for hidden feline friends' },
  { icon: Camera, text: 'Photograph and document every unique street cat' },
  { icon: Heart, text: 'Build your personal collection in the ChatDex' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <GradientBackground variant="sunset">
      <ScreenContainer className="px-6">
        <View className="flex-1 justify-center">
          <Animated.View entering={FadeInUp.delay(200).springify()} className="items-center mb-12">
            <Text className="text-8xl mb-6">🐱</Text>
            <Text className="text-5xl font-extrabold text-white text-center tracking-tight">
              CatDex
            </Text>
            <Text className="text-xl text-white/85 text-center mt-3 font-medium leading-7 px-4">
              The premium street cat discovery game
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} className="gap-4 mb-12">
            {FEATURES.map((feature, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(500 + i * 100).springify()}
                className="flex-row items-center bg-white/20 rounded-2xl px-5 py-4 border border-white/30"
              >
                <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center mr-4">
                  <feature.icon size={20} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text className="flex-1 text-base text-white font-medium leading-5">
                  {feature.text}
                </Text>
              </Animated.View>
            ))}
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(800).springify()} className="pb-6 gap-3">
          <Button
            title="Begin Your Journey"
            onPress={() => router.push('/permissions')}
            fullWidth
          />
          <Button
            title="I Already Have an Account"
            variant="ghost"
            onPress={() => router.replace('/(main)/map')}
            fullWidth
          />
        </Animated.View>
      </ScreenContainer>
    </GradientBackground>
  );
}
