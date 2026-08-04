import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { MainTabBar } from '@/layout/MainTabBar';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors } = useTheme();

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
    </View>
  );
}
