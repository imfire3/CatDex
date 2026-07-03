import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer, ScreenHeader } from '@/components/ui/ScreenContainer';
import { BackButton } from '@/components/ui/BottomNav';
import { EmojiAvatar } from '@/components/ui/CatAvatar';
import { MOCK_LEADERBOARD } from '@/data/mock';
import { Gradients, Shadows } from '@/constants/theme';
import { Crown, Medal, Award } from 'lucide-react-native';

const RANK_ICONS = [
  { icon: Crown, color: '#FFD166' },
  { icon: Medal, color: '#C0C0C0' },
  { icon: Award, color: '#CD7F32' },
];

export default function LeaderboardScreen() {
  const top3 = MOCK_LEADERBOARD.slice(0, 3);
  const rest = MOCK_LEADERBOARD.slice(3);

  return (
    <GradientBackground variant="warm">
      <ScreenContainer>
        <ScreenHeader
          title="Leaderboard"
          subtitle="Top cat explorers this week"
          left={<BackButton />}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="px-6 mb-6"
          >
            <View className="flex-row items-end justify-center gap-3 pt-4">
              {[1, 0, 2].map((idx) => {
                const entry = top3[idx];
                const rankConfig = RANK_ICONS[idx];
                const heights = [100, 130, 80];
                return (
                  <View key={entry.id} className="items-center flex-1">
                    <rankConfig.icon size={20} color={rankConfig.color} strokeWidth={2.5} />
                    <EmojiAvatar
                      emoji={entry.avatarEmoji}
                      color={entry.avatarColor}
                      size={idx === 0 ? 64 : 52}
                    />
                    <Text className="text-sm font-bold text-slate-850 mt-2" numberOfLines={1}>
                      {entry.username}
                    </Text>
                    <Text className="text-xs text-slate-500">{entry.discoveries} cats</Text>
                    <LinearGradient
                      colors={[...Gradients.primary]}
                      style={{
                        width: '100%',
                        height: heights[idx],
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        marginTop: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text className="text-2xl font-extrabold text-white">
                        #{entry.rank}
                      </Text>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          <View className="px-6">
            {rest.map((entry, i) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.delay(300 + i * 80).springify()}
              >
                <View
                  style={Shadows.soft}
                  className={`flex-row items-center rounded-3xl p-4 mb-3 ${
                    entry.isCurrentUser ? 'bg-coral-50 border-2 border-coral-200' : 'bg-white'
                  }`}
                >
                  <Text className="text-lg font-extrabold text-slate-400 w-8">
                    {entry.rank}
                  </Text>
                  <EmojiAvatar
                    emoji={entry.avatarEmoji}
                    color={entry.avatarColor}
                    size={44}
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-bold text-slate-850">
                      {entry.username}
                      {entry.isCurrentUser && (
                        <Text className="text-coral-500"> (You)</Text>
                      )}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      Level {entry.level}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-extrabold text-slate-850">
                      {entry.discoveries}
                    </Text>
                    <Text className="text-xs text-slate-400">discoveries</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}
