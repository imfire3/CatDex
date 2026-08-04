import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AuthDivider, AuthHeader } from '@/components/Auth/AuthChrome';
import { AuthShell } from '@/components/Auth/AuthShell';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { TextInput } from '@/components/Input';
import { validateEmail, validatePassword } from '@/lib/authValidation';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getAuthErrorMessage,
  getPostAuthHref,
  useAuthStore,
} from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

function GoogleGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleGlyph({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M16.7 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.7-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8ZM14.5 6.5c.6-.8 1.1-1.9.9-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 3-1.4Z"
        fill={color}
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const { colors, spacing, fonts, motion } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithApple = useAuthStore((state) => state.signInWithApple);
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
      password: validatePassword(password),
    };
  }, [email, password, submitted]);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const enterEmail = async () => {
    setSubmitted(true);
    clearError();
    setFormError(null);
    if (validateEmail(email) || validatePassword(password)) return;

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace(getPostAuthHref(useAuthStore.getState().onboardingCompleted));
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
      // Native OAuth returns via deep link; mock mode sets user immediately.
      if (useAuthStore.getState().user) {
        router.replace(getPostAuthHref(useAuthStore.getState().onboardingCompleted));
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  const primaryDisabled = loading || !email.trim() || !password;

  return (
    <AuthShell
      fullHeight
      header={
        <AuthHeader
          inline
          showBack
          onBack={() => router.replace('/(auth)/welcome')}
          title="Connexion"
          subtitle="Content de te revoir. Connecte-toi pour retrouver ton CatDex."
        />
      }
      footer={
        <View style={{ gap: spacing[16], alignItems: 'center' }}>
          <View style={{ alignSelf: 'stretch' }}>
            <Button
              title="Connexion"
              loading={loading}
              disabled={primaryDisabled && !loading}
              onPress={() => void enterEmail()}
            />
          </View>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Je n’ai pas de compte"
            hitSlop={8}
            onPress={() => router.push('/(auth)/signup')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? motion.pressScale : 1 }],
              paddingVertical: spacing[8],
              minHeight: 44,
              justifyContent: 'center',
            })}
          >
            <Text
              variant="bodySmall"
              color="textBrand"
              style={{ fontFamily: fonts.bodySemi }}
            >
              Je n’ai pas de compte
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={{ gap: spacing[24] }}>
        {!isSupabaseConfigured ? (
          <Text variant="caption" color="warning">
            Mode local — ajoute ta clé Supabase dans `.env` pour l’auth réelle.
          </Text>
        ) : null}
        {formError ? (
          <Text variant="bodySmall" color="danger">
            {formError}
          </Text>
        ) : null}
        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="toi@email.com"
          error={errors.email ?? undefined}
        />
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
      </View>

      <AuthDivider />

      <View style={{ gap: spacing[16] }}>
        <Button
          variant="google"
          title="Continuer avec Google"
          disabled={loading}
          onPress={() => void enterOAuth('google')}
          icon={<GoogleGlyph />}
        />
        <Button
          variant="apple"
          title="Continuer avec Apple"
          disabled={loading}
          onPress={() => void enterOAuth('apple')}
          icon={<AppleGlyph color={colors.authAppleLabel} />}
        />
      </View>
    </AuthShell>
  );
}
