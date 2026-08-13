import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import * as Linking from 'expo-linking';

import { PageLoading } from '@/components/Loader';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { getPostAuthHref, useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * OAuth / magic-link landing — exchanges the redirect URL for a Supabase session.
 */
export default function AuthCallbackScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const handleAuthUrl = useAuthStore((state) => state.handleAuthUrl);
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const url =
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? window.location.href
            : Linking.createURL('auth/callback', { queryParams: params as Record<string, string> });

        const ok = await handleAuthUrl(url);
        if (cancelled) return;
        if (!ok && !useAuthStore.getState().user) {
          setError('Impossible de terminer la connexion. Réessaie.');
        }
        setDone(true);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Connexion impossible');
        setDone(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [handleAuthUrl, params]);

  if (user && done) {
    const typeParam = params.type;
    const isRecovery =
      typeParam === 'recovery' ||
      (Array.isArray(typeParam) && typeParam.includes('recovery'));
    if (isRecovery) {
      return <Redirect href="/settings/edit-profile" />;
    }
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          padding: spacing[24],
          gap: spacing[16] }}
      >
        <Text variant="title" color="textBrand" align="center">
          Connexion interrompue
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {error}
        </Text>
        <Button title="Retour à la connexion" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PageLoading label="Connexion en cours…" />
    </View>
  );
}
