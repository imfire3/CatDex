import { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  X,
  Zap,
  ZoomIn,
  ZoomOut,
  ImageIcon,
  SwitchCamera,
} from 'lucide-react-native';
import { FloatingButton } from '@/components/ui/FloatingButton';
import { Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const [flash, setFlash] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/ai-loading');
  };

  return (
    <View className="flex-1 bg-black">
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800' }}
        style={{ width, height }}
        contentFit="cover"
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.2, 0.7, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="absolute top-0 left-0 right-0 pt-14 px-5">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-black/40 items-center justify-center border border-white/20"
          >
            <X size={22} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>

          <View className="flex-row gap-3">
            <CameraControl
              icon={Zap}
              active={flash}
              onPress={() => setFlash(!flash)}
            />
            <CameraControl icon={SwitchCamera} onPress={() => {}} />
          </View>
        </View>
      </View>

      <Animated.View
        entering={FadeIn.delay(300)}
        className="absolute top-1/3 left-5 right-5 items-center"
      >
        <View className="border-2 border-white/40 rounded-3xl w-64 h-64 items-center justify-center">
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-coral-400 rounded-tl-xl" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-coral-400 rounded-tr-xl" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-coral-400 rounded-bl-xl" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-coral-400 rounded-br-xl" />
          <Text className="text-white/60 text-sm font-semibold">Align cat in frame</Text>
        </View>
      </Animated.View>

      <View className="absolute right-5 top-1/2 -mt-16 gap-4">
        <Pressable
          onPress={() => setZoom(Math.min(zoom + 0.5, 3))}
          className="w-11 h-11 rounded-full bg-black/40 items-center justify-center border border-white/20"
        >
          <ZoomIn size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
        <Text className="text-white text-center text-xs font-bold">{zoom}x</Text>
        <Pressable
          onPress={() => setZoom(Math.max(zoom - 0.5, 1))}
          className="w-11 h-11 rounded-full bg-black/40 items-center justify-center border border-white/20"
        >
          <ZoomOut size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        className="absolute bottom-0 left-0 right-0 pb-12 px-5"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            style={Shadows.soft}
            className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30"
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100' }}
              style={{ width: 56, height: 56 }}
              contentFit="cover"
            />
          </Pressable>

          <Pressable onPress={handleCapture} style={Shadows.glow}>
            <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-white" />
            </View>
          </Pressable>

          <Pressable
            className="w-14 h-14 rounded-2xl bg-black/40 items-center justify-center border border-white/20"
          >
            <ImageIcon size={24} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>

        <Text className="text-white/60 text-center text-sm font-medium mt-4">
          Tap to capture · Pinch to zoom
        </Text>
      </Animated.View>
    </View>
  );
}

function CameraControl({
  icon: Icon,
  active,
  onPress,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-11 h-11 rounded-full items-center justify-center border ${
        active ? 'bg-gold-300/30 border-gold-300' : 'bg-black/40 border-white/20'
      }`}
    >
      <Icon size={20} color={active ? '#FFD166' : '#FFFFFF'} strokeWidth={2.5} />
    </Pressable>
  );
}
