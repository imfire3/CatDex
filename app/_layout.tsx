import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Spinner } from '@/components/Loader';
import { ToastHost } from '@/components/Toast';
import { useMissionSync } from '@/hooks/useMissionSync';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { palette } from '@/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
        name="scanner"
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="discovery"
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="cat/[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  // Don't block forever on font fetch failures (Expo Go / tunnels).
  const fontsReady = loaded || !!error;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsReady]);

  if (!fontsReady) {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootNavigator />
        <ToastHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
