import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

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
  const showToast = useToastStore((state) => state.show);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const initials = (displayName || user.displayName || 'EX').slice(0, 2).toUpperCase();

  const handlePickAvatar = async () => {
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
        title: 'Avatar mis à jour',
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Avatar local',
        description: 'Photo prête ici. La sync cloud n’est pas disponible pour le moment.',
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

  return (
    <SettingsScreen
      title="Modifier le profil"
      subtitle="Change ton pseudo, ton avatar et ta bio."
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
        <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
          {uploadingAvatar ? 'Envoi…' : 'Changer la photo'}
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
    </SettingsScreen>
  );
}
