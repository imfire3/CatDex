import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import {
  DiscoveryTimeline,
  OnboardingHero,
  PrimaryCTA,
  ProgressDots,
} from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

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
      sheetStyle={{ backgroundColor: colors.background }}
      footer={
        <View style={{ gap: spacing[16], alignSelf: 'stretch' }}>
          <ProgressDots
            step={0}
            total={ONBOARDING_STEP_COUNT}
            labels={[...ONBOARDING_STEP_LABELS]}
          />
          <PrimaryCTA
            title="Commencer l’aventure"
            onPress={() => router.push('/(auth)/permissions')}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[40], alignSelf: 'stretch', paddingBottom: spacing[16] }}>
        <OnboardingHero />
        <DiscoveryTimeline />
      </View>
    </AuthShell>
  );
}
