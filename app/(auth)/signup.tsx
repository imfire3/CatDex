import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AuthHeader } from '@/components/Auth/AuthChrome';
import { AuthEmailConfigBanner } from '@/components/Auth/AuthEmailConfigBanner';
import { AuthReadyButton } from '@/components/Auth/AuthReadyButton';
import { AuthShell } from '@/components/Auth/AuthShell';
import { AuthSocialButtons } from '@/components/Auth/AuthSocialButtons';
import { isAppleAuthEnabled, isGoogleAuthEnabled } from '@/lib/authProviders';
import { PasswordRequirements } from '@/components/Auth/PasswordRequirements';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { TextInput } from '@/components/Input';
import {
  isPasswordStrong,
  livePasswordConfirmError,
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
  const { spacing, fonts } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signUp = useAuthStore((state) => state.signUp);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithApple = useAuthStore((state) => state.signInWithApple);
  const oauthDisabled = useAuthStore((state) => state.oauthDisabled);
  const clearError = useAuthStore((state) => state.clearError);

  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const passwordOk = isPasswordStrong(password);
  const confirmLiveError = livePasswordConfirmError(password, confirm);
  const confirmMatches = Boolean(confirm) && !confirmLiveError && passwordOk;

  const errors = useMemo(() => {
    const showPseudo = submitted || pseudo.trim().length > 0;
    const showEmail = submitted || email.trim().length > 0;
    const showPassword = submitted || password.length > 0;
    const confirmError =
      confirmLiveError ??
      (submitted || confirm.length > 0 ? validatePasswordConfirm(password, confirm) : null);
    return {
      pseudo: showPseudo ? validatePseudo(pseudo) : null,
      email: showEmail ? validateEmail(email) : null,
      password: showPassword ? validatePassword(password) : null,
      confirm: confirmError,
    };
  }, [confirm, confirmLiveError, email, password, pseudo, submitted]);

  const formReady = useMemo(
    () =>
      !validatePseudo(pseudo) &&
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validatePasswordConfirm(password, confirm),
    [confirm, email, password, pseudo],
  );

  const formProgress = useMemo(() => {
    const checks = [
      !validatePseudo(pseudo) && pseudo.trim().length > 0,
      !validateEmail(email) && email.trim().length > 0,
      !validatePassword(password) && password.length > 0,
      !validatePasswordConfirm(password, confirm) && confirm.length > 0,
    ];
    return checks.filter(Boolean).length / checks.length;
  }, [confirm, email, password, pseudo]);

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

  return (
    <AuthShell
      plain
      fullHeight
      header={
        <AuthHeader
          inline
          showBack
          onBack={() => router.replace('/(auth)/join')}
          title="Rejoins CatDex"
        />
      }
      footer={
        <View style={{ gap: spacing[8] }}>
          <View style={{ gap: spacing[4] }}>
            <AuthReadyButton
              title="Créer mon compte"
              progress={formProgress}
              ready={formReady}
              loading={loading}
              onPress={() => void onSubmit()}
            />
            <Button
              variant="tertiary"
              title="J’ai déjà un compte"
              disabled={loading}
              onPress={() => router.push('/(auth)/login')}
            />
          </View>
          <Text variant="caption" color="textSecondary" align="center">
            En créant un compte, tu acceptes les{' '}
            <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              Conditions d’utilisation
            </Text>
            {' et la '}
            <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              Politique de confidentialité
            </Text>
            .
          </Text>
        </View>
      }
    >
      <View style={{ gap: spacing[16] }}>
        <View style={{ gap: spacing[8] }}>
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
          <View style={{ gap: spacing[8] }}>
            <TextInput
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              placeholder="••••••••"
              valid={passwordOk && !errors.password}
              error={errors.password ?? undefined}
            />
            <PasswordRequirements password={password} />
          </View>
          <TextInput
            label="Confirme le mot de passe"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="••••••••"
            valid={confirmMatches && !errors.confirm}
            error={errors.confirm ?? undefined}
          />
        </View>

        <AuthSocialButtons
          disabled={loading}
          hideGoogle={!isGoogleAuthEnabled || Boolean(oauthDisabled.google)}
          hideApple={!isAppleAuthEnabled || Boolean(oauthDisabled.apple)}
          onGoogle={() => void enterOAuth('google')}
          onApple={() => void enterOAuth('apple')}
        />
      </View>
    </AuthShell>
  );
}
