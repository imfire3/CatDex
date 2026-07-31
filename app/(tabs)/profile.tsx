import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { XPBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { colors, fonts, spacing, radius, shadow, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const catsCount = useCatsStore((state) => state.cats.length);
  const level = Math.max(1, Math.floor(catsCount / 3) + 1);
  const xp = (catsCount % 3) * 40;
  const xpMax = 120;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[32],
          paddingBottom: spacing[96] + spacing[24],
          gap: spacing[32],
        }}
      >
        <View style={{ gap: spacing[8] }}>
          <Text variant="h1" color="textBrand">
            Profil
          </Text>
          <Text variant="body" color="textSecondary">
            Ton identité d’explorateur
          </Text>
        </View>

        <Card padded={false}>
          <LinearGradient
            colors={[gradients.primarySoft[0], colors.surface]}
            style={{
              padding: spacing[32],
              alignItems: 'center',
              gap: spacing[16],
            }}
          >
            <View
              style={[
                {
                  width: spacing[96],
                  height: spacing[96],
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: colors.accent,
                  overflow: 'hidden',
                },
                shadow.glow,
              ]}
            >
              <LinearGradient
                colors={[gradients.primary[0], gradients.primary[1]]}
                style={{
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="h1" color="onAccent">
                  {(user?.displayName ?? 'E').slice(0, 1).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <Text variant="h2" color="textBrand">
              {user?.displayName ?? 'Explorateur'}
            </Text>
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
            <Text
              variant="h2"
              color="textBrand"
              style={{ marginTop: spacing[8], fontFamily: fonts.bodySemi }}
            >
              {catsCount}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text variant="label" color="textSecondary">
              Niveau
            </Text>
            <Text
              variant="h2"
              color="textBrand"
              style={{ marginTop: spacing[8], fontFamily: fonts.bodySemi }}
            >
              {level}
            </Text>
          </Card>
        </View>

        <Card>
          <Text variant="label" color="textSecondary">
            Zone
          </Text>
          <Text variant="title" color="textBrand" style={{ marginTop: spacing[8] }}>
            Paris 20e
          </Text>
          <Text variant="bodySmall" color="textSecondary" style={{ marginTop: spacing[8] }}>
            Terrain de chasse actuel · captures locales
          </Text>
        </Card>

        <Button
          title="Se déconnecter"
          variant="destructive"
          onPress={() => {
            signOut();
            router.replace('/(auth)/welcome');
          }}
        />
      </ScrollView>
    </View>
  );
}
