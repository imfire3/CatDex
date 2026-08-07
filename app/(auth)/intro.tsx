import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingStepper } from '@/components/Auth/OnboardingStepper';
import {
  OnboardingMiniDexPreview,
  OnboardingPulseCta,
  OnboardingRadarHero,
  OnboardingScanPreview,
  OnboardingSightingPreview,
  OnboardingStoryBeat,
} from '@/components/Auth/OnboardingVisuals';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function IntroScreen() {
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
        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          <OnboardingStepper step={0} labels={['Découverte', 'Prêt !']} />
          <OnboardingPulseCta>
            <Button
              title="Commencer l’exploration"
              onPress={() => router.push('/(auth)/permissions')}
            />
          </OnboardingPulseCta>
          <Text
            variant="caption"
            color="textBrand"
            align="center"
            style={{ fontFamily: fonts.bodySemi }}
          >
            Premier chat en moins de 5 minutes.
          </Text>
        </View>
      }
    >
      <OnboardingRadarHero />

      <View style={{ gap: spacing[8], alignItems: 'center' }}>
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          Ton premier chat t’attend
        </Text>
        <Text variant="body" color="textBody" align="center">
          En quelques secondes, ton premier compagnon rejoindra ton CatDex.
        </Text>
      </View>

      <View style={{ gap: spacing[4], alignSelf: 'stretch' }}>
        <OnboardingStoryBeat label="Tu repères un chat" delay={60}>
          <OnboardingSightingPreview />
        </OnboardingStoryBeat>
        <OnboardingStoryBeat label="Il se révèle à toi" delay={130}>
          <OnboardingScanPreview />
        </OnboardingStoryBeat>
        <OnboardingStoryBeat label="Il rejoint ton CatDex" delay={200} showConnector={false}>
          <OnboardingMiniDexPreview />
        </OnboardingStoryBeat>
      </View>
    </AuthShell>
  );
}
