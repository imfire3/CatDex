import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Heart,
  MapPin,
  Calendar,
  Cloud,
  ChevronRight,
} from 'lucide-react-native';
import { BackButton } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBar } from '@/components/ui/ProgressBar';
import { RarityBadge } from '@/components/ui/CatAvatar';
import { getCatById, NEW_DISCOVERY_CAT } from '@/data/mock';
import { Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function CatProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cat = getCatById(id ?? '') ?? NEW_DISCOVERY_CAT;
  const [favorite, setFavorite] = useState(cat.favorite);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={{ height: 360 }}>
          <Image
            source={{ uri: cat.imageUrl }}
            style={{ width, height: 360 }}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(248,249,252,1)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
          />
          <View className="absolute top-14 left-5 right-5 flex-row justify-between">
            <BackButton />
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setFavorite(!favorite);
              }}
              style={Shadows.soft}
              className="w-11 h-11 rounded-full bg-white items-center justify-center"
            >
              <Heart
                size={22}
                color={favorite ? '#FF6B4A' : '#9CA3AF'}
                fill={favorite ? '#FF6B4A' : 'transparent'}
                strokeWidth={2.5}
              />
            </Pressable>
          </View>
        </View>

        <Animated.View entering={FadeInUp.springify()} className="px-6 -mt-8">
          <View
            style={Shadows.glow}
            className="w-28 h-28 rounded-3xl bg-white items-center justify-center self-center border-4 border-coral-200 -mt-14"
          >
            <Text className="text-6xl">{cat.avatarEmoji}</Text>
            <Text className="text-[10px] font-bold text-slate-400 mt-1">3D Avatar</Text>
          </View>

          <View className="items-center mt-4 mb-6">
            <Text className="text-4xl font-extrabold text-slate-850 tracking-tight">
              {cat.name}
            </Text>
            {cat.nickname && (
              <Text className="text-base text-slate-500 font-medium mt-1">
                "{cat.nickname}"
              </Text>
            )}
            <View className="flex-row items-center gap-3 mt-3">
              <RarityBadge rarity={cat.rarity} />
              <Text className="text-sm font-semibold text-slate-500">{cat.breed}</Text>
            </View>
          </View>

          <GlassCard className="mb-4">
            <Text className="text-base text-slate-600 leading-6">{cat.description}</Text>
          </GlassCard>

          <Text className="text-xl font-bold text-slate-850 mb-3">Stats</Text>
          <GlassCard className="mb-6">
            <StatBar label="Friendliness" value={cat.stats.friendliness} color="#FF6B4A" />
            <StatBar label="Playfulness" value={cat.stats.playfulness} color="#FFD166" />
            <StatBar label="Curiosity" value={cat.stats.curiosity} color="#8B5CF6" />
            <StatBar label="Fluffiness" value={cat.stats.fluffiness} color="#10B981" />
          </GlassCard>

          {cat.gallery.length > 0 && (
            <>
              <Text className="text-xl font-bold text-slate-850 mb-3">Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                {cat.gallery.map((uri, i) => (
                  <Animated.View
                    key={uri}
                    entering={FadeInDown.delay(i * 100).springify()}
                    className="mr-3 rounded-2xl overflow-hidden"
                    style={Shadows.soft}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: 140, height: 140 }}
                      contentFit="cover"
                    />
                  </Animated.View>
                ))}
              </ScrollView>
            </>
          )}

          {cat.observations.length > 0 && (
            <>
              <Text className="text-xl font-bold text-slate-850 mb-3">Observation History</Text>
              {cat.observations.map((obs, i) => (
                <Animated.View
                  key={obs.id}
                  entering={FadeInDown.delay(i * 100).springify()}
                >
                  <GlassCard className="mb-3">
                    <View className="flex-row items-center gap-4 mb-2">
                      <View className="flex-row items-center gap-1.5">
                        <Calendar size={14} color="#6B7280" />
                        <Text className="text-sm font-semibold text-slate-600">{obs.date}</Text>
                      </View>
                      <Text className="text-sm text-slate-400">{obs.time}</Text>
                      <View className="flex-row items-center gap-1.5">
                        <Cloud size={14} color="#6B7280" />
                        <Text className="text-sm text-slate-500">{obs.weather}</Text>
                      </View>
                    </View>
                    <Text className="text-base font-bold text-slate-850 mb-1">
                      Mood: {obs.mood}
                    </Text>
                    <Text className="text-sm text-slate-500 leading-5">{obs.note}</Text>
                  </GlassCard>
                </Animated.View>
              ))}
            </>
          )}

          {cat.discoveredAt && (
            <GlassCard className="mb-4">
              <View className="flex-row items-center gap-3">
                <MapPin size={20} color="#FF6B4A" strokeWidth={2.5} />
                <View>
                  <Text className="text-xs font-semibold text-slate-400 uppercase">Discovered</Text>
                  <Text className="text-base font-bold text-slate-850">{cat.discoveredAt}</Text>
                  <Text className="text-sm text-slate-500">{cat.location}</Text>
                </View>
              </View>
            </GlassCard>
          )}

          <Pressable
            onPress={() => router.replace('/(main)/map')}
            style={Shadows.soft}
            className="flex-row items-center justify-between bg-coral-500 rounded-3xl px-6 py-4 mb-10"
          >
            <View className="flex-row items-center gap-3">
              <MapPin size={22} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-lg font-bold text-white">Open on Map</Text>
            </View>
            <ChevronRight size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
