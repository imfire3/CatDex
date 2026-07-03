import { View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { Shadows } from '@/constants/theme';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  children: React.ReactNode;
  noPadding?: boolean;
}

export function GlassCard({
  intensity = 60,
  children,
  noPadding = false,
  className,
  style,
  ...props
}: GlassCardProps) {
  return (
    <View
      className={`rounded-3xl overflow-hidden border border-white/40 ${className ?? ''}`}
      style={[Shadows.soft, style]}
      {...props}
    >
      <BlurView intensity={intensity} tint="light" className={noPadding ? '' : 'p-5'}>
        {children}
      </BlurView>
    </View>
  );
}
