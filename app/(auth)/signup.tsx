import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AuthHeader, TermsCheckbox } from '@/components/Auth/AuthChrome';
import { AuthShell } from '@/components/Auth/AuthShell';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { Text } from '@/components/Text';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validatePseudo,
} from '@/lib/authValidation';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignupScreen() {
  const { colors, fonts, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signUp = useAuthStore((state) => state.signUp);

  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    if (!submitted) {
      return {
        pseudo: null as string | null,
        email: null as string | null,
        password: null as string | null,
        confirm: null as string | null,
        terms: null as string | null,
      };
    }
    return {
      pseudo: validatePseudo(pseudo),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validatePasswordConfirm(password, confirm),
      terms: accepted ? null : 'Tu dois accepter les conditions.',
    };
  }, [accepted, confirm, email, password, pseudo, submitted]);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const onSubmit = () => {
    setSubmitted(true);
    const next = {
      pseudo: validatePseudo(pseudo),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validatePasswordConfirm(password, confirm),
      terms: accepted ? null : 'Tu dois accepter les conditions.',
    };
    if (Object.values(next).some(Boolean)) return;

    signUp({
      email: email.trim(),
      password,
      displayName: pseudo.trim(),
    });
    router.replace('/(auth)/intro');
  };

  return (
    <AuthShell>
      <AuthHeader
        embedded
        title="Créer un compte"
        subtitle="Sauvegarde ta collection et retrouve ton CatDex partout."
        onBack={() => router.replace('/(auth)/welcome')}
      />

      <View style={{ gap: spacing[16] }}>
        <TextInput
          label="Pseudo"
          value={pseudo}
          onChangeText={setPseudo}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="MiaouExplorer"
          helperText="3 à 20 caractères · lettres, chiffres, espaces, - + _ [ ]"
          error={errors.pseudo ?? undefined}
        />
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
        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="••••••••"
          helperText="6 à 100 caractères"
          error={errors.password ?? undefined}
        />
        <TextInput
          label="Répéter le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirm ?? undefined}
        />

        <TermsCheckbox checked={accepted} onChange={setAccepted} error={errors.terms} />
      </View>

      <View style={{ gap: spacing[8] }}>
        <Button title="Créer mon compte" onPress={onSubmit} />
        <Button
          variant="secondary"
          onPress={() => router.push('/(auth)/login')}
          accessibilityLabel="J’ai déjà un compte"
        >
          <Text variant="body" style={{ fontFamily: fonts.bodySemi, color: colors.brand }}>
            J’ai déjà un compte
          </Text>
        </Button>
      </View>
    </AuthShell>
  );
}
