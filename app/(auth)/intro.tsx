import { Redirect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import { BrandLoader, PrimaryCTA, SightingScene } from '@/components/Auth/Onboarding';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const ENTER_MAP_MS = 900;

/** Single post-auth beat — then the map. GPS and camera wait for in-map gestures. */
export default function IntroScreen() {
  const { colors, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [entering, setEntering] = useState(false);

  const handleExplore = useCallback(async () => {
    setEntering(true);
    await new Promise((resolve) => setTimeout(resolve, ENTER_MAP_MS));
    completeOnboarding();
    router.replace('/(tabs)/map');
  }, [completeOnboarding]);

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
          <PrimaryCTA
            title="Voir la carte"
            subtitle="Photographie le premier chat que tu croises — GPS et caméra au moment du geste"
            onPress={() => {
              void handleExplore();
            }}
          />
        </View>
      }
    >
      <View style={{ flexGrow: 1, minHeight: 640 }}>
        <SightingScene />
      </View>
    </AuthShell>
  );
}
