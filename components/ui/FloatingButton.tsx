import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  size?: number;
  className?: string;
}

export function FloatingButton({
  onPress,
  children,
  size = 72,
  className,
}: FloatingButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      style={[
        animatedStyle,
        Shadows.float,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      className={`items-center justify-center bg-white ${className ?? ''}`}
    >
      {children}
    </AnimatedPressable>
  );
}

interface FloatingActionButtonProps {
  onPress?: () => void;
  icon: React.ReactNode;
  label?: string;
  size?: number;
}

export function FloatingActionButton({ onPress, icon, label, size = 80 }: FloatingActionButtonProps) {
  return (
    <View className="items-center gap-2">
      <FloatingButton onPress={onPress} size={size}>
        {icon}
      </FloatingButton>
      {label && (
        <Animated.Text className="text-xs font-semibold text-white/90 tracking-wide">
          {label}
        </Animated.Text>
      )}
    </View>
  );
}
