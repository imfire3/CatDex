import { Pressable, Text, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Gradients, Shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  icon,
  fullWidth = false,
  onPress,
  disabled,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeClasses = {
    sm: 'px-4 py-2.5',
    md: 'px-6 py-3.5',
    lg: 'px-8 py-4',
    xl: 'px-10 py-5',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[animatedStyle, Shadows.glow, fullWidth && { width: '100%' }]}
        className={`rounded-full overflow-hidden ${disabled ? 'opacity-50' : ''}`}
        {...props}
      >
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`flex-row items-center justify-center gap-2 ${sizeClasses[size]}`}
        >
          {icon}
          <Text className={`font-bold text-white ${textSizes[size]}`}>{title}</Text>
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  const variantClasses = {
    secondary: 'bg-white',
    ghost: 'bg-transparent',
    outline: 'bg-transparent border-2 border-coral-500',
  };

  const textClasses = {
    secondary: 'text-slate-850',
    ghost: 'text-coral-500',
    outline: 'text-coral-500',
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, variant === 'secondary' && Shadows.soft, fullWidth && { width: '100%' }]}
      className={`rounded-full flex-row items-center justify-center gap-2 ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''}`}
      {...props}
    >
      {icon}
      <Text className={`font-bold ${textSizes[size]} ${textClasses[variant]}`}>{title}</Text>
    </AnimatedPressable>
  );
}
