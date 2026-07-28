import { Tabs, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScannerFab } from '@/components/ScannerFab';
import { useTheme } from '@/theme/ThemeProvider';

function TabIcon({
  name,
  color,
}: {
  name: 'map' | 'catdex' | 'missions' | 'profile';
  color: string;
}) {
  if (name === 'map') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 7.5 9 5l6 2.5L21 5v13.5L15 21l-6-2.5L3 21V7.5Z"
          stroke={color}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'catdex') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="3.5" width="16" height="17" rx="2.5" stroke={color} strokeWidth="1.7" />
        <Path d="M8 9h8M8 13h5" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === 'missions') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.7" />
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.7" />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="3.2" stroke={color} strokeWidth="1.7" />
      <Path
        d="M5.5 19c1.4-3 3.8-4.5 6.5-4.5S17.1 16 18.5 19"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function TabsLayout() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            height: 62 + Math.max(insets.bottom, 8),
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
          },
          tabBarLabelStyle: {
            fontFamily: fonts.bodyMedium,
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen
          name="map"
          options={{
            title: 'Carte',
            tabBarIcon: ({ color }) => <TabIcon name="map" color={String(color)} />,
          }}
        />
        <Tabs.Screen
          name="catdex"
          options={{
            title: 'CatDex',
            tabBarIcon: ({ color }) => <TabIcon name="catdex" color={String(color)} />,
          }}
        />
        <Tabs.Screen
          name="missions"
          options={{
            title: 'Missions',
            tabBarIcon: ({ color }) => <TabIcon name="missions" color={String(color)} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => <TabIcon name="profile" color={String(color)} />,
          }}
        />
      </Tabs>

      <ScannerFab onPress={() => router.push('/scanner')} />

      {/* Spacer hint so center FAB doesn't cover labels oddly on web */}
      <View pointerEvents="none" style={styles.fabSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  fabSpacer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
  },
});
