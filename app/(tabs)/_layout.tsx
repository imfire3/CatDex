import { Tabs, router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingActionButton } from '@/layout/FloatingActionButton';
import { getTabBarTotalHeight, MainTabBar } from '@/layout/MainTabBar';
import { useMapExploreStore } from '@/store/mapExplore';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarTop = getTabBarTotalHeight(insets.bottom, spacing);
  const hasNearbyCat = useMapExploreStore((state) => state.hasNearbyCat);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        safeAreaInsets={{ bottom: 0 }}
        tabBar={(props) => <MainTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen name="map" options={{ title: 'Explorer' }} />
        <Tabs.Screen name="catdex" options={{ title: 'CatDex' }} />
        <Tabs.Screen name="missions" options={{ title: 'Missions' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: tabBarTop + spacing[16],
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <FloatingActionButton
          embedded={false}
          proximityActive={hasNearbyCat}
          onPress={() => router.push('/scanner')}
        />
      </View>
    </View>
  );
}
