import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInLeft, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BackButton } from '@/components/ui/BottomNav';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { EmojiAvatar } from '@/components/ui/CatAvatar';
import { MOCK_USER } from '@/data/mock';
import {
  Map,
  BookOpen,
  User,
  Medal,
  Users,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  Star,
  Bell,
  Shield,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { Shadows } from '@/constants/theme';

const MENU_SECTIONS = [
  {
    title: 'Explore',
    items: [
      { icon: Map, label: 'Map', href: '/(main)/map', color: '#FF6B4A' },
      { icon: BookOpen, label: 'ChatDex', href: '/(main)/chatdex', color: '#8B5CF6' },
      { icon: User, label: 'Profile', href: '/(main)/profile', color: '#10B981' },
    ],
  },
  {
    title: 'Community',
    items: [
      { icon: Medal, label: 'Badges', href: '/badges', color: '#FFD166' },
      { icon: Users, label: 'Friends', href: '/friends', color: '#8B5CF6' },
      { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', color: '#FF6B4A' },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings', color: '#6B7280' },
      { icon: Bell, label: 'Notifications', href: '/settings', color: '#3B82F6' },
      { icon: Shield, label: 'Privacy', href: '/settings', color: '#10B981' },
      { icon: HelpCircle, label: 'Help & Support', href: '/settings', color: '#8B5CF6' },
      { icon: Star, label: 'Rate CatDex', href: '/settings', color: '#FFD166' },
    ],
  },
];

export default function MenuScreen() {
  const router = useRouter();
  const user = MOCK_USER;

  return (
    <View className="flex-1 bg-slate-950/50">
      <Pressable className="flex-1" onPress={() => router.back()} />
      <Animated.View
        entering={FadeInLeft.springify()}
        className="absolute top-0 bottom-0 left-0 w-[85%] bg-white"
      >
        <ScreenContainer>
          <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
            <Text className="text-3xl font-extrabold text-slate-850">Menu</Text>
            <Pressable
              onPress={() => router.back()}
              style={Shadows.soft}
              className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={20} color="#6B7280" strokeWidth={2.5} />
            </Pressable>
          </View>

          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="flex-row items-center gap-4 px-6 py-5 border-b border-slate-100"
          >
            <EmojiAvatar
              emoji={user.avatarEmoji}
              color={user.avatarColor}
              size={56}
            />
            <View>
              <Text className="text-lg font-bold text-slate-850">{user.username}</Text>
              <Text className="text-sm text-slate-500">
                Level {user.level} · {user.title}
              </Text>
            </View>
          </Animated.View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {MENU_SECTIONS.map((section, si) => (
              <Animated.View
                key={section.title}
                entering={FadeInDown.delay(200 + si * 100).springify()}
                className="mt-4"
              >
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </Text>
                {section.items.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(item.href as any);
                    }}
                    className="flex-row items-center px-3 py-3.5 rounded-2xl active:bg-slate-50"
                  >
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: item.color + '15' }}
                    >
                      <item.icon size={20} color={item.color} strokeWidth={2.5} />
                    </View>
                    <Text className="flex-1 text-base font-semibold text-slate-700">
                      {item.label}
                    </Text>
                    <ChevronRight size={18} color="#D1D5DB" />
                  </Pressable>
                ))}
              </Animated.View>
            ))}

            <Pressable className="flex-row items-center px-3 py-4 mt-4 mb-8">
              <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3">
                <LogOut size={20} color="#EF4444" strokeWidth={2.5} />
              </View>
              <Text className="text-base font-semibold text-red-500">Sign Out</Text>
            </Pressable>
          </ScrollView>
        </ScreenContainer>
      </Animated.View>
    </View>
  );
}
