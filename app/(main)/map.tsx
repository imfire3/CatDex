import { View, Text, Pressable, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Camera, Compass, Layers } from 'lucide-react-native';
import { BottomNav } from '@/components/ui/BottomNav';
import { FloatingButton } from '@/components/ui/FloatingButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { MOCK_CATS } from '@/data/mock';
import { Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const MARKER_POSITIONS = [
  { top: '22%', left: '15%' },
  { top: '35%', right: '20%' },
  { top: '48%', left: '40%' },
  { top: '30%', left: '55%' },
  { top: '55%', right: '15%' },
  { top: '42%', left: '8%' },
];

export default function MapScreen() {
  const router = useRouter();
  const discovered = MOCK_CATS.filter((c) => c.discovered).length;

  return (
    <View className="flex-1">
      <MapView
        style={{ width, height }}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsCompass={false}
        showsScale={false}
        mapType="standard"
        userInterfaceStyle="light"
      />

      <LinearGradient
        colors={['rgba(26,31,46,0.5)', 'transparent', 'transparent', 'rgba(26,31,46,0.3)']}
        locations={[0, 0.15, 0.7, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />

      <Animated.View
        entering={FadeIn.delay(200)}
        className="absolute top-14 left-5 right-5"
      >
        <GlassCard noPadding>
          <View className="flex-row items-center justify-between px-5 py-3">
            <View>
              <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paris, France
              </Text>
              <Text className="text-lg font-extrabold text-slate-850">
                {discovered} Cats Discovered
              </Text>
            </View>
            <View className="flex-row gap-2">
              <MapControlButton icon={Compass} />
              <MapControlButton icon={Layers} />
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {MOCK_CATS.map((cat, i) => {
        const pos = MARKER_POSITIONS[i % MARKER_POSITIONS.length];
        return (
          <Animated.View
            key={cat.id}
            entering={FadeInDown.delay(300 + i * 100).springify()}
            style={[{ position: 'absolute' }, pos as any]}
          >
            <Pressable
              onPress={() => cat.discovered && router.push(`/cat/${cat.id}`)}
              style={Shadows.soft}
              className="items-center"
            >
              {cat.discovered ? (
                <View
                  className="w-14 h-14 rounded-full bg-white items-center justify-center border-3"
                  style={{ borderWidth: 3, borderColor: '#FF6B4A' }}
                >
                  <Text className="text-3xl">{cat.avatarEmoji}</Text>
                </View>
              ) : (
                <View className="w-12 h-12 rounded-full bg-slate-850/70 items-center justify-center border-2 border-white/40">
                  <Text className="text-2xl opacity-50">🐱</Text>
                </View>
              )}
              <View className="bg-white/90 px-2 py-0.5 rounded-full mt-1">
                <Text className="text-[10px] font-bold text-slate-700">
                  {cat.discovered ? cat.name : '???'}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}

      <View className="absolute bottom-36 left-0 right-0 items-center">
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <FloatingButton
            onPress={() => router.push('/camera')}
            size={80}
            className="border-4 border-coral-200"
          >
            <Camera size={36} color="#FF6B4A" strokeWidth={2.5} />
          </FloatingButton>
        </Animated.View>
      </View>

      <BottomNav />
    </View>
  );
}

function MapControlButton({
  icon: Icon,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
}) {
  return (
    <Pressable
      style={Shadows.soft}
      className="w-10 h-10 rounded-full bg-white items-center justify-center"
    >
      <Icon size={18} color="#6B7280" strokeWidth={2.5} />
    </Pressable>
  );
}
