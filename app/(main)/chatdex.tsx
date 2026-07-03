import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer, ScreenHeader } from '@/components/ui/ScreenContainer';
import { BottomNav } from '@/components/ui/BottomNav';
import { CatListItem } from '@/components/ui/CatListItem';
import { MOCK_CATS } from '@/data/mock';
import { Search, Filter } from 'lucide-react-native';
import { Shadows } from '@/constants/theme';

const FILTERS = ['All', 'Discovered', 'Favorites', 'Nearby'] as const;

export default function ChatDexScreen() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');

  const filteredCats = MOCK_CATS.filter((cat) => {
    if (filter === 'Discovered') return cat.discovered;
    if (filter === 'Favorites') return cat.favorite;
    if (filter === 'Nearby') return !cat.discovered;
    return true;
  });

  const discovered = MOCK_CATS.filter((c) => c.discovered).length;

  return (
    <GradientBackground variant="warm">
      <ScreenContainer>
        <ScreenHeader
          title="ChatDex"
          subtitle={`${discovered} of ${MOCK_CATS.length} cats documented`}
          right={
            <View className="flex-row gap-2">
              <Pressable style={Shadows.soft} className="w-11 h-11 rounded-full bg-white items-center justify-center">
                <Search size={20} color="#6B7280" strokeWidth={2.5} />
              </Pressable>
              <Pressable style={Shadows.soft} className="w-11 h-11 rounded-full bg-white items-center justify-center">
                <Filter size={20} color="#6B7280" strokeWidth={2.5} />
              </Pressable>
            </View>
          }
        />

        <Animated.View entering={FadeInUp.delay(200).springify()} className="px-6 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {FILTERS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-full ${
                    filter === f ? 'bg-coral-500' : 'bg-white'
                  }`}
                  style={filter !== f ? Shadows.soft : undefined}
                >
                  <Text
                    className={`font-bold text-sm ${
                      filter === f ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {filteredCats.map((cat, i) => (
            <CatListItem key={cat.id} cat={cat} index={i} />
          ))}

          {filteredCats.length === 0 && (
            <Animated.View entering={FadeInDown.springify()} className="items-center py-16">
              <Text className="text-6xl mb-4">🐱</Text>
              <Text className="text-xl font-bold text-slate-600">No cats found</Text>
              <Text className="text-slate-400 mt-2">Try a different filter</Text>
            </Animated.View>
          )}
        </ScrollView>

        <BottomNav />
      </ScreenContainer>
    </GradientBackground>
  );
}
