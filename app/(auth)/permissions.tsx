import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

type PermKey = 'location' | 'camera';

type PermState = 'idle' | 'granted' | 'denied';

export default function PermissionsScreen() {
  const { colors, fonts, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const [locationStatus, setLocationStatus] = useState<PermState>('idle');
  const [cameraStatus, setCameraStatus] = useState<PermState>('idle');
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

  const askLocation = async () => {
    if (Platform.OS === 'web') {
      setLocationStatus('granted');
      return true;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    const ok = status === 'granted';
    setLocationStatus(ok ? 'granted' : 'denied');
    return ok;
  };

  const askCamera = async () => {
    if (Platform.OS === 'web') {
      setCameraStatus('granted');
      return true;
    }
    const { status } = await Camera.requestCameraPermissionsAsync();
    const ok = status === 'granted';
    setCameraStatus(ok ? 'granted' : 'denied');
    return ok;
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

  const rows: {
    key: PermKey;
    title: string;
    body: string;
    status: PermState;
    tint: string;
    soft: string;
    onAsk: () => Promise<boolean>;
  }[] = [
    {
      key: 'location',
      title: 'Position',
      body: 'Pour placer les chats sur la carte près de toi.',
      status: locationStatus,
      tint: colors.sky,
      soft: colors.skySoft,
      onAsk: askLocation,
    },
    {
      key: 'camera',
      title: 'Caméra',
      body: 'Pour photographier et analyser les chats.',
      status: cameraStatus,
      tint: colors.orange,
      soft: colors.orangeSoft,
      onAsk: askCamera,
    },
  ];

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing[32],
          paddingBottom: Math.max(insets.bottom, spacing[24]),
          paddingHorizontal: spacing[24],
        },
      ]}
    >
      <View style={{ gap: spacing[8], marginBottom: spacing[32] }}>
        <Text variant="label" color="textSecondary">
          Dernière étape
        </Text>
        <Text variant="h1">Autorisations</Text>
        <Text variant="body" color="textBody">
          CatDex a besoin de deux accès pour fonctionner pleinement. Tu peux tout activer d’un coup.
        </Text>
      </View>

      <View style={{ flex: 1, gap: spacing[16] }}>
        {rows.map((row) => (
          <View
            key={row.key}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[16],
                padding: spacing[16],
                borderRadius: radius.xl,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
              shadow.small,
            ]}
          >
            <View
              style={{
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.lg,
                backgroundColor: row.soft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {row.key === 'location' ? (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                    stroke={row.tint}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                  <Circle cx="12" cy="10" r="2.5" stroke={row.tint} strokeWidth={iconStroke.regular} />
                </Svg>
              ) : (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
                    stroke={row.tint}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                  <Circle cx="12" cy="12" r="3" stroke={row.tint} strokeWidth={iconStroke.regular} />
                </Svg>
              )}
            </View>

            <View style={{ flex: 1, gap: spacing[4] }}>
              <Text variant="h3">{row.title}</Text>
              <Text variant="bodySmall" color="textBody">
                {row.body}
              </Text>
              <Text
                variant="caption"
                style={{
                  fontFamily: fonts.bodySemi,
                  color:
                    row.status === 'granted'
                      ? colors.mint
                      : row.status === 'denied'
                        ? colors.danger
                        : colors.textSecondary,
                }}
              >
                {row.status === 'granted'
                  ? 'Autorisé'
                  : row.status === 'denied'
                    ? 'Refusé'
                    : 'Non demandé'}
              </Text>
            </View>

            <Button
              title={row.status === 'granted' ? 'OK' : 'Autoriser'}
              variant="secondary"
              fullWidth={false}
              disabled={row.status === 'granted' || busy}
              onPress={() => void row.onAsk()}
              style={{ paddingHorizontal: spacing[16], minWidth: 96 }}
            />
          </View>
        ))}
      </View>

      <View style={{ gap: spacing[8] }}>
        <Button
          title="Autoriser et continuer"
          loading={busy}
          onPress={() => void requestAll()}
        />
        <Button title="Passer pour l’instant" variant="ghost" onPress={finish} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
