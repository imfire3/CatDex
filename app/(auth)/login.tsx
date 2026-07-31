import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AuthDivider, AuthHeader } from '@/components/Auth/AuthChrome';
import { AuthShell } from '@/components/Auth/AuthShell';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { Text } from '@/components/Text';
import { validateEmail, validatePassword } from '@/lib/authValidation';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function LoginScreen() {
  const { colors, fonts, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const enter = (provider: 'email' | 'google' | 'apple') => {
    if (provider === 'email') {
      setSubmitted(true);
      if (validateEmail(email) || validatePassword(password)) return;
      signIn('email', email.trim());
    } else {
      signIn(provider);
    }
    router.replace(getPostAuthHref(useAuthStore.getState().onboardingCompleted));
  };

  return (
    <AuthShell>
      <AuthHeader
        embedded
        title="Connexion"
        subtitle="Content de te revoir. Connecte-toi pour retrouver ton CatDex."
        onBack={() => router.replace('/(auth)/welcome')}
      />

      <View style={{ gap: spacing[16] }}>
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
        <Button title="Se connecter" onPress={() => enter('email')} />
      </View>

      <AuthDivider />

      <View style={{ gap: spacing[8] }}>
        <Button
          variant="secondary"
          onPress={() => enter('google')}
          accessibilityLabel="Continuer avec Google"
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 11v2.8h6.6c-.3 1.5-2 4.4-6.6 4.4A6.8 6.8 0 1 1 12 5.2c1.9 0 3.2.8 4 1.5l2.1-2A10 10 0 1 0 12 22c5.5 0 9.1-3.9 9.1-9.3 0-.6 0-1.1-.1-1.7H12Z"
                fill={colors.brand}
              />
            </Svg>
          }
        >
          <Text variant="body" style={{ fontFamily: fonts.bodySemi, color: colors.brand }}>
            Continuer avec Google
          </Text>
        </Button>
        <Button
          variant="secondary"
          onPress={() => enter('apple')}
          accessibilityLabel="Continuer avec Apple"
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M16.7 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.7-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8ZM14.5 6.5c.6-.8 1.1-1.9.9-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 3-1.4Z"
                fill={colors.brand}
              />
            </Svg>
          }
        >
          <Text variant="body" style={{ fontFamily: fonts.bodySemi, color: colors.brand }}>
            Continuer avec Apple
          </Text>
        </Button>
      </View>

      <Button
        variant="ghost"
        onPress={() => router.push('/(auth)/signup')}
        accessibilityLabel="Créer un compte"
      >
        <Text variant="body" style={{ fontFamily: fonts.bodySemi, color: colors.brand }}>
          Créer un compte
        </Text>
      </Button>
    </AuthShell>
  );
}
