import { Tabs, router } from 'expo-router';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingActionButton } from '@/layout/FloatingActionButton';
import { useTheme } from '@/theme/ThemeProvider';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: 'map' | 'catdex' | 'missions' | 'profile';
  color: string;
  focused: boolean;
}) {
  const stroke = focused ? 0 : 1.6;
  const fill = focused ? color : 'none';

  if (name === 'map') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3.2 13.9 9h6.1l-4.9 3.7 1.9 5.9L12 15.4 7 18.6l1.9-5.9L4 9h6.1L12 3.2Z"
          stroke={color}
          strokeWidth={focused ? 0 : 1.6}
          fill={fill}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (name === 'catdex') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect
          x="4"
          y="3.5"
          width="16"
          height="17"
          rx="2.5"
          stroke={color}
          strokeWidth={stroke || 1.6}
          fill={fill}
        />
        {!focused ? (
          <Path d="M8 9h8M8 13h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        ) : null}
      </Svg>
    );
  }
  if (name === 'missions') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={stroke || 1.6} fill={fill} />
        {!focused ? <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.6} /> : null}
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="3.2" stroke={color} strokeWidth={stroke || 1.6} fill={fill} />
      <Path
        d="M5.5 19c1.4-3 3.8-4.5 6.5-4.5S17.1 16 18.5 19"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill={focused ? color : 'none'}
      />
    </Svg>
  );
}

function TabIconWithDot({
  name,
  color,
  focused,
}: {
  name: 'map' | 'catdex' | 'missions' | 'profile';
  color: string;
  focused: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <TabIcon name={name} color={color} focused={focused} />
      {focused ? (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.brand,
          }}
        />
      ) : (
        <View style={{ width: 4, height: 4 }} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const tabHeight = spacing[64] + Math.max(insets.bottom, spacing[8]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.tabBar,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: tabHeight,
            paddingTop: spacing[8],
            paddingBottom: Math.max(insets.bottom, spacing[8]),
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarBackground: () =>
            Platform.OS === 'ios' ? (
              <BlurView intensity={48} tint="light" style={{ flex: 1 }} />
            ) : (
              <View style={{ flex: 1, backgroundColor: colors.tabBar }} />
            ),
          tabBarLabelStyle: {
            fontFamily: fonts.bodySemi,
            fontSize: 12,
            marginTop: spacing[4],
          },
        }}
      >
        <Tabs.Screen
          name="map"
          options={{
            title: 'Explorer',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithDot name="map" color={String(color)} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="catdex"
          options={{
            title: 'Cartes',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithDot name="catdex" color={String(color)} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="missions"
          options={{
            title: 'Missions',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithDot name="missions" color={String(color)} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithDot name="profile" color={String(color)} focused={focused} />
            ),
          }}
        />
      </Tabs>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: Math.max(insets.bottom, spacing[8]) + spacing[4],
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <FloatingActionButton embedded onPress={() => router.push('/scanner')} />
      </View>
    </View>
  );
}
