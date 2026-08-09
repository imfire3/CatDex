import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { PrimaryCTA, ProgressDots } from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { Button } from '@/components/Button';
import { PageLoading } from '@/components/Loader';
import { Text } from '@/components/Text';
import {
  getCameraAccessGranted,
  openSystemCameraSettings,
  requestCameraAccess,
} from '@/lib/cameraAccess';
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
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || onboardingCompleted) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const granted = await getCameraAccessGranted();
        if (cancelled) return;
        if (granted) {
          router.replace('/(auth)/permission-location');
          return;
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onboardingCompleted, user]);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <PageLoading label="Vérification de la caméra…" />
      </View>
    );
  }

  const goNext = () => {
    router.push('/(auth)/permission-location');
  };

  const askCamera = async () => {
    setBusy(true);
    try {
      const granted = await requestCameraAccess();
      if (granted) {
        goNext();
        return;
      }
      Alert.alert(
        'Caméra requise',
        'CatDex a besoin de la caméra pour capturer les chats. Tu peux l’activer dans les réglages.',
        [
          { text: 'Réessayer', onPress: () => void askCamera() },
          ...(Platform.OS === 'web'
            ? [{ text: 'Plus tard', style: 'cancel' as const, onPress: goNext }]
            : [
                {
                  text: 'Réglages',
                  onPress: () => {
                    void openSystemCameraSettings();
                  },
                },
                { text: 'Plus tard', style: 'cancel' as const, onPress: goNext },
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
            step={2}
            total={ONBOARDING_STEP_COUNT}
            labels={[...ONBOARDING_STEP_LABELS]}
          />
          <PrimaryCTA
            title="Autoriser la caméra"
            loading={busy}
            subtitle="Obligatoire pour capturer ton premier chat"
            onPress={() => void askCamera()}
            secondary={
              <Button
                variant="secondary"
                title="Plus tard"
                disabled={busy}
                onPress={goNext}
              />
            }
          />
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
