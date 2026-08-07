import { Camera } from 'expo-camera';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingStepper } from '@/components/Auth/OnboardingStepper';
import { Button } from '@/components/Button';
import { PageLoading } from '@/components/Loader';
import { Text } from '@/components/Text';
import {
  isLocationActive,
  requestLocationAccess,
} from '@/lib/locationAccess';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const ABILITIES = [
  {
    key: 'location' as const,
    title: 'Explorer autour de toi',
    body: 'Découvre les chats cachés dans ton quartier.',
    softKey: 'brandSoft' as const,
    tintKey: 'brand' as const,
    icon: 'paw' as const,
  },
  {
    key: 'camera' as const,
    title: 'Scanner un chat',
    body: 'Analyse automatiquement race, couleur et pelage.',
    softKey: 'orangeSoft' as const,
    tintKey: 'orange' as const,
    icon: 'capture' as const,
  },
];

const REWARDS = [
  'Capturer ton premier chat',
  'Débloquer ton CatDex',
  'Commencer à gagner de l’XP',
];

function AbilityIcon({
  name,
  color,
}: {
  name: 'paw' | 'capture';
  color: string;
}) {
  if (name === 'paw') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 18.5c-2.6 0-4.7-1.4-4.7-2.8 0-.8.9-1.2 1.8-.9.6.2 1.4.4 2.9.4s2.3-.2 2.9-.4c.9-.3 1.8.1 1.8.9 0 1.4-2.1 2.8-4.7 2.8Z"
          fill={color}
        />
        <Circle cx="7.2" cy="11.2" r="1.9" fill={color} />
        <Circle cx="16.8" cy="11.2" r="1.9" fill={color} />
        <Circle cx="9.4" cy="7.4" r="1.7" fill={color} />
        <Circle cx="14.6" cy="7.4" r="1.7" fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Path d="M3 12h18" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="12" r="3.2" fill={color} />
    </Svg>
  );
}

function RadarHero() {
  const { colors, spacing, radius } = useTheme();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.55, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.45,
    transform: [{ scale: 0.85 + pulse.value * 0.35 }],
  }));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Radar félin"
      style={{
        alignSelf: 'center',
        width: spacing[80],
        height: spacing[80],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[8],
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: spacing[80],
            height: spacing[80],
            borderRadius: radius.full,
            borderWidth: 2,
            borderColor: colors.brand,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: spacing[56],
          height: spacing[56],
          borderRadius: radius.full,
          backgroundColor: colors.brandSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AbilityIcon name="paw" color={colors.brand} />
      </View>
    </View>
  );
}

function RadarBootOverlay({ visible }: { visible: boolean }) {
  const { colors, fonts, spacing, radius } = useTheme();
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
        style={{
          width: spacing[80],
          height: spacing[80],
          borderRadius: radius.full,
          backgroundColor: colors.brandSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AbilityIcon name="paw" color={colors.brand} />
      </View>
      <Text
        variant="h3"
        color="textBrand"
        align="center"
        style={{ fontFamily: fonts.display }}
      >
        Activation du radar félin…
      </Text>
      <Text variant="bodySmall" color="textSecondary" align="center">
        Une seconde — puis on active l’exploration.
      </Text>
    </Animated.View>
  );
}

export default function PermissionsScreen() {
  const { colors, fonts, spacing, radius } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(false);
  /** null = still checking whether we can skip this screen. */
  const [needsPrompt, setNeedsPrompt] = useState<boolean | null>(null);

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)/map');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!onboardingCompleted) {
        if (mounted) setNeedsPrompt(true);
        return;
      }

      const active = await isLocationActive();
      if (!mounted) return;
      setNeedsPrompt(!active);
    })().catch(() => {
      if (mounted) setNeedsPrompt(true);
    });
    return () => {
      mounted = false;
    };
  }, [onboardingCompleted]);

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
      return true;
    }
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
      const cam = onboardingCompleted ? true : await askCamera();
      if (!loc) {
        Alert.alert(
          'Exploration limitée',
          'Active la position pour voir les chats près de toi. Tu pourras aussi l’activer plus tard depuis la carte.',
          [{ text: 'Continuer', onPress: finish }],
        );
        return;
      }
      if (!cam) {
        Alert.alert(
          'Capture plus tard',
          'Tu pourras activer la caméra au moment de capturer. CatDex fonctionne mieux avec.',
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

  const locationOnly = onboardingCompleted;
  const rows = locationOnly
    ? ABILITIES.filter((row) => row.key === 'location')
    : ABILITIES;

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
            {!locationOnly ? (
              <View style={{ gap: spacing[8] }}>
                <Text
                  variant="caption"
                  color="textBrand"
                  align="center"
                  style={{ fontFamily: fonts.bodySemi }}
                >
                  Ensuite…
                </Text>
                <Text variant="caption" color="textSecondary" align="center">
                  Capture ton premier chat · Gagne 30 XP · Débloque ton premier
                  badge
                </Text>
                <OnboardingStepper step={1} labels={['Découverte', 'Prêt !']} />
              </View>
            ) : null}
            <Button
              title={
                locationOnly ? 'Activer l’exploration' : 'Commencer à explorer'
              }
              loading={busy}
              onPress={() => void requestAll()}
            />
            <Button
              variant="tertiary"
              title={locationOnly ? 'Plus tard' : 'Passer pour l’instant'}
              disabled={busy}
              onPress={finish}
            />
          </View>
        }
      >
        {!locationOnly ? <RadarHero /> : null}

        <View style={{ gap: spacing[8], alignItems: 'center' }}>
          <Text variant="label" color="textMuted" align="center">
            {locationOnly ? 'Exploration' : 'Dernière étape'}
          </Text>
          <Text
            variant="h1"
            color="textBrand"
            align="center"
            style={{ fontFamily: fonts.display }}
          >
            {locationOnly
              ? 'Reactive ton radar'
              : 'Prêt pour ta première exploration ?'}
          </Text>
          <Text variant="body" color="textSecondary" align="center">
            {locationOnly
              ? 'La position n’est pas active. Réactive-la pour voir les chats près de toi.'
              : 'Plus qu’une étape avant ton premier chat.'}
          </Text>
        </View>

        {!locationOnly ? (
          <View
            style={{
              gap: spacing[4],
              padding: spacing[16],
              borderRadius: radius.cta,
              backgroundColor: colors.brandSoft,
              alignSelf: 'stretch',
            }}
          >
            <Text
              variant="caption"
              color="textBrand"
              style={{ fontFamily: fonts.bodySemi }}
            >
              Tu pourras immédiatement
            </Text>
            {REWARDS.map((item) => (
              <Text key={item} variant="bodySmall" color="textBody">
                · {item}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          {rows.map((row) => (
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
                borderColor: colors.border,
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
                <AbilityIcon name={row.icon} color={colors[row.tintKey]} />
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
    </View>
  );
}
