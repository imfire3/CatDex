import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthHeader, TermsCheckbox } from '@/components/Auth/AuthChrome';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validatePseudo,
} from '@/lib/authValidation';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignupScreen() {
  const { colors, spacing, gradients } = useTheme();
  const insets = useSafeAreaInsets();
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

  const handleSubmit = () => {
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
      <LinearGradient
        colors={[gradients.primarySoft[0], 'transparent']}
        style={styles.atmosphere}
        pointerEvents="none"
      />
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
            subtitle="Sauvegarde ton CatDex et retrouve tes chats où que tu sois."
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

            <TermsCheckbox
              checked={accepted}
              onChange={setAccepted}
              error={errors.terms}
            />
          </View>

          <View style={{ gap: spacing[8], marginTop: spacing[8] }}>
            <Button title="Créer mon compte" onPress={handleSubmit} />
            <Button
              title="J’ai déjà un compte"
              variant="secondary"
              onPress={() => router.push('/(auth)/login')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  atmosphere: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
});
