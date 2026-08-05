import { Camera } from 'expo-camera';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { Button } from '@/components/Button';
import { PageLoading } from '@/components/Loader';
import { Text } from '@/components/Text';
import {
  isLocationActive,
  requestLocationAccess,
} from '@/lib/locationAccess';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

type PermKey = 'location' | 'camera';

function PermIcon({ name, color }: { name: PermKey; color: string }) {
  const { iconStroke } = useTheme();

  if (name === 'location') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
          stroke={color}
          strokeWidth={iconStroke.regular}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={iconStroke.regular} />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 9.5V8a2 2 0 0 1 2-2h1.5l1-1.5h7L16.5 6H18a2 2 0 0 1 2 2v1.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="4"
        y="9.5"
        width="16"
        height="10.5"
        rx="2"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Circle cx="12" cy="14.5" r="2.75" stroke={color} strokeWidth={iconStroke.regular} />
    </Svg>
  );
}

const ROWS = [
  {
    key: 'location' as const,
    title: 'Position',
    body: 'Pour placer les chats sur la carte près de toi.',
    softKey: 'skySoft' as const,
    tintKey: 'sky' as const,
  },
  {
    key: 'camera' as const,
    title: 'Caméra',
    body: 'Pour photographier et analyser les chats.',
    softKey: 'orangeSoft' as const,
    tintKey: 'orange' as const,
  },
];

export default function PermissionsScreen() {
  const { colors, spacing, radius } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const [busy, setBusy] = useState(false);
  /** null = still checking whether we can skip this screen. */
  const [needsPrompt, setNeedsPrompt] = useState<boolean | null>(null);

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)/map');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const active = await isLocationActive();
      if (!mounted) return;
      // Location already on → nothing to ask; complete onboarding if needed.
      if (active) {
        if (!onboardingCompleted) completeOnboarding();
        setNeedsPrompt(false);
        return;
      }
      setNeedsPrompt(true);
    })().catch(() => {
      if (mounted) setNeedsPrompt(true);
    });
    return () => {
      mounted = false;
    };
  }, [completeOnboarding, onboardingCompleted]);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (needsPrompt === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <PageLoading label="Vérification…" />
      </View>
    );
  }

  if (!needsPrompt) {
    return <Redirect href="/(tabs)/map" />;
  }

  const askCamera = async () => {
    if (Platform.OS === 'web') {
      // Web camera is requested at capture time; treat as optional here.
      return true;
    }
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestAll = async () => {
    setBusy(true);
    try {
      const loc = await requestLocationAccess();
      const cam = await askCamera();
      if (!loc) {
        Alert.alert(
          'Localisation requise',
          'Active la position pour voir les chats près de toi. Tu pourras aussi l’activer plus tard depuis la carte.',
          [{ text: 'Continuer', onPress: finish }],
        );
        return;
      }
      if (!cam) {
        Alert.alert(
          'Caméra non activée',
          'Tu pourras l’autoriser plus tard au moment de capturer. CatDex fonctionne mieux avec la caméra.',
          [{ text: 'Continuer', onPress: finish }],
        );
        return;
      }
      finish();
    } finally {
      setBusy(false);
    }
  };

  const locationOnly = onboardingCompleted;

  return (
    <AuthShell
      plain
      fullHeight
      footer={
        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          <Button
            title={locationOnly ? 'Activer la position' : 'Autoriser et continuer'}
            loading={busy}
            onPress={() => void requestAll()}
          />
          <Button
            variant="secondary"
            title={locationOnly ? 'Plus tard' : 'Passer pour l’instant'}
            onPress={finish}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[8] }}>
        <Text variant="label" color="textMuted">
          {locationOnly ? 'Localisation' : 'Dernière étape'}
        </Text>
        <Text variant="h1" color="textBrand">
          {locationOnly ? 'Position désactivée' : 'Autorisations'}
        </Text>
        <Text variant="body" color="textSecondary">
          {locationOnly
            ? 'La localisation n’est pas active. Active-la pour placer les chats près de toi sur la carte.'
            : 'CatDex a besoin de deux accès pour fonctionner pleinement. Tu peux tout activer d’un coup.'}
        </Text>
      </View>

      <View style={{ gap: spacing[8] }}>
        {(locationOnly ? ROWS.filter((row) => row.key === 'location') : ROWS).map((row) => (
          <View
            key={row.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[16],
              padding: spacing[16],
              borderRadius: radius.cta,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.ctaSecondaryBorder,
            }}
          >
            <View
              style={{
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.full,
                backgroundColor: colors[row.softKey],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PermIcon name={row.key} color={colors[row.tintKey]} />
            </View>

            <View style={{ flex: 1, gap: spacing[4] }}>
              <Text variant="h3" color="text">
                {row.title}
              </Text>
              <Text variant="bodySmall" color="textSecondary">
                {row.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </AuthShell>
  );
}
