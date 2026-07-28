import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

export type AppSafeAreaProps = {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

export function AppSafeArea({
  children,
  edges = ['top', 'left', 'right'],
  style,
}: AppSafeAreaProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

/** Inset helper when SafeAreaView is not desired */
export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>{children}</View>;
}
