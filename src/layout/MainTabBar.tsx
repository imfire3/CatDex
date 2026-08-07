import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import {
  TAB_BAR_PADDING,
  TAB_ICON_LABEL_GAP,
  TAB_ICON_SIZE,
} from '@/layout/tabBarMetrics';
import { useTheme } from '@/theme/ThemeProvider';

type TabKey = 'map' | 'catdex' | 'missions' | 'profile';

const TABS: { route: TabKey; label: string }[] = [
  { route: 'map', label: 'Découvrir' },
  { route: 'catdex', label: 'Mon CatDex' },
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
    // Compass — filled when focused (white on brand circle)
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={focused ? 0 : stroke} />
        <Path
          d="M14.8 9.2 10.2 10.6 8.8 15.2 13.4 13.8 14.8 9.2Z"
          fill={color}
          stroke={color}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12" r="1.2" fill={focused ? color : color} />
      </Svg>
    );
  }

  if (name === 'catdex') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5.5 10.5 4 6.5l3.2 1.6M18.5 10.5 20 6.5l-3.2 1.6"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6.2 11.2c0 3.9 2.6 6.8 5.8 6.8s5.8-2.9 5.8-6.8c0-2.4-1.8-4.4-5.8-4.4s-5.8 2-5.8 4.4Z"
          stroke={color}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        <Circle cx="10" cy="12.2" r="0.9" fill={color} />
        <Circle cx="14" cy="12.2" r="0.9" fill={color} />
        <Path
          d="M10.6 14.6c.7.5 1.5.7 2.4.7s1.7-.2 2.4-.7"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === 'missions') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect x="6" y="4" width="12" height="16" rx="2" stroke={color} strokeWidth={stroke} />
        <Path d="M9 4.5h6V7H9V4.5Z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
        <Path d="M9 11h6M9 14.5h4" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth={stroke} />
      <Path
        d="M5.5 19.2c1.5-3 3.9-4.5 6.5-4.5s5 1.5 6.5 4.5"
        stroke={color}
        strokeWidth={stroke}
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
  const { colors, spacing, radius, fonts, motion } = useTheme();
  const tint = focused ? colors.onBrand : colors.brand;
  const labelColor = focused ? colors.brand : colors.brand;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: TAB_ICON_LABEL_GAP,
        transform: [{ scale: pressed ? motion.pressScale : 1 }],
      })}
    >
      <View
        style={{
          width: TAB_ICON_SIZE,
          height: TAB_ICON_SIZE,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? colors.brand : 'transparent',
        }}
      >
        <TabGlyph name={route} color={tint} focused={focused} />
      </View>
      <Text
        variant="caption"
        style={{
          fontFamily: fonts.bodySemi,
          color: labelColor,
          lineHeight: spacing[16],
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Floating capsule tab bar — 4 equal tabs (camera lives in MapExplorerHud).
 */
export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const focusedRoute = state.routes[state.index]?.name as TabKey;

  // CatDex / Missions / Profil are full screens with sticky back header — no tab pill.
  if (focusedRoute === 'catdex' || focusedRoute === 'missions' || focusedRoute === 'profile') {
    return null;
  }

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
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: spacing[16],
        paddingBottom: insets.bottom + spacing[16],
      }}
    >
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.pill,
            paddingVertical: TAB_BAR_PADDING,
            paddingHorizontal: spacing[8],
            overflow: 'visible',
          },
          shadow.floating,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {TABS.map((tab) => (
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
  MAP_CAPTURE_FAB_SIZE,
  SCANNER_TAB_LIFT,
  SCANNER_TAB_SIZE,
  TAB_BAR_BODY_HEIGHT,
  TAB_BAR_PADDING,
  TAB_ICON_SIZE,
} from '@/layout/tabBarMetrics';
