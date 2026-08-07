import { Alert, Pressable, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';

import { AuthHeader } from '@/components/Auth/AuthChrome';
import { AuthEmailConfigBanner } from '@/components/Auth/AuthEmailConfigBanner';
import { AuthReadyButton } from '@/components/Auth/AuthReadyButton';
import { AuthShell } from '@/components/Auth/AuthShell';
import { AuthSocialButtons } from '@/components/Auth/AuthSocialButtons';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { TextInput } from '@/components/Input';
import { validateEmail, validateLoginPassword } from '@/lib/authValidation';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getAuthErrorMessage,
  getPostAuthHref,
  useAuthStore,
} from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function LoginScreen() {
  const { spacing, fonts } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithApple = useAuthStore((state) => state.signInWithApple);
  const oauthDisabled = useAuthStore((state) => state.oauthDisabled);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors = useMemo(() => {
    if (!submitted) return { email: null as string | null, password: null as string | null };
    return {
      email: validateEmail(email),
      password: validateLoginPassword(password),
    };
  }, [email, password, submitted]);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const enterEmail = async () => {
    setSubmitted(true);
    clearError();
    setFormError(null);
    if (validateEmail(email) || validateLoginPassword(password)) return;

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      const state = useAuthStore.getState();
      if (!state.user) {
        setFormError(
          getAuthErrorMessage(state.error) || 'Connexion impossible. Réessaie.',
        );
        return;
      }
      router.replace(getPostAuthHref(state.onboardingCompleted));
    } catch (error) {
      setFormError(getAuthErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  const enterOAuth = async (provider: 'google' | 'apple') => {
    clearError();
    setFormError(null);
    setLoading(true);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithApple();
      if (useAuthStore.getState().user) {
        router.replace(getPostAuthHref(useAuthStore.getState().onboardingCompleted));
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  const formReady = Boolean(email.trim() && password);
  const formProgress =
    (email.trim() ? 0.5 : 0) + (password.length > 0 ? 0.5 : 0);

  return (
    <AuthShell
      plain
      fullHeight
      header={
        <AuthHeader
          inline
          showBack
          onBack={() => router.replace('/(auth)/welcome')}
          title="Connexion"
          subtitle="Content de te revoir !"
        />
      }
      footer={
        <View style={{ gap: spacing[16] }}>
          <AuthReadyButton
            title="Connexion"
            progress={formProgress}
            ready={formReady}
            loading={loading}
            onPress={() => void enterEmail()}
          />
          <AuthSocialButtons
            disabled={loading}
            hideGoogle={Boolean(oauthDisabled.google)}
            hideApple={Boolean(oauthDisabled.apple)}
            onGoogle={() => void enterOAuth('google')}
            onApple={() => void enterOAuth('apple')}
          />
          <Button
            variant="tertiary"
            title="Créer un compte"
            disabled={loading}
            onPress={() => router.push('/(auth)/join')}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[16], paddingTop: spacing[8] }}>
        {!isSupabaseConfigured ? (
          <Text variant="caption" color="warning">
            Mode local — ajoute ta clé Supabase dans `.env` pour l’auth réelle.
          </Text>
        ) : null}
        <AuthEmailConfigBanner />
        {formError ? (
          <Text variant="bodySmall" color="danger">
            {formError}
          </Text>
        ) : null}
        <TextInput
          label="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="toi@email.com"
          error={errors.email ?? undefined}
        />
        <View style={{ gap: spacing[8] }}>
          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            placeholder="••••••••"
            error={errors.password ?? undefined}
          />
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Mot de passe oublié"
            hitSlop={8}
            onPress={() =>
              Alert.alert(
                'Mot de passe oublié',
                'La réinitialisation arrive bientôt. En attendant, contacte le support CatDex.',
              )
            }
            style={{ alignSelf: 'flex-end', paddingVertical: spacing[4] }}
          >
            <Text
              variant="bodySmall"
              color="textBrand"
              style={{ fontFamily: fonts.bodySemi }}
            >
              Mot de passe oublié ?
            </Text>
          </Pressable>
        </View>
      </View>
    </AuthShell>
  );
}
