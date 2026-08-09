import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import {
  BrandLoader,
  PrimaryCTA,
  ProgressDots,
  RewardScene,
} from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const LOADER_MIN_MS = 900;

/** Onboarding 4/4 — bienvenue dans ton CatDex, puis entrée map. */
export default function OnboardingRewardScreen() {
  const { colors, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [entering, setEntering] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted && !entering) {
    return <Redirect href="/(tabs)/map" />;
  }

  const enterMap = async () => {
    setEntering(true);
    completeOnboarding();
    await new Promise((resolve) => setTimeout(resolve, LOADER_MIN_MS));
    router.replace('/(tabs)/map');
  };

  if (entering) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BrandLoader label="Bienvenue dans ton quartier…" />
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
        <View style={{ gap: spacing[16], alignSelf: 'stretch' }}>
          <ProgressDots
            step={3}
            total={ONBOARDING_STEP_COUNT}
            labels={[...ONBOARDING_STEP_LABELS]}
          />
          <PrimaryCTA
            title="Entrer dans mon CatDex"
            subtitle="Les autorisations arriveront au bon moment"
            onPress={() => {
              void enterMap();
            }}
          />
        </View>
      }
    >
      <View style={{ flexGrow: 1, minHeight: 520 }}>
        <RewardScene />
      </View>
    </AuthShell>
  );
}
