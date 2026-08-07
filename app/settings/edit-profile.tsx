import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { SettingsScreen } from '@/components/Settings/SettingsScreen';
import { Text } from '@/components/Text';
import { uploadAvatar } from '@/lib/supabaseStorage';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

type LocalProfileExtras = {
  bio: string;
  city: string;
};

function extrasKey(userId: string) {
  return `catdex-profile-extras:${userId}`;
}

export default function EditProfileScreen() {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const sendPasswordResetEmail = useAuthStore((state) => state.sendPasswordResetEmail);
  const showToast = useToastStore((state) => state.show);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(extrasKey(user.id));
        if (!raw || cancelled) return;
        const parsed = JSON.parse(raw) as Partial<LocalProfileExtras>;
        if (typeof parsed.bio === 'string') setBio(parsed.bio);
        if (typeof parsed.city === 'string') setCity(parsed.city);
      } catch {
        // keep empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    setAvatarUri(user?.avatarUrl);
  }, [user?.avatarUrl]);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const initials = (displayName || user.displayName || 'EX').slice(0, 2).toUpperCase();

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photos indisponibles',
        'Autorise l’accès à ta galerie pour changer ta photo de profil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    const uri = result.assets[0].uri;
    setAvatarUri(uri);
    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadAvatar(uri);
      setAvatarUri(publicUrl);
      useAuthStore.setState((state) =>
        state.user
          ? { user: { ...state.user, avatarUrl: publicUrl } }
          : state,
      );
      showToast({
        title: 'Photo mise à jour',
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Photo enregistrée ici',
        description: 'La sync cloud n’est pas disponible pour le moment.',
        tone: 'default',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateProfile({ displayName });
      await AsyncStorage.setItem(
        extrasKey(user.id),
        JSON.stringify({ bio: bio.trim(), city: city.trim() } satisfies LocalProfileExtras),
      );
      showToast({
        title: 'Profil mis à jour',
        description: 'Tes infos sont enregistrées.',
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

  const handleChangePassword = async () => {
    if (newPassword.trim().length < 8) {
      showToast({
        title: 'Mot de passe trop court',
        description: '8 caractères minimum.',
        tone: 'danger',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        title: 'Confirmation incorrecte',
        description: 'Les deux mots de passe doivent être identiques.',
        tone: 'danger',
      });
      return;
    }
    setPasswordBusy(true);
    try {
      await updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showToast({
        title: 'Mot de passe mis à jour',
        tone: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Impossible de modifier',
        description:
          err instanceof Error ? err.message : 'Réessaie dans un instant.',
        tone: 'danger',
      });
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleResetPassword = async () => {
    setResetBusy(true);
    try {
      await sendPasswordResetEmail();
      showToast({
        title: 'E-mail envoyé',
        description: `Ouvre le lien reçu sur ${user.email}.`,
        tone: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Envoi impossible',
        description:
          err instanceof Error ? err.message : 'Réessaie dans un instant.',
        tone: 'danger',
      });
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <SettingsScreen
      title="Modifier le profil"
      subtitle="Change ton pseudo, ta photo et ton mot de passe."
      footer={
        <Button
          title="Enregistrer"
          loading={loading}
          onPress={() => void handleSave()}
        />
      }
    >
      <View style={{ alignItems: 'center', gap: spacing[16] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Changer la photo de profil"
          onPress={() => {
            void handlePickAvatar();
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? motion.pressScale : 1 }],
          })}
        >
          <Avatar
            hero
            source={avatarUri ? { uri: avatarUri } : undefined}
            initials={initials}
            gradient={!avatarUri}
            accentBorder
            accessibilityLabel="Avatar"
          />
        </Pressable>
        <Button
          variant="secondary"
          title={uploadingAvatar ? 'Envoi…' : 'Modifier la photo'}
          loading={uploadingAvatar}
          onPress={() => void handlePickAvatar()}
        />
      </View>

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
        <TextInput
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Une ligne sur toi…"
          maxLength={120}
          multiline
        />
        <TextInput
          label="Ville (optionnelle)"
          value={city}
          onChangeText={setCity}
          placeholder="Ex. Lyon"
          autoCapitalize="words"
          maxLength={48}
        />
        <Text variant="caption" color="textMuted">
          E-mail : {user.email || '—'}
        </Text>
      </View>

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
        <Text variant="h3" color="textBrand" style={{ fontFamily: fonts.display }}>
          Mot de passe
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          Change-le ici, ou reçois un e-mail de réinitialisation.
        </Text>
        <TextInput
          label="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="••••••••"
        />
        <TextInput
          label="Confirmer"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="••••••••"
        />
        <Button
          title="Mettre à jour le mot de passe"
          loading={passwordBusy}
          onPress={() => void handleChangePassword()}
        />
        <Button
          variant="secondary"
          title="Envoyer un e-mail de réinitialisation"
          loading={resetBusy}
          onPress={() => void handleResetPassword()}
        />
      </View>
    </SettingsScreen>
  );
}
