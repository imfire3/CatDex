import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Providers } from '@/providers/Providers';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isInitialized, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="light" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cat/[id]" options={{ presentation: 'modal', headerShown: true, headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, title: 'Cat Details' }} />
          <Stack.Screen name="create-cat" options={{ presentation: 'modal', headerShown: true, headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, title: 'New Cat' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal', headerShown: true, headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, title: 'Notifications' }} />
        </Stack>
      </AuthGuard>
    </Providers>
  );
}
