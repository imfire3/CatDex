import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type BottomNavItem = {
  key: string;
  label: string;
  icon: (color: string) => React.ReactNode;
  accessibilityLabel?: string;
};

export type BottomNavigationProps = {
  items: BottomNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Reserve center space for a FloatingActionButton */
  centerSlot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BottomNavigation({
  items,
  activeKey,
  onChange,
  centerSlot,
  style,
}: BottomNavigationProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const mid = Math.ceil(items.length / 2);
  const left = centerSlot ? items.slice(0, mid) : items;
  const right = centerSlot ? items.slice(mid) : [];

  const renderItem = (item: BottomNavItem) => {
    const active = item.key === activeKey;
    const color = active ? colors.accent : colors.textSecondary;
    return (
      <Pressable
        key={item.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.accessibilityLabel ?? item.label}
        onPress={() => onChange(item.key)}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[4],
          paddingVertical: spacing[8],
          minHeight: spacing[48],
        }}
      >
        {item.icon(color)}
        <Text
          variant="caption"
          color={active ? 'accent' : 'textSecondary'}
          style={{ fontFamily: 'Manrope_500Medium' }}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      accessibilityRole="tablist"
      style={[
        {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing[8]),
          paddingTop: spacing[8],
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {left.map(renderItem)}
      {centerSlot ? <View style={{ width: spacing[64] }} /> : null}
      {right.map(renderItem)}
    </View>
  );
}
