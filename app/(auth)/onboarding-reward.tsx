import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AddToHomeScreenSheet } from '@/components/AddToHomeScreenSheet';
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
import { SupportProjectModal } from '@/components/SupportProjectModal';
import { requestQuickLocationFix } from '@/lib/locationAccess';
import {
  getHomeScreenOfferKind,
  type HomeScreenOfferKind,
} from '@/lib/pwaInstall';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const LOADER_MIN_MS = 900;
const QUICK_GPS_MS = 2_500;

/** Onboarding 3/3 — le chat rejoint la collection, puis entrée map. */
export default function OnboardingRewardScreen() {
  const { colors, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [entering, setEntering] = useState(false);
  const [installKind, setInstallKind] = useState<Exclude<HomeScreenOfferKind, 'none'> | null>(
    null,
  );
  const [showSupport, setShowSupport] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted && !entering && !installKind && !showSupport) {
    return <Redirect href="/(tabs)/map" />;
  }

  const enterMap = async () => {
    setInstallKind(null);
    setShowSupport(false);
    setEntering(true);
    completeOnboarding();
    await new Promise((resolve) => setTimeout(resolve, LOADER_MIN_MS));
    router.replace('/(tabs)/map');
  };

  const offerSupportThenMap = () => {
    setInstallKind(null);
    setShowSupport(true);
  };

  const handleStartCollection = async () => {
    // User gesture: unlock a short GPS fix (avoids long hangs / stale errors).
    await requestQuickLocationFix(QUICK_GPS_MS);

    const offer = await getHomeScreenOfferKind();
    if (offer !== 'none') {
      setInstallKind(offer);
      return;
    }

    offerSupportThenMap();
  };

  if (entering) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BrandLoader label="Bienvenue dans ton quartier…" />
      </View>
    );
  }

  return (
    <>
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
              subtitle="On active ta position rapidement, puis la carte"
              onPress={() => {
                void handleStartCollection();
              }}
            />
          </View>
        }
      >
        <View style={{ flexGrow: 1, minHeight: 520 }}>
          <RewardScene />
        </View>
      </AuthShell>

      {installKind ? (
        <AddToHomeScreenSheet
          visible
          kind={installKind}
          onContinue={offerSupportThenMap}
        />
      ) : null}

      <SupportProjectModal
        visible={showSupport}
        onContinue={() => {
          void enterMap();
        }}
      />
    </>
  );
}
