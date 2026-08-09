import { Camera } from 'expo-camera';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingPulseCta } from '@/components/Auth/OnboardingVisuals';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Loader/Loader';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

function CameraHeroIcon() {
  const { colors, spacing, radius, shadow } = useTheme();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Caméra"
      style={[
        {
          alignSelf: 'center',
          width: spacing[96],
          height: spacing[96],
          borderRadius: radius.full,
          backgroundColor: colors.brandSoft,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadow.low,
      ]}
    >
      <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.2-1.8A1.5 1.5 0 0 1 11.05 3.5h1.9a1.5 1.5 0 0 1 1.25.7L15.4 6h2.1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
          stroke={colors.brand}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12.5" r="3.2" stroke={colors.brand} strokeWidth={1.8} />
        <Rect x="16.2" y="8.2" width="1.6" height="1.6" rx="0.4" fill={colors.brand} />
      </Svg>
    </View>
  );
}

/** Dedicated camera authorization — after onboarding preview. */
export default function PermissionCameraScreen() {
  const { colors, fonts, spacing, radius } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

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
}
