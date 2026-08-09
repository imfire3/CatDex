import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { AuthHeader } from '@/components/Auth/AuthChrome';
import { AuthEmailConfigBanner } from '@/components/Auth/AuthEmailConfigBanner';
import { AuthReadyButton } from '@/components/Auth/AuthReadyButton';
import { AuthShell } from '@/components/Auth/AuthShell';
import { AuthSocialButtons } from '@/components/Auth/AuthSocialButtons';
import { PasswordStrengthMeter } from '@/components/Auth/PasswordRequirements';
import { Breathing } from '@/components/motion';
import { Button } from '@/components/Button';
import { CatDexIcon } from '@/components/icons/catdex';
import { Text } from '@/components/Text';
import { TextInput } from '@/components/Input';
import { isAppleAuthEnabled, isGoogleAuthEnabled } from '@/lib/authProviders';
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

type Step = 0 | 1 | 2;

const STEP_TITLES = ['Ton pseudo', 'Ton e-mail', 'Ton mot de passe'] as const;
const STEP_SUBTITLES = [
  'Comment on t’appelle dans le quartier ?',
  'Pour retrouver ta collection.',
  'Sécurise ton CatDex.',
] as const;

/**
 * Multi-step signup — pseudo → email → password (lighter than one bank form).
 */
export default function SignupScreen() {
  const { colors, spacing, fonts, radius, shadow } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const signUp = useAuthStore((state) => state.signUp);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithApple = useAuthStore((state) => state.signInWithApple);
  const oauthDisabled = useAuthStore((state) => state.oauthDisabled);
  const clearError = useAuthStore((state) => state.clearError);

  const [step, setStep] = useState<Step>(0);
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

  const stepReady = useMemo(() => {
    if (step === 0) return !validatePseudo(pseudo) && pseudo.trim().length > 0;
    if (step === 1) return !validateEmail(email) && email.trim().length > 0;
    return (
      !validatePassword(password) &&
      !validatePasswordConfirm(password, confirm)
    );
  }, [confirm, email, password, pseudo, step]);

  const formProgress = useMemo(() => {
    if (step === 0) return stepReady ? 1 : Math.min(1, pseudo.trim().length / 3);
    if (step === 1) return stepReady ? 1 : email.includes('@') ? 0.6 : 0.2;
    const checks = [
      !validatePassword(password) && password.length > 0,
      !validatePasswordConfirm(password, confirm) && confirm.length > 0,
    ];
    return checks.filter(Boolean).length / checks.length;
  }, [confirm, email, password, pseudo, step, stepReady]);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const onBack = () => {
    setFormError(null);
    setSubmitted(false);
    if (step === 0) {
      router.replace('/(auth)/welcome');
      return;
    }
    setStep((current) => (current - 1) as Step);
  };

  const onContinue = () => {
    setSubmitted(true);
    setFormError(null);
    if (step === 0) {
      if (validatePseudo(pseudo)) return;
      setSubmitted(false);
      setStep(1);
      return;
    }
    if (step === 1) {
      if (validateEmail(email)) return;
      setSubmitted(false);
      setStep(2);
    }
  };

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

  const showOAuth = step === 0 || step === 2;

  return (
    <AuthShell
      plain
      fullHeight
      header={
        <AuthHeader
          inline
          showBack
          onBack={onBack}
          title={STEP_TITLES[step]}
        />
      }
      footer={
        <View style={{ gap: spacing[8] }}>
          <View style={{ gap: spacing[4] }}>
            {step < 2 ? (
              <AuthReadyButton
                title="Continuer"
                progress={formProgress}
                ready={stepReady}
                loading={loading}
                onPress={onContinue}
              />
            ) : (
              <AuthReadyButton
                title="Créer mon compte"
                progress={formProgress}
                ready={stepReady}
                loading={loading}
                onPress={() => void onSubmit()}
              />
            )}
            <Button
              variant="tertiary"
              title="J’ai déjà un compte"
              disabled={loading}
              onPress={() => router.push('/(auth)/login')}
            />
          </View>
          {step === 2 ? (
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
          ) : null}
        </View>
      }
    >
      <View style={{ gap: spacing[16] }}>
        <View style={{ gap: spacing[8] }}>
          <Text variant="body" color="textSecondary">
            {STEP_SUBTITLES[step]}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: spacing[8],
              alignItems: 'center',
            }}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: 3, now: step + 1 }}
          >
            {([0, 1, 2] as const).map((index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: radius.full,
                  backgroundColor: index <= step ? colors.brand : colors.surfaceSecondary,
                }}
              />
            ))}
          </View>
        </View>

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

        <Animated.View
          key={step}
          entering={FadeInRight.duration(220)}
          exiting={FadeOutLeft.duration(160)}
          style={{ gap: spacing[16] }}
        >
          {step === 0 ? (
            <View style={{ gap: spacing[16] }}>
              <View
                style={[
                  {
                    alignSelf: 'center',
                    width: spacing[80],
                    height: spacing[80],
                    borderRadius: radius.full,
                    backgroundColor: colors.brandSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  shadow.low,
                ]}
              >
                <Breathing>
                  <CatDexIcon name="paw" color={colors.brand} size={36} />
                </Breathing>
              </View>
              <TextInput
                label="Pseudo"
                value={pseudo}
                onChangeText={setPseudo}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="MiaouExplorer"
                error={errors.pseudo ?? undefined}
              />
            </View>
          ) : null}

          {step === 1 ? (
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
          ) : null}

          {step === 2 ? (
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
              <PasswordStrengthMeter password={password} />
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
          ) : null}
        </Animated.View>

        {showOAuth ? (
          <AuthSocialButtons
            disabled={loading}
            hideGoogle={!isGoogleAuthEnabled || Boolean(oauthDisabled.google)}
            hideApple={!isAppleAuthEnabled || Boolean(oauthDisabled.apple)}
            onGoogle={() => void enterOAuth('google')}
            onApple={() => void enterOAuth('apple')}
          />
        ) : null}
      </View>
    </AuthShell>
  );
}
