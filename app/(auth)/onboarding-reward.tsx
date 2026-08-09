import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import { PrimaryCTA, ProgressDots, RewardScene } from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

/** Onboarding 3/3 — le chat rejoint la collection. */
export default function OnboardingRewardScreen() {
  const { colors, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
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
            step={2}
            total={ONBOARDING_STEP_COUNT}
            labels={[...ONBOARDING_STEP_LABELS]}
          />
          <PrimaryCTA
            title="Commencer ma collection"
            subtitle="Première capture en moins de 2 minutes"
            onPress={() => router.push('/(auth)/permission-camera')}
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
