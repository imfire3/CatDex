import '../global.css';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="permissions" />
        <Stack.Screen name="introduction" />
        <Stack.Screen name="avatar" />
        <Stack.Screen name="username" />
        <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
        <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="ai-loading" options={{ animation: 'fade' }} />
        <Stack.Screen name="cat-analysis" />
        <Stack.Screen name="cat-confirmation" />
        <Stack.Screen name="discovery-celebration" options={{ animation: 'fade' }} />
        <Stack.Screen name="cat/[id]" />
        <Stack.Screen name="badges" />
        <Stack.Screen name="friends" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="menu" options={{ animation: 'slide_from_left' }} />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
