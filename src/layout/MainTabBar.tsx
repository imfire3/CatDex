import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useMapExploreStore } from '@/store/mapExplore';
import { useTheme } from '@/theme/ThemeProvider';
import { SCANNER_TAB_LIFT, SCANNER_TAB_SIZE } from '@/layout/tabBarMetrics';

type TabKey = 'map' | 'catdex' | 'missions' | 'profile';

const LEFT_TABS: { route: TabKey; label: string }[] = [
  { route: 'map', label: 'Explorer' },
  { route: 'catdex', label: 'CatDex' },
];

const RIGHT_TABS: { route: TabKey; label: string }[] = [
  { route: 'missions', label: 'Missions' },
  { route: 'profile', label: 'Profil' },
];

function TabGlyph({
  name,
  color,
  focused,
}: {
  name: TabKey;
  color: string;
  focused: boolean;
}) {
  const { iconStroke } = useTheme();
  const stroke = iconStroke.regular;

  if (name === 'map') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
          fill={focused ? color : 'none'}
          stroke={color}
          strokeWidth={focused ? 0 : stroke}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'catdex') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6.5 11.5 5 8.5l2.5 1.5M17.5 11.5 19 8.5 16.5 10M12 17.5c3.3 0 5.5-2 5.5-4.8C17.5 9.8 15.2 8 12 8s-5.5 1.8-5.5 4.7c0 2.8 2.2 4.8 5.5 4.8Z"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="10" cy="12.5" r="0.9" fill={color} />
        <Circle cx="14" cy="12.5" r="0.9" fill={color} />
        <Path
          d="M10.5 14.8c.8.6 1.7.9 2.5.9s1.7-.3 2.5-.9"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === 'missions') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x="5" y="4" width="14" height="16" rx="2" stroke={color} strokeWidth={stroke} />
        <Path d="M9 9h6M9 12.5h4" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        <Path d="M16.5 6.5h2v2" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        <Path d="M16 7 18.5 4.5" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8.5" r="3.2" stroke={color} strokeWidth={stroke} />
      <Path
        d="M5.5 19.5c1.6-3.2 4-4.8 6.5-4.8s4.9 1.6 6.5 4.8"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CrosshairIcon({ color, size }: { color: string; size: number }) {
  const { iconStroke } = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth={iconStroke.regular} />
      <Path
        d="M12 4.5v15M4.5 12h15"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TabItem({
  route,
  label,
  focused,
  onPress,
}: {
  route: TabKey;
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const { colors, spacing, radius, fonts } = useTheme();
  const tint = focused ? colors.brand : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing[4],
        minHeight: spacing[56],
      }}
    >
      <View
        style={{
          width: spacing[32],
          height: spacing[32],
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? colors.brandSoft : 'transparent',
        }}
      >
        <TabGlyph name={route} color={tint} focused={focused} />
      </View>
      <Text
        variant="caption"
        style={{
          fontFamily: fonts.bodySemi,
          color: tint,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ScannerTabItem({ proximityActive }: { proximityActive: boolean }) {
  const { colors, spacing, radius, fonts, shadow, iconSize } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Scanner"
      onPress={() => router.push('/scanner')}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing[4],
        minHeight: spacing[56],
      }}
    >
      <View
        style={{
          marginTop: -SCANNER_TAB_LIFT,
          width: SCANNER_TAB_SIZE,
          height: SCANNER_TAB_SIZE,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: proximityActive ? colors.brandPressed : colors.brand,
          ...shadow.medium,
        }}
      >
        <CrosshairIcon color={colors.onBrand} size={iconSize.md} />
      </View>
      <Text
        variant="caption"
        style={{
          fontFamily: fonts.bodySemi,
          color: colors.textSecondary,
        }}
      >
        Scanner
      </Text>
    </Pressable>
  );
}

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const focusedRoute = state.routes[state.index]?.name as TabKey;
  const hasNearbyCat = useMapExploreStore((s) => s.hasNearbyCat);

  const handlePress = (routeName: TabKey) => {
    const route = state.routes.find((item) => item.name === routeName);
    if (!route) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (focusedRoute !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        paddingHorizontal: spacing[16],
        paddingBottom: insets.bottom + spacing[16],
      }}
    >
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.cta,
            paddingTop: SCANNER_TAB_LIFT + spacing[8],
            paddingBottom: spacing[8],
            paddingHorizontal: spacing[4],
            overflow: 'visible',
          },
          shadow.floating,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {LEFT_TABS.map((tab) => (
            <TabItem
              key={tab.route}
              route={tab.route}
              label={tab.label}
              focused={focusedRoute === tab.route}
              onPress={() => handlePress(tab.route)}
            />
          ))}
          <ScannerTabItem proximityActive={hasNearbyCat} />
          {RIGHT_TABS.map((tab) => (
            <TabItem
              key={tab.route}
              route={tab.route}
              label={tab.label}
              focused={focusedRoute === tab.route}
              onPress={() => handlePress(tab.route)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export {
  CAPTURE_FAB_OUTER_SIZE,
  getMapHudBottom,
  getScannerAnchorBottom,
  getTabBarTotalHeight,
  SCANNER_TAB_LIFT,
  SCANNER_TAB_SIZE,
  TAB_BAR_BODY_HEIGHT,
} from '@/layout/tabBarMetrics';
