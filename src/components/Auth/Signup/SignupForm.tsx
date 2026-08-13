import { View } from 'react-native';

import { AuthEmailConfigBanner } from '@/components/Auth/AuthEmailConfigBanner';
import { AuthSocialButtons } from '@/components/Auth/AuthSocialButtons';
import { PasswordRequirements } from '@/components/Auth/PasswordRequirements';
import { Text } from '@/components/Text';
import { TextInput } from '@/components/Input';
import { isAppleAuthEnabled, isGoogleAuthEnabled } from '@/lib/authProviders';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';

export type SignupFormValues = {
  pseudo: string;
  email: string;
  password: string;
  confirm: string;
};

export type SignupFormErrors = {
  pseudo: string | null;
  email: string | null;
  password: string | null;
  confirm: string | null;
};

type Props = {
  values: SignupFormValues;
  errors: SignupFormErrors;
  formError?: string | null;
  passwordOk: boolean;
  confirmMatches: boolean;
  loading?: boolean;
  hideGoogle?: boolean;
  hideApple?: boolean;
  onChangePseudo: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeConfirm: (value: string) => void;
  onGoogle?: () => void;
  onApple?: () => void;
};

/** Signup form body — fields, validation hints, social auth. */
export function SignupForm({
  values,
  errors,
  formError,
  passwordOk,
  confirmMatches,
  loading,
  hideGoogle = !isGoogleAuthEnabled,
  hideApple = !isAppleAuthEnabled,
  onChangePseudo,
  onChangeEmail,
  onChangePassword,
  onChangeConfirm,
  onGoogle,
  onApple,
}: Props) {
  const { spacing } = useTheme();

  return (
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
          value={values.pseudo}
          onChangeText={onChangePseudo}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="MiaouExplorer"
          error={errors.pseudo ?? undefined}
        />
        <TextInput
          label="Adresse e-mail"
          value={values.email}
          onChangeText={onChangeEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="toi@email.com"
          error={errors.email ?? undefined}
        />
        <View style={{ gap: spacing[8] }}>
          <TextInput
            label="Mot de passe"
            value={values.password}
            onChangeText={onChangePassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="••••••••"
            valid={passwordOk && !errors.password}
            error={errors.password ?? undefined}
          />
          <PasswordRequirements password={values.password} />
        </View>
        <TextInput
          label="Confirme le mot de passe"
          value={values.confirm}
          onChangeText={onChangeConfirm}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="••••••••"
          valid={confirmMatches && !errors.confirm}
          error={errors.confirm ?? undefined}
        />
      </View>

      {onGoogle || onApple ? (
        <AuthSocialButtons
          disabled={loading}
          hideGoogle={hideGoogle}
          hideApple={hideApple}
          onGoogle={onGoogle ?? (() => undefined)}
          onApple={onApple ?? (() => undefined)}
        />
      ) : null}
    </View>
  );
}
