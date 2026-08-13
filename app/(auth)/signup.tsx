import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';

import { AuthShell } from '@/components/Auth/AuthShell';
import { SignupCta, SignupForm, SignupHeader } from '@/components/Auth/Signup';
import { isAppleAuthEnabled, isGoogleAuthEnabled } from '@/lib/authProviders';
import {
  isPasswordStrong,
  livePasswordConfirmError,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validatePseudo,
} from '@/lib/authValidation';
import {
  getAuthErrorMessage,
  getPostAuthHref,
  useAuthStore,
} from '@/store/auth';

export default function SignupScreen() {
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
      header={<SignupHeader />}
      footer={
        <SignupCta
          progress={formProgress}
          ready={formReady}
          loading={loading}
          onSubmit={() => void onSubmit()}
        />
      }
    >
      <SignupForm
        values={{ pseudo, email, password, confirm }}
        errors={errors}
        formError={formError}
        passwordOk={passwordOk}
        confirmMatches={confirmMatches}
        loading={loading}
        hideGoogle={!isGoogleAuthEnabled || Boolean(oauthDisabled.google)}
        hideApple={!isAppleAuthEnabled || Boolean(oauthDisabled.apple)}
        onChangePseudo={setPseudo}
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onChangeConfirm={setConfirm}
        onGoogle={() => void enterOAuth('google')}
        onApple={() => void enterOAuth('apple')}
      />
    </AuthShell>
  );
}
