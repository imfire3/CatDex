import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { NEW_DISCOVERY_CAT } from '@/data/mock';
import { MapPin, Palette, Heart } from 'lucide-react-native';

export default function CatConfirmationScreen() {
  const router = useRouter();
  const cat = NEW_DISCOVERY_CAT;

  const details = [
    { icon: Palette, label: 'Color', value: cat.color },
    { icon: MapPin, label: 'Location', value: cat.location },
    { icon: Heart, label: 'Personality', value: cat.personality },
  ];

  return (
    <GradientBackground variant="warm">
      <ScreenContainer className="px-6">
        <Animated.View entering={FadeInUp.springify()} className="pt-8 items-center">
          <Text className="text-4xl font-extrabold text-slate-850 text-center tracking-tight">
            Is this your cat?
          </Text>
          <Text className="text-lg text-slate-500 text-center mt-2">
            Confirm the details before adding to your ChatDex
          </Text>
        </Animated.View>

        <Animated.View
          entering={ZoomIn.delay(200).springify()}
          className="items-center my-8"
        >
          <View className="w-40 h-40 rounded-full overflow-hidden border-4 border-coral-400">
            <Image
              source={{ uri: cat.imageUrl }}
              style={{ width: 160, height: 160 }}
              contentFit="cover"
            />
          </View>
          <Text className="text-3xl font-extrabold text-slate-850 mt-4">{cat.name}</Text>
          <Text className="text-base text-slate-500">{cat.breed}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} className="gap-3 mb-8">
          {details.map((detail) => (
            <GlassCard key={detail.label} noPadding>
              <View className="flex-row items-center gap-4 px-5 py-4">
                <View className="w-10 h-10 rounded-xl bg-coral-100 items-center justify-center">
                  <detail.icon size={20} color="#FF6B4A" strokeWidth={2.5} />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-slate-400 uppercase">{detail.label}</Text>
                  <Text className="text-base font-bold text-slate-850">{detail.value}</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </Animated.View>

        <View className="flex-1" />

        <Animated.View entering={FadeInUp.delay(500).springify()} className="pb-6 gap-3">
          <Button
            title="Yes, Add to ChatDex!"
            onPress={() => router.push('/discovery-celebration')}
            fullWidth
          />
          <Button
            title="Not Quite Right"
            variant="outline"
            onPress={() => router.back()}
            fullWidth
          />
        </Animated.View>
      </ScreenContainer>
    </GradientBackground>
  );
}
