import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { SettingsScreen } from '@/components/Settings/SettingsScreen';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

export default function EditProfileScreen() {
  const { colors, spacing, radius, shadow } = useTheme();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const showToast = useToastStore((state) => state.show);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const handleSave = async () => {
    setError(null);
    try {
      await updateProfile({ displayName });
      showToast({
        title: 'Profil mis à jour',
        description: 'Ton pseudo a été enregistré.',
        tone: 'success',
      });
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/profile');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible d’enregistrer le profil.';
      setError(message);
    }
  };

  return (
    <SettingsScreen
      title="Modifier le profil"
      subtitle="Change le nom affiché sur ton CatDex."
      footer={
        <Button
          title="Enregistrer"
          loading={loading}
          onPress={() => void handleSave()}
        />
      }
    >
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[16],
            gap: spacing[16],
          },
          shadow.low,
        ]}
      >
        <TextInput
          label="Pseudo"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={32}
          placeholder="Ton pseudo"
          error={error ?? undefined}
        />
        <Text variant="caption" color="textMuted">
          E-mail : {user.email || '—'}
        </Text>
      </View>
    </SettingsScreen>
  );
}
