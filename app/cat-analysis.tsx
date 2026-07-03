import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBar } from '@/components/ui/ProgressBar';
import { RarityBadge } from '@/components/ui/CatAvatar';
import { NEW_DISCOVERY_CAT } from '@/data/mock';
import { Sparkles } from 'lucide-react-native';

export default function CatAnalysisScreen() {
  const router = useRouter();
  const cat = NEW_DISCOVERY_CAT;

  return (
    <GradientBackground variant="warm">
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Animated.View entering={FadeInUp.springify()} className="px-6 pt-6">
            <View className="flex-row items-center gap-2 mb-1">
              <Sparkles size={20} color="#FF6B4A" />
              <Text className="text-sm font-bold text-coral-500 uppercase tracking-wider">
                Analysis Complete
              </Text>
            </View>
            <Text className="text-4xl font-extrabold text-slate-850 tracking-tight">
              Cat Identified!
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="mx-6 mt-6 rounded-3xl overflow-hidden"
            style={{ height: 280 }}
          >
            <Image
              source={{ uri: cat.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}
            >
              <Text className="text-3xl font-extrabold text-white">{cat.name}</Text>
              <Text className="text-white/80 font-medium">{cat.breed}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} className="px-6 mt-4">
            <View className="flex-row items-center gap-3 mb-4">
              <RarityBadge rarity={cat.rarity} />
              <Text className="text-sm font-semibold text-slate-500">{cat.personality}</Text>
            </View>

            <GlassCard className="mb-4">
              <Text className="text-base text-slate-600 leading-6">{cat.description}</Text>
            </GlassCard>

            <GlassCard>
              <Text className="text-lg font-bold text-slate-850 mb-4">Cat Stats</Text>
              <StatBar label="Friendliness" value={cat.stats.friendliness} color="#FF6B4A" />
              <StatBar label="Playfulness" value={cat.stats.playfulness} color="#FFD166" />
              <StatBar label="Curiosity" value={cat.stats.curiosity} color="#8B5CF6" />
              <StatBar label="Fluffiness" value={cat.stats.fluffiness} color="#10B981" />
            </GlassCard>
          </Animated.View>

          <View className="h-28" />
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          className="px-6 pb-6 pt-3 bg-white/80 border-t border-slate-100"
        >
          <Button
            title="Confirm Discovery"
            onPress={() => router.push('/cat-confirmation')}
            fullWidth
          />
        </Animated.View>
      </ScreenContainer>
    </GradientBackground>
  );
}
