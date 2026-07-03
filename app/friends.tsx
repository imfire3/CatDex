import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer, ScreenHeader } from '@/components/ui/ScreenContainer';
import { BackButton } from '@/components/ui/BottomNav';
import { EmojiAvatar } from '@/components/ui/CatAvatar';
import { PulsingDot } from '@/components/ui/ProgressBar';
import { MOCK_FRIENDS } from '@/data/mock';
import { UserPlus, Search } from 'lucide-react-native';
import { Shadows } from '@/constants/theme';

export default function FriendsScreen() {
  const online = MOCK_FRIENDS.filter((f) => f.online).length;

  return (
    <GradientBackground variant="warm">
      <ScreenContainer>
        <ScreenHeader
          title="Friends"
          subtitle={`${online} online · ${MOCK_FRIENDS.length} total`}
          left={<BackButton />}
          right={
            <View className="flex-row gap-2">
              <Pressable style={Shadows.soft} className="w-11 h-11 rounded-full bg-white items-center justify-center">
                <Search size={20} color="#6B7280" strokeWidth={2.5} />
              </Pressable>
              <Pressable style={Shadows.soft} className="w-11 h-11 rounded-full bg-coral-500 items-center justify-center">
                <UserPlus size={20} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </View>
          }
        />

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {MOCK_FRIENDS.map((friend, i) => (
            <Animated.View
              key={friend.id}
              entering={FadeInDown.delay(i * 80).springify()}
            >
              <Pressable
                style={Shadows.soft}
                className="flex-row items-center bg-white rounded-3xl p-4 mb-3"
              >
                <View className="relative">
                  <EmojiAvatar
                    emoji={friend.avatarEmoji}
                    color={friend.avatarColor}
                    size={56}
                  />
                  {friend.online && (
                    <View className="absolute -bottom-0.5 -right-0.5">
                      <PulsingDot color="#10B981" size={8} />
                    </View>
                  )}
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-lg font-bold text-slate-850">{friend.username}</Text>
                  <Text className="text-sm text-slate-500">
                    Level {friend.level} · {friend.discoveries} discoveries
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    friend.online ? 'bg-mint-100' : 'bg-slate-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      friend.online ? 'text-mint-700' : 'text-slate-400'
                    }`}
                  >
                    {friend.online ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}
