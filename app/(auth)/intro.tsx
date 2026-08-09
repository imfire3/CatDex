import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import { PrimaryCTA, ProgressDots, SightingScene } from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

/** Onboarding 1/4 — tu sors te promener… */
export default function IntroScreen() {
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
            step={0}
            total={ONBOARDING_STEP_COUNT}
            labels={[...ONBOARDING_STEP_LABELS]}
          />
          <PrimaryCTA
            title="Continuer"
            subtitle="Quelque chose bouge près de toi."
            onPress={() => router.push('/(auth)/onboarding-photo')}
          />
        </View>
      }
    >
      <View style={{ flexGrow: 1, minHeight: 520 }}>
        <SightingScene />
      </View>
    </AuthShell>
  );
}
