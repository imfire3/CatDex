import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { MascotCat } from '@/components/MascotCat';

const DIALOGUE = [
  "Welcome, fellow cat enthusiast! I'm Moustache, your guide to the wonderful world of street cats.",
  "Every neighborhood hides secret feline residents waiting to be discovered. I'll teach you everything you need to know.",
  "Ready to start your adventure? Let's set up your explorer profile!",
];

export default function IntroductionScreen() {
  const router = useRouter();

  return (
    <GradientBackground variant="sky">
      <ScreenContainer className="px-6">
        <View className="flex-1 justify-center items-center">
          <Animated.View entering={FadeInUp.springify()}>
            <MascotCat
              size={140}
              message={DIALOGUE.join('\n\n')}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).springify()} className="mt-8 px-4">
            <View className="flex-row flex-wrap justify-center gap-2">
              {['🗺️ Explore', '📸 Capture', '📖 Collect', '🏆 Compete'].map((tag) => (
                <View key={tag} className="bg-white/25 rounded-full px-4 py-2 border border-white/30">
                  <Text className="text-white font-semibold text-sm">{tag}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(500).springify()} className="pb-6">
          <Button
            title="Nice to Meet You, Moustache!"
            onPress={() => router.push('/avatar')}
            fullWidth
          />
        </Animated.View>
      </ScreenContainer>
    </GradientBackground>
  );
}
