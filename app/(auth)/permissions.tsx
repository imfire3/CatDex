import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import { PrimaryCTA, ProgressDots, ScanScene } from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

/** Onboarding 2/3 — révélation IA live. */
export default function PermissionsScreen() {
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
            step={1}
            total={ONBOARDING_STEP_COUNT}
            labels={[...ONBOARDING_STEP_LABELS]}
          />
          <PrimaryCTA
            title="Trouver mon premier chat"
            subtitle="L’IA s’occupe du reste"
            onPress={() => router.push('/(auth)/onboarding-reward')}
          />
        </View>
      }
    >
      <View style={{ flexGrow: 1, minHeight: 520 }}>
        <ScanScene />
      </View>
    </AuthShell>
  );
}
