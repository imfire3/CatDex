import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import {
  SCANNER_TAB_LIFT,
  SCANNER_TAB_SIZE,
  TAB_BAR_PADDING,
  TAB_ICON_LABEL_GAP,
  TAB_ICON_SIZE,
} from '@/layout/tabBarMetrics';
import { useMapExploreStore } from '@/store/mapExplore';
import { useTheme } from '@/theme/ThemeProvider';

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
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x="6" y="4" width="12" height="16" rx="2" stroke={color} strokeWidth={stroke} />
        <Path d="M9 4.5h6V7H9V4.5Z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
        <Path d="M9 11h6M9 14.5h4" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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

function CameraSparkleIcon({ color, size }: { color: string; size: number }) {
  const { iconStroke } = useTheme();
  const stroke = iconStroke.regular;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 8.5 9.2 6h5.6L16 8.5h1.5A2.5 2.5 0 0 1 20 11v6a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17v-6A2.5 2.5 0 0 1 6.5 8.5H8Z"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="14" r="3.1" stroke={color} strokeWidth={stroke} />
      <Path
        d="M17.2 5.2 17.7 4l.5 1.2L19.4 5.7l-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5Z"
        fill={color}
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
  const tint = focused ? colors.brand : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: TAB_ICON_LABEL_GAP,
      }}
    >
      <View
        style={{
          width: TAB_ICON_SIZE,
          height: TAB_ICON_SIZE,
          borderRadius: radius[8],
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
          lineHeight: spacing[16],
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CaptureTabItem({ proximityActive }: { proximityActive: boolean }) {
  const { colors, spacing, radius, shadow, iconSize } = useTheme();
  const glowSize = SCANNER_TAB_SIZE + spacing[8];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Photographier un chat"
      onPress={() => router.push('/scanner')}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          marginTop: -SCANNER_TAB_LIFT,
          width: glowSize,
          height: glowSize,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: glowSize,
            height: glowSize,
            borderRadius: radius.full,
            backgroundColor: colors.captureFabHalo,
          }}
        />
        <View
          style={[
            {
              width: SCANNER_TAB_SIZE,
              height: SCANNER_TAB_SIZE,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: proximityActive ? colors.brandPressed : colors.brand,
            },
            shadow.medium,
          ]}
        >
          <CameraSparkleIcon color={colors.onBrand} size={iconSize.md} />
        </View>
      </View>
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
            padding: TAB_BAR_PADDING,
            overflow: 'visible',
          },
          shadow.floating,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {LEFT_TABS.map((tab) => (
            <TabItem
              key={tab.route}
              route={tab.route}
              label={tab.label}
              focused={focusedRoute === tab.route}
              onPress={() => handlePress(tab.route)}
            />
          ))}
          <CaptureTabItem proximityActive={hasNearbyCat} />
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
  TAB_BAR_PADDING,
  TAB_ICON_SIZE,
} from '@/layout/tabBarMetrics';
