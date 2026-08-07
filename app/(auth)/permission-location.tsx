import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import {
  OnboardingIconBadge,
  OnboardingPulseCta,
} from '@/components/Auth/OnboardingVisuals';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { requestLocationAccess } from '@/lib/locationAccess';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

function LocationHeroIcon() {
  const { colors, spacing, radius, shadow } = useTheme();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Position GPS"
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
          d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
          stroke={colors.brand}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="10" r="2.5" stroke={colors.brand} strokeWidth={1.8} />
      </Svg>
    </View>
  );
}

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

/** Dedicated GPS authorization — last onboarding step before the map. */
export default function PermissionLocationScreen() {
  const { colors, fonts, spacing, radius } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)/map');
  };

  const askLocation = async () => {
    setBusy(true);
    setBooting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setBooting(false);
      const ok = await requestLocationAccess();
      if (!ok) {
        Alert.alert(
          'Exploration limitée',
          'Active la position pour voir les chats près de toi. Tu pourras l’activer plus tard.',
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
            <Text variant="caption" color="textMuted" align="center">
              Étape 2 / 2 — Position
            </Text>
            <OnboardingPulseCta>
              <Button
                title="Autoriser la position"
                loading={busy}
                onPress={() => void askLocation()}
              />
            </OnboardingPulseCta>
            <Button variant="tertiary" title="Plus tard" disabled={busy} onPress={finish} />
          </View>
        }
      >
        <LocationHeroIcon />

        <View style={{ gap: spacing[8], alignItems: 'center' }}>
          <Text
            variant="h1"
            color="textBrand"
            align="center"
            style={{ fontFamily: fonts.display }}
          >
            Autorise ta position
          </Text>
          <Text variant="body" color="textBody" align="center">
            Pour placer les chats sur la carte et te suivre pendant que tu explores.
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
            • Afficher les chats à proximité en temps réel{'\n'}
            • Suivre ton mouvement sur la carte pendant que tu marches{'\n'}
            • Uniquement en premier plan — pas de tracking en arrière-plan
          </Text>
        </View>
      </AuthShell>
    </View>
  );
}
