import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AuthHeader, TermsCheckbox } from '@/components/Auth/AuthChrome';
import { AuthEmailConfigBanner } from '@/components/Auth/AuthEmailConfigBanner';
import { AuthShell } from '@/components/Auth/AuthShell';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { TextInput } from '@/components/Input';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validatePseudo,
} from '@/lib/authValidation';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getAuthErrorMessage,
  getPostAuthHref,
  useAuthStore,
} from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignupScreen() {
  const { spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signUp = useAuthStore((state) => state.signUp);
  const clearError = useAuthStore((state) => state.clearError);

  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const canSubmit = useMemo(
    () =>
      !validatePseudo(pseudo) &&
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validatePasswordConfirm(password, confirm) &&
      accepted &&
      !loading,
    [accepted, confirm, email, loading, password, pseudo],
  );

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const onSubmit = async () => {
    setSubmitted(true);
    clearError();
    setFormError(null);
    const next = {
      pseudo: validatePseudo(pseudo),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validatePasswordConfirm(password, confirm),
      terms: accepted ? null : 'Tu dois accepter les conditions.',
    };
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        displayName: pseudo.trim(),
      });

      const state = useAuthStore.getState();
      if (!state.user) {
        setFormError(
          getAuthErrorMessage(state.error) ||
            'Compte créé mais connexion impossible. Réessaie.',
        );
        return;
      }
      // Logged in immediately — continue onboarding (or map if already done).
      router.replace(getPostAuthHref(state.onboardingCompleted));
    } catch (error) {
      setFormError(getAuthErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      plain
      fullHeight
      header={
        <AuthHeader
          inline
          showBack
          onBack={() => router.replace('/(auth)/welcome')}
          title="Créer un compte"
          subtitle="Sauvegarde ta collection et retrouve ton CatDex partout."
        />
      }
      footer={
        <View style={{ gap: spacing[8] }}>
          <Button
            title="Créer mon compte"
            loading={loading}
            disabled={!canSubmit}
            onPress={() => void onSubmit()}
          />
          <Button
            variant="secondary"
            title="J’ai déjà un compte"
            disabled={loading}
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[16] }}>
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
    </AuthShell>
  );
}
