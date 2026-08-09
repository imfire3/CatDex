import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import {
  FloatingPreviewCard,
  OnboardingHero,
  PrimaryCTA,
  ProgressDots,
  RewardChips,
} from '@/components/Auth/Onboarding';
import {
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STEP_LABELS,
} from '@/components/Auth/OnboardingStepper';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Pre-permission story — rewards + compact preview cascade.
 * Continues to dedicated camera then GPS authorization screens.
 */
export default function PermissionsScreen() {
  const { colors, fonts, spacing } = useTheme();
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
            title="Capturer mon premier chat"
            onPress={() => router.push('/(auth)/permission-camera')}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[40], alignSelf: 'stretch', paddingBottom: spacing[16] }}>
        <OnboardingHero
          title="Plus qu’un pas"
          description="Autorise caméra et position.\nTon premier chat est tout près."
        />

        <View style={{ gap: spacing[16], alignItems: 'center', alignSelf: 'stretch' }}>
          <FloatingPreviewCard variant="sighting" delay={80} />
          <Text variant="caption" color="textBrand" align="center" style={{ fontFamily: fonts.bodySemi }}>
            ↓
          </Text>
          <FloatingPreviewCard variant="analysis" delay={180} />
          <Text variant="caption" color="textBrand" align="center" style={{ fontFamily: fonts.bodySemi }}>
            ↓
          </Text>
          <FloatingPreviewCard variant="dex" delay={280} float={false} />
        </View>

        <RewardChips />
      </View>
    </AuthShell>
  );
}
