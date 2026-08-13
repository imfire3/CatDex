import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Spinner } from '@/components/Loader';
import { ToastHost } from '@/components/Toast/ToastHost';
import { useMissionSync } from '@/hooks/useMissionSync';
import { installImageResolveAssetSourcePolyfill } from '@/lib/imageResolvePolyfill';
import { MobileWebFrame } from '@/layout/MobileWebFrame';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { palette } from '@/theme/colors';
import { kindSansFontMap } from '@/theme/typography';

installImageResolveAssetSourcePolyfill();

SplashScreen.preventAutoHideAsync().catch(() => undefined);
void SystemUI.setBackgroundColorAsync(palette.light.background);

function RootNavigator() {
  const { colors } = useTheme();
  useMissionSync();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="auth/callback"
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="scanner"
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="discovery"
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="reward"
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="cat/[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts(kindSansFontMap);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.light.background,
        }}
      >
        <Spinner color={palette.light.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.light.background }}>
      <ThemeProvider>
        <MobileWebFrame>
          <StatusBar style="dark" />
          <RootNavigator />
          <ToastHost />
        </MobileWebFrame>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
