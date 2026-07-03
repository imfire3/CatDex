import { View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '@/constants/theme';

type GradientVariant = keyof typeof Gradients;

interface GradientBackgroundProps extends ViewProps {
  variant?: GradientVariant;
  children?: React.ReactNode;
}

export function GradientBackground({
  variant = 'warm',
  children,
  className,
  ...props
}: GradientBackgroundProps) {
  return (
    <View className={`flex-1 ${className ?? ''}`} {...props}>
      <LinearGradient
        colors={[...Gradients[variant]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      {children}
    </View>
  );
}
