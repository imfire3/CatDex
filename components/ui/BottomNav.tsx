import { View, Text, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Map, BookOpen, User, Menu } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TABS = [
  { name: 'map', label: 'Explore', icon: Map, href: '/(main)/map' },
  { name: 'chatdex', label: 'ChatDex', icon: BookOpen, href: '/(main)/chatdex' },
  { name: 'profile', label: 'Profile', icon: User, href: '/(main)/profile' },
] as const;

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="absolute bottom-8 left-6 right-6" style={Shadows.float}>
      <BlurView
        intensity={80}
        tint="light"
        className="flex-row items-center justify-around rounded-full border border-white/50 overflow-hidden py-3 px-4"
      >
        {TABS.map((tab) => {
          const isActive = pathname.includes(tab.name);
          return (
            <NavItem
              key={tab.name}
              icon={tab.icon}
              label={tab.label}
              active={isActive}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(tab.href as any);
              }}
            />
          );
        })}
        <NavItem
          icon={Menu}
          label="Menu"
          active={pathname.includes('menu')}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/menu');
          }}
        />
      </BlurView>
    </View>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  active: boolean;
  onPress: () => void;
}

function NavItem({ icon: Icon, label, active, onPress }: NavItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={animatedStyle}
      className="items-center px-3 py-1"
    >
      <View
        className={`p-2 rounded-2xl ${active ? 'bg-coral-500' : 'bg-transparent'}`}
      >
        <Icon
          size={22}
          color={active ? '#FFFFFF' : '#6B7280'}
          strokeWidth={active ? 2.5 : 2}
        />
      </View>
      <Text
        className={`text-[10px] font-semibold mt-0.5 ${active ? 'text-coral-500' : 'text-slate-400'}`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

interface BackButtonProps {
  onPress?: () => void;
  light?: boolean;
}

export function BackButton({ onPress, light = false }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress ? onPress() : router.back();
      }}
      className={`w-11 h-11 rounded-full items-center justify-center ${light ? 'bg-white/20' : 'bg-white'}`}
      style={light ? undefined : Shadows.soft}
    >
      <Text className={`text-xl font-bold ${light ? 'text-white' : 'text-slate-850'}`}>←</Text>
    </Pressable>
  );
}
