import { Redirect } from 'expo-router';

<<<<<<< HEAD
import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingPulseCta } from '@/components/Auth/OnboardingVisuals';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Loader/Loader';
import { Text } from '@/components/Text';
=======
>>>>>>> origin/main
import { useAuthStore } from '@/store/auth';

/**
 * Legacy route — camera is requested in-game via EnablePermissionModal
 * when the user taps Capture.
 */
export default function PermissionCameraScreen() {
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
<<<<<<< HEAD
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
=======
>>>>>>> origin/main

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!onboardingCompleted) {
    return <Redirect href="/(auth)/onboarding-reward" />;
  }
<<<<<<< HEAD

  const skipAll = () => {
    completeOnboarding();
    router.replace('/(tabs)/map');
  };

  const askCamera = async () => {
    setBusy(true);
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Caméra plus tard',
          'Tu pourras l’activer au moment de capturer un chat.',
          [{ text: 'Continuer', onPress: () => router.push('/(auth)/permission-location') }],
        );
        return;
      }
      setConfirmed(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/(auth)/permission-location');
    } finally {
      setBusy(false);
    }
  };

  if (confirmed) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Caméra prête"
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[16],
        }}
      >
        <BrandLogo size="lg" />
        <Spinner size="sm" color={colors.brand} />
        <Text variant="h3" color="textBrand" align="center">
          C’est bon, tout marche !
        </Text>
      </View>
    );
  }

  return (
    <AuthShell
      plain
      fullHeight
      scroll
      sheetStyle={{ backgroundColor: colors.background }}
      footer={
        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          <Text variant="caption" color="textMuted" align="center">
            Étape 1 / 2 — Caméra
          </Text>
          <OnboardingPulseCta>
            <Button
              title="Autoriser la caméra"
              loading={busy}
              onPress={() => void askCamera()}
            />
          </OnboardingPulseCta>
          <Button
            variant="secondary"
            title="Plus tard"
            disabled={busy}
            onPress={() => router.push('/(auth)/permission-location')}
          />
          <Button variant="tertiary" title="Passer" disabled={busy} onPress={skipAll} />
        </View>
      }
    >
      <CameraHeroIcon />

      <View style={{ gap: spacing[8], alignItems: 'center' }}>
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          Autorise la caméra
        </Text>
        <Text variant="body" color="textBody" align="center">
          Pour scanner et capturer les chats que tu croises dans ton quartier.
        </Text>
      </View>

      <View
        style={{
          alignSelf: 'stretch',
          gap: spacing[8],
          padding: spacing[16],
          borderRadius: radius.lg,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
          À quoi ça sert ?
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          • Photographier un chat pour l’ajouter à ton CatDex{'\n'}
          • Lire sa robe, sa race et son vibe en une prise{'\n'}
          • Jamais de vidéo ni d’accès en arrière-plan
        </Text>
      </View>
    </AuthShell>
  );
=======
  return <Redirect href="/(tabs)/map" />;
>>>>>>> origin/main
}
