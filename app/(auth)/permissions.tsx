import { Camera } from 'expo-camera';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingStepper } from '@/components/Auth/OnboardingStepper';
import {
  OnboardingIconBadge,
  OnboardingPulseCta,
  OnboardingRadarHero,
  OnboardingRewardRow,
  OnboardingScanPreview,
  OnboardingSightingPreview,
} from '@/components/Auth/OnboardingVisuals';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { requestLocationAccess } from '@/lib/locationAccess';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

function RadarBootOverlay({ visible }: { visible: boolean }) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(180)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[16],
        paddingHorizontal: spacing[24],
      }}
    >
      <View
        style={[
          {
            width: spacing[80],
            height: spacing[80],
            borderRadius: radius.full,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadow.medium,
        ]}
      >
        <OnboardingIconBadge glyph="paw" softKey="brandSoft" tintKey="brand" size={64} />
      </View>
      <Text
        variant="h3"
        color="textBrand"
        align="center"
        style={{ fontFamily: fonts.display }}
      >
        Activation du radar félin…
      </Text>
    </Animated.View>
  );
}

export default function PermissionsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(false);

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)/map');
  };

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Returning users already finished steps 1–2 — never replay onboarding.
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

  const askCamera = async () => {
    if (Platform.OS === 'web') return true;
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestAll = async () => {
    setBusy(true);
    setBooting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setBooting(false);

      const loc = await requestLocationAccess();
      const cam = await askCamera();
      if (!loc) {
        Alert.alert(
          'Exploration limitée',
          'Active la position pour voir les chats près de toi.',
          [{ text: 'Continuer', onPress: finish }],
        );
        return;
      }
      if (!cam) {
        Alert.alert(
          'Capture plus tard',
          'Tu pourras activer la caméra au moment de capturer.',
          [{ text: 'Continuer', onPress: finish }],
        );
        return;
      }
      finish();
    } finally {
      setBooting(false);
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <RadarBootOverlay visible={booting} />
      <AuthShell
        plain
        fullHeight
        scroll
        sheetStyle={{ backgroundColor: colors.background }}
        footer={
          <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
            <OnboardingRewardRow
              items={[
                { value: '+30 XP', label: 'Première découverte' },
                { value: 'Badge', label: 'Photographe' },
                { value: 'CatDex', label: 'Débloqué' },
              ]}
            />
            <OnboardingStepper step={1} labels={['Découverte', 'Prêt !']} />
            <OnboardingPulseCta>
              <Button
                title="Commencer l’exploration"
                loading={busy}
                onPress={() => void requestAll()}
              />
            </OnboardingPulseCta>
            <Button
              variant="tertiary"
              title="Plus tard"
              disabled={busy}
              onPress={finish}
            />
          </View>
        }
      >
        <OnboardingRadarHero />

        <View style={{ gap: spacing[8], alignItems: 'center' }}>
          <Text
            variant="h1"
            color="textBrand"
            align="center"
            style={{ fontFamily: fonts.display }}
          >
            Plus qu’un pas avant ton premier chat
          </Text>
          <Text variant="body" color="textBody" align="center">
            Autorise l’accès à la caméra et à ta position pour découvrir les chats autour de toi.
          </Text>
        </View>

        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          <OnboardingSightingPreview />
          <OnboardingScanPreview />
        </View>
      </AuthShell>
    </View>
  );
}
