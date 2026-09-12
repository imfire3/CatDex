import { Redirect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import {
  BrandLoader,
  PrimaryCTA,
  ProgressDots,
  RewardScene,
  ScanScene,
  SightingScene,
} from '@/components/Auth/Onboarding';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const ENTER_MAP_MS = 900;

const STEPS = [
  {
    title: 'Voir la carte',
    subtitle: 'Belleville · 150 m — un chat t’attend au coin de la rue',
    Scene: SightingScene,
  },
  {
    title: 'Photographier',
    subtitle: 'Lumière de face · un seul chat · yeux visibles',
    Scene: ScanScene,
  },
  {
    title: 'Retourner à la carte',
    subtitle: 'Miel est dans ton CatDex — la collection commence',
    Scene: RewardScene,
  },
] as const;

/** Three post-auth beats — map, photo, CatDex — then the real map. */
export default function IntroScreen() {
  const { colors, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [entering, setEntering] = useState(false);

  const handleNext = useCallback(async () => {
    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    setEntering(true);
    await new Promise((resolve) => setTimeout(resolve, ENTER_MAP_MS));
    completeOnboarding();
    router.replace('/(tabs)/map');
  }, [completeOnboarding, step]);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted && !entering) {
    return <Redirect href="/(tabs)/map" />;
  }

  if (entering) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BrandLoader label="Bienvenue dans ton quartier…" />
      </View>
    );
  }

  const current = STEPS[step];
  const Scene = current.Scene;

  return (
    <AuthShell
      plain
      fullHeight
      scroll
      sheetStyle={{ backgroundColor: colors.background, paddingHorizontal: 0 }}
      footer={
        <View
          style={{
            gap: spacing[16],
            alignSelf: 'stretch',
            paddingHorizontal: spacing[24],
          }}
        >
          <ProgressDots
            step={step}
            total={STEPS.length}
            labels={['Carte', 'Photo', 'CatDex']}
          />
          <PrimaryCTA
            title={current.title}
            subtitle={current.subtitle}
            onPress={() => {
              void handleNext();
            }}
          />
        </View>
      }
    >
      <View style={{ flexGrow: 1, minHeight: 640 }}>
        <Scene />
      </View>
    </AuthShell>
  );
}
