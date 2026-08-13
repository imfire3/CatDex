import { router } from 'expo-router';
import { View } from 'react-native';

import { AuthReadyButton } from '@/components/Auth/AuthReadyButton';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  progress: number;
  ready: boolean;
  loading?: boolean;
  onSubmit: () => void;
  onLoginPress?: () => void;
};

/** Signup sticky CTA — primary create, login link, legal line. */
export function SignupCta({
  progress,
  ready,
  loading,
  onSubmit,
  onLoginPress = () => router.push('/(auth)/login'),
}: Props) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing[8] }}>
      <View style={{ gap: spacing[4] }}>
        <AuthReadyButton
          title="Créer mon compte"
          progress={progress}
          ready={ready}
          loading={loading}
          onPress={onSubmit}
        />
        <Button
          variant="tertiary"
          title="J’ai déjà un compte"
          disabled={loading}
          onPress={onLoginPress}
        />
      </View>
      <Text variant="caption" color="textSecondary" align="center">
        En créant un compte, tu acceptes les{' '}
        <Text variant="caption" weight="semibold" color="textBrand">
          Conditions d’utilisation
        </Text>
        {' et la '}
        <Text variant="caption" weight="semibold" color="textBrand">
          Politique de confidentialité
        </Text>
        .
      </Text>
    </View>
  );
}
