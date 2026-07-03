import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ScreenContainer({
  children,
  className,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-transparent ${className ?? ''}`}>
      {children}
    </SafeAreaView>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right, left }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <View className="flex-row items-center gap-3 flex-1">
        {left}
        <View className="flex-1">
          <Text className="text-3xl font-extrabold text-slate-850 tracking-tight">{title}</Text>
          {subtitle && (
            <Text className="text-base text-slate-500 mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      {right}
    </View>
  );
}
