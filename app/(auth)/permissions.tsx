import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
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

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

  const askLocation = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const askCamera = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)/map');
  };

  const requestAll = async () => {
    setBusy(true);
    try {
      const loc = await askLocation();
      const cam = await askCamera();
      if (!loc || !cam) {
        Alert.alert(
          'Autorisations partielles',
          'Tu pourras les activer plus tard dans les réglages. CatDex fonctionne mieux avec la position et la caméra.',
          [{ text: 'Continuer', onPress: finish }],
        );
        return;
      }
      finish();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      plain
      fullHeight
      footer={
        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          <Button
            title="Autoriser et continuer"
            loading={busy}
            onPress={() => void requestAll()}
          />
          <Button variant="secondary" title="Passer pour l’instant" onPress={finish} />
        </View>
      }
    >
      <View style={{ gap: spacing[8] }}>
        <Text variant="label" color="textMuted">
          Dernière étape
        </Text>
        <Text variant="h1" color="textBrand">
          Autorisations
        </Text>
        <Text variant="body" color="textSecondary">
          CatDex a besoin de deux accès pour fonctionner pleinement. Tu peux tout activer d’un
          coup.
        </Text>
      </View>

      <View style={{ gap: spacing[8] }}>
        {ROWS.map((row) => (
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
