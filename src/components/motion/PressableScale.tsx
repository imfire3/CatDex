import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

/** Pressable with spring scale — default uses theme pressScale. */
export function PressableScale({
  children,
  style,
  scaleTo,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const { motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const target = scaleTo ?? motion.pressScale;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        if (!reduceMotion) {
          scale.value = withSpring(target, { damping: 16, stiffness: 320 });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduceMotion) {
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        }
        onPressOut?.(e);
      }}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
