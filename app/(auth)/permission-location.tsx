import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { BrandLoader, PrimaryCTA, ProgressDots } from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import {
  isLocationActive,
  openSystemLocationSettings,
  requestLocationAccess,
} from '@/lib/locationAccess';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const LOADER_MIN_MS = 900;

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

/** Dedicated GPS authorization — last onboarding step before the map. */
export default function PermissionLocationScreen() {
  const { colors, fonts, spacing, radius } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [entering, setEntering] = useState(false);

  const enterGame = async () => {
    setEntering(true);
    completeOnboarding();
    await new Promise((resolve) => setTimeout(resolve, LOADER_MIN_MS));
    router.replace('/(tabs)/map');
  };

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const active = await isLocationActive();
        if (cancelled) return;
        if (active) {
          setEntering(true);
          completeOnboarding();
          await new Promise((resolve) => setTimeout(resolve, LOADER_MIN_MS));
          if (!cancelled) {
            router.replace('/(tabs)/map');
          }
          return;
        }
        setChecking(false);
      } catch {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally once per user session on this screen — not on onboardingCompleted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted && !entering) {
    return <Redirect href="/(tabs)/map" />;
  }

  if (checking || entering) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BrandLoader
          label={entering ? 'Bienvenue dans ton quartier…' : 'Vérification de la position…'}
        />
      </View>
    );
  }

  const askLocation = async () => {
    setBusy(true);
    try {
      const ok = await requestLocationAccess();
      if (ok) {
        await enterGame();
        return;
      }
      Alert.alert(
        'Position requise',
        'CatDex a besoin de ta position pour placer les chats autour de toi. Tu pourras aussi l’activer plus tard dans le jeu.',
        [
          { text: 'Réessayer', onPress: () => void askLocation() },
          ...(Platform.OS === 'web'
            ? [
                {
                  text: 'Plus tard',
                  style: 'cancel' as const,
                  onPress: () => {
                    void enterGame();
                  },
                },
              ]
            : [
                {
                  text: 'Réglages',
                  onPress: () => {
                    void openSystemLocationSettings();
                  },
                },
                {
                  text: 'Plus tard',
                  style: 'cancel' as const,
                  onPress: () => {
                    void enterGame();
                  },
                },
              ]),
        ],
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      plain
      fullHeight
      scroll
      sheetStyle={{ backgroundColor: colors.background }}
      footer={
        <View style={{ gap: spacing[16], alignSelf: 'stretch' }}>
            <ProgressDots
              step={4}
              total={ONBOARDING_STEP_COUNT}
              labels={[...ONBOARDING_STEP_LABELS]}
            />
          <PrimaryCTA
            title="Autoriser la position"
            loading={busy}
            subtitle="Obligatoire pour voir les chats autour de toi"
            onPress={() => void askLocation()}
            secondary={
              <Button
                variant="secondary"
                title="Plus tard"
                disabled={busy}
                onPress={() => void enterGame()}
              />
            }
          />
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
  );
}
