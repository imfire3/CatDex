import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { BottomNav } from '@/components/ui/BottomNav';
import { EmojiAvatar } from '@/components/ui/CatAvatar';
import { XpBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/BadgeCard';
import { BadgeCard } from '@/components/ui/BadgeCard';
import { MOCK_USER, MOCK_BADGES } from '@/data/mock';
import { Settings, Trophy, Users, Medal, ChevronRight } from 'lucide-react-native';
import { Shadows } from '@/constants/theme';

const QUICK_LINKS = [
  { icon: Medal, label: 'Badges', href: '/badges', color: '#FFD166' },
  { icon: Users, label: 'Friends', href: '/friends', color: '#8B5CF6' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', color: '#FF6B4A' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = MOCK_USER;
  const earnedBadges = MOCK_BADGES.filter((b) => b.earned).slice(0, 3);

  return (
    <GradientBackground variant="warm">
      <ScreenContainer>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <Animated.View entering={FadeInUp.springify()} className="px-6 pt-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-4xl font-extrabold text-slate-850 tracking-tight">
                Profile
              </Text>
              <Pressable
                onPress={() => router.push('/settings')}
                style={Shadows.soft}
                className="w-11 h-11 rounded-full bg-white items-center justify-center"
              >
                <Settings size={20} color="#6B7280" strokeWidth={2.5} />
              </Pressable>
            </View>

            <View className="items-center mb-6">
              <EmojiAvatar
                emoji={user.avatarEmoji}
                color={user.avatarColor}
                size={100}
              />
              <Text className="text-2xl font-extrabold text-slate-850 mt-4">
                {user.username}
              </Text>
              <Text className="text-sm font-semibold text-coral-500 mt-1">
                {user.title}
              </Text>
              <Text className="text-xs text-slate-400 mt-1">
                Explorer since {user.joinedDate}
              </Text>
            </View>

            <View className="mb-6">
              <XpBar current={user.xp} max={user.xpToNext} level={user.level} />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="flex-row gap-3 px-6 mb-6"
          >
            <StatCard label="Cats Found" value={user.totalCats} emoji="🐱" color="#FF6B4A" />
            <StatCard label="Discoveries" value={user.totalDiscoveries} emoji="📸" color="#8B5CF6" />
            <StatCard label="Day Streak" value={user.streak} emoji="🔥" color="#FFD166" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} className="px-6 mb-6">
            <View className="flex-row gap-3">
              {QUICK_LINKS.map((link) => (
                <Pressable
                  key={link.label}
                  onPress={() => router.push(link.href as any)}
                  style={Shadows.soft}
                  className="flex-1 bg-white rounded-3xl p-4 items-center"
                >
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: link.color + '20' }}
                  >
                    <link.icon size={24} color={link.color} strokeWidth={2.5} />
                  </View>
                  <Text className="text-sm font-bold text-slate-700">{link.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} className="px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-slate-850">Recent Achievements</Text>
              <Pressable
                onPress={() => router.push('/badges')}
                className="flex-row items-center"
              >
                <Text className="text-sm font-bold text-coral-500 mr-1">See All</Text>
                <ChevronRight size={16} color="#FF6B4A" />
              </Pressable>
            </View>
            {earnedBadges.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} />
            ))}
          </Animated.View>
        </ScrollView>

        <BottomNav />
      </ScreenContainer>
    </GradientBackground>
  );
}
