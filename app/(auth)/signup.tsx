import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHeader, TermsCheckbox } from '@/components/Auth/AuthChrome';
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
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signUp = useAuthStore((state) => state.signUp);
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);

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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]) + spacing[16],
            gap: spacing[24],
          }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Créer un compte"
            subtitle="Créez un compte pour sauvegarder vos données."
          />

          <Text variant="bodySmall" color="textSecondary">
            Vous pouvez aussi créer votre compte plus tard.
          </Text>

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

            <TermsCheckbox
              checked={accepted}
              onChange={setAccepted}
              error={errors.terms}
            />
          </View>

          <View style={{ gap: spacing[8], marginTop: spacing[8] }}>
            <Button title="Créer mon compte" onPress={onSubmit} />
            <Button
              title="J’ai déjà un compte"
              variant="secondary"
              onPress={() => router.push('/(auth)/login')}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                continueAsGuest();
                router.replace('/(auth)/intro');
              }}
              style={({ pressed }) => ({
                minHeight: spacing[48],
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text variant="bodySmall" color="textSecondary">
                Continuer sans compte
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
