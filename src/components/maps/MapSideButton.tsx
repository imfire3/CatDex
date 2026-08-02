import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  active?: boolean;
};

export function MapSideButton({ icon, onPress, accessibilityLabel, active }: Props) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: spacing[48],
          height: spacing[48],
          borderRadius: radius.full,
          backgroundColor: active ? colors.accentSoft : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: active ? colors.accent : colors.border,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowOpacity: 0,
          elevation: 0,
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

/** Invisible spacer matching MapSideButton / avatar width for centered wordmarks. */
export function MapHudSpacer() {
  const { spacing } = useTheme();
  return <View style={{ width: spacing[48] }} />;
}
