import { router } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { XPBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { colors, fonts, spacing, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const showToast = useToastStore((state) => state.show);
  const catsCount = useCatsStore((state) => state.cats.length);
  const level = Math.max(1, Math.floor(catsCount / 3) + 1);
  const xp = (catsCount % 3) * 40;
  const xpMax = 120;

  const handleSignOut = () => {
    Alert.alert('Se déconnecter ?', 'Tu pourras te reconnecter pour retrouver ton CatDex.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          signOut();
          showToast({
            title: 'À bientôt',
            description: 'Tu es déconnecté.',
            tone: 'default',
          });
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[24],
          paddingBottom: spacing[96] + spacing[24],
          gap: spacing[24],
        }}
      >
        <Card padded={false}>
          <LinearGradient
            colors={[gradients.primarySoft[0], colors.surface]}
            style={{
              padding: spacing[24],
              alignItems: 'center',
              gap: spacing[16],
            }}
          >
            <Avatar
              hero
              gradient
              accentBorder
              initials={(user?.displayName ?? 'E').slice(0, 1).toUpperCase()}
              accessibilityLabel={user?.displayName ?? 'Profil'}
            />
            <Text variant="h2">{user?.displayName ?? 'Explorateur'}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {user?.email}
            </Text>
          </LinearGradient>
        </Card>

        <XPBar level={level} xp={xp} xpMax={xpMax} />

        <View style={{ flexDirection: 'row', gap: spacing[16] }}>
          <Card style={{ flex: 1 }}>
            <Text variant="label" color="textSecondary">
              Découvertes
            </Text>
            <Text variant="h2" style={{ marginTop: spacing[8], fontFamily: fonts.bodySemi }}>
              {catsCount}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text variant="label" color="textSecondary">
              Niveau
            </Text>
            <Text variant="h2" style={{ marginTop: spacing[8], fontFamily: fonts.bodySemi }}>
              {level}
            </Text>
          </Card>
        </View>

        <Card>
          <Text variant="label" color="textSecondary">
            Zone
          </Text>
          <Text variant="h3" style={{ marginTop: spacing[8] }}>
            Paris 20e
          </Text>
          <Text variant="bodySmall" color="textSecondary" style={{ marginTop: spacing[8] }}>
            Terrain de chasse actuel · captures locales
          </Text>
        </Card>

        <Button
          title="Se déconnecter"
          variant="secondary"
          onPress={handleSignOut}
        />
      </ScrollView>
    </View>
  );
}
