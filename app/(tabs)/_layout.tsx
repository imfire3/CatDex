import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';

import { PageLoading } from '@/components/Loader';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <PageLoading label="Chargement…" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(auth)/intro" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        safeAreaInsets={{ bottom: 0 }}
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Tabs.Screen name="map" options={{ title: 'Découvrir' }} />
        <Tabs.Screen name="catdex" options={{ title: 'CatDex' }} />
        <Tabs.Screen name="missions" options={{ title: 'Missions' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>
    </View>
  );
}
