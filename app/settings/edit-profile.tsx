import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { IconPencil } from '@/components/Settings/settingsIcons';
import { SettingsScreen } from '@/components/Settings/SettingsScreen';
import { AvatarEditBadge, ProfileUpdatedModal } from '@/components/profile';
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
  const { colors, spacing, motion, iconSize } = useTheme();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const sendPasswordResetEmail = useAuthStore((state) => state.sendPasswordResetEmail);
  const showToast = useToastStore((state) => state.show);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [initialDisplayName, setInitialDisplayName] = useState(user?.displayName ?? '');
  const [initialBio, setInitialBio] = useState('');
  const [initialCity, setInitialCity] = useState('');
  const [editing, setEditing] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(extrasKey(user.id));
        if (cancelled) return;
        if (!raw) {
          setInitialDisplayName(user.displayName ?? '');
          return;
        }
        const parsed = JSON.parse(raw) as Partial<LocalProfileExtras>;
        const nextBio = typeof parsed.bio === 'string' ? parsed.bio : '';
        const nextCity = typeof parsed.city === 'string' ? parsed.city : '';
        setBio(nextBio);
        setCity(nextCity);
        setInitialBio(nextBio);
        setInitialCity(nextCity);
        setInitialDisplayName(user.displayName ?? '');
      } catch {
        setInitialDisplayName(user.displayName ?? '');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.displayName]);

  useEffect(() => {
    setAvatarUri(user?.avatarUrl);
  }, [user?.avatarUrl]);

  const dirty =
    displayName.trim() !== initialDisplayName.trim() ||
    bio.trim() !== initialBio.trim() ||
    city.trim() !== initialCity.trim();

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const initials = (displayName || user.displayName || 'EX').slice(0, 2).toUpperCase();
  const fieldsReadOnly = !editing;

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
    if (!dirty) return;
    setError(null);
    try {
      await updateProfile({ displayName });
      const nextBio = bio.trim();
      const nextCity = city.trim();
      await AsyncStorage.setItem(
        extrasKey(user.id),
        JSON.stringify({ bio: nextBio, city: nextCity } satisfies LocalProfileExtras),
      );
      setInitialDisplayName(displayName.trim());
      setInitialBio(nextBio);
      setInitialCity(nextCity);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible d’enregistrer le profil.';
      setError(message);
    }
  };

  const handleFooterPress = () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    void handleSave();
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

  const handleDismissSaved = () => {
    setSaved(false);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  return (
    <View style={{ flex: 1 }}>
      <SettingsScreen
        title="Modifier le profil"
        footer={
          <Button
            title={editing ? 'Enregistrer' : 'Modifier'}
            loading={loading}
            disabled={editing && !dirty}
            onPress={handleFooterPress}
          />
        }
      >
        <View style={{ alignItems: 'center', paddingTop: spacing[8], gap: spacing[16] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Changer la photo de profil"
            disabled={fieldsReadOnly}
            onPress={() => {
              if (fieldsReadOnly) return;
              void handlePickAvatar();
            }}
            style={({ pressed }) => ({
              opacity: pressed && !fieldsReadOnly ? 0.9 : fieldsReadOnly ? 0.92 : 1,
              transform: [
                { scale: pressed && !fieldsReadOnly ? motion.pressScale : 1 },
              ],
            })}
          >
            <View>
              <Avatar
                hero
                source={avatarUri ? { uri: avatarUri } : undefined}
                initials={initials}
                gradient={!avatarUri}
                accessibilityLabel="Avatar"
              />
              <AvatarEditBadge />
            </View>
          </Pressable>
          {!fieldsReadOnly ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Modifier la photo"
              onPress={() => {
                void handlePickAvatar();
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[8],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <IconPencil color={colors.brand} size={iconSize.sm} />
              <Text variant="bodySmall" weight="semibold" color="textBrand">
                {uploadingAvatar ? 'Envoi…' : 'Modifier la photo'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ gap: spacing[16] }}>
          <TextInput
            label="Pseudo"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={32}
            placeholder="Ton pseudo"
            disabled={fieldsReadOnly}
            error={error ?? undefined}
          />
          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Une ligne sur toi…"
            maxLength={120}
            multiline
            disabled={fieldsReadOnly}
          />
          <TextInput
            label="Ville (optionnelle)"
            value={city}
            onChangeText={setCity}
            placeholder="Ex. Lyon"
            autoCapitalize="words"
            maxLength={48}
            disabled={fieldsReadOnly}
          />
          <TextInput
            label="E-mail"
            value={user.email || '—'}
            disabled
            helperText="L’e-mail ne peut pas être modifié ici."
          />
        </View>

        <View style={{ gap: spacing[16] }}>
          <Text variant="title" color="textBrand">
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
      <ProfileUpdatedModal visible={saved} onDismiss={handleDismissSaved} />
    </View>
  );
}
