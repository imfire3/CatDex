import { View, Text } from 'react-native';
import { RARITY_COLORS, type Badge } from '@/data/mock';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Shadows } from '@/constants/theme';

const RARITY_BORDER = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

interface BadgeCardProps {
  badge: Badge;
  index: number;
}

export function BadgeCard({ badge, index }: BadgeCardProps) {
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60).springify()}
      style={Shadows.soft}
      className={`rounded-3xl p-4 mb-3 flex-row items-center ${badge.earned ? 'bg-white' : 'bg-slate-50 opacity-60'}`}
    >
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: badge.earned ? RARITY_BORDER[badge.rarity] + '20' : '#F3F4F6',
          borderWidth: 2,
          borderColor: badge.earned ? RARITY_BORDER[badge.rarity] : '#E5E7EB',
        }}
      >
        <Text className="text-3xl" style={{ opacity: badge.earned ? 1 : 0.3 }}>
          {badge.emoji}
        </Text>
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-base font-bold text-slate-850">{badge.name}</Text>
        <Text className="text-sm text-slate-500 mt-0.5">{badge.description}</Text>
        {badge.earned && badge.earnedAt && (
          <Text className="text-xs text-mint-600 font-semibold mt-1">
            Earned {badge.earnedAt}
          </Text>
        )}
      </View>
      {!badge.earned && (
        <View className="bg-slate-200 px-2 py-1 rounded-full">
          <Text className="text-xs font-bold text-slate-500">Locked</Text>
        </View>
      )}
    </Animated.View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  emoji: string;
  color?: string;
}

export function StatCard({ label, value, emoji, color = '#FF6B4A' }: StatCardProps) {
  return (
    <View
      style={Shadows.soft}
      className="bg-white rounded-3xl p-4 flex-1 items-center"
    >
      <Text className="text-2xl mb-1">{emoji}</Text>
      <Text className="text-2xl font-extrabold text-slate-850">{value}</Text>
      <Text className="text-xs font-semibold text-slate-400 mt-0.5">{label}</Text>
      <View
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{ backgroundColor: color }}
      />
    </View>
  );
}
