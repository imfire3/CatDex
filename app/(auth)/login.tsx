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

import { AuthHeader } from '@/components/Auth/AuthChrome';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { validateEmail, validatePassword } from '@/lib/authValidation';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function LoginScreen() {
  const { colors, spacing, gradients } = useTheme();
  const insets = useSafeAreaInsets();
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

  const handleLogin = () => {
    setSubmitted(true);
    if (validateEmail(email) || validatePassword(password)) return;
    signIn('email', email.trim());
    router.replace(getPostAuthHref(useAuthStore.getState().onboardingCompleted));
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
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Connexion"
            subtitle="Retrouve ton CatDex et continue ta collection."
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
            <Button title="Se connecter" onPress={handleLogin} />
          </View>

          <View style={{ marginTop: 'auto', gap: spacing[8], paddingTop: spacing[24] }}>
            <Button
              title="Créer un compte"
              variant="ghost"
              onPress={() => router.push('/(auth)/signup')}
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
