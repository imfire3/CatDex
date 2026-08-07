import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingStepper } from '@/components/Auth/OnboardingStepper';
import {
  OnboardingPulseCta,
  OnboardingRadarHero,
  OnboardingRewardRow,
  OnboardingScanPreview,
  OnboardingSightingPreview,
} from '@/components/Auth/OnboardingVisuals';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Pre-permission story — rewards scroll with content (not sticky).
 * Continues to dedicated camera then GPS authorization screens.
 */
export default function PermissionsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const skip = () => {
    completeOnboarding();
    router.replace('/(tabs)/map');
  };

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
          <OnboardingStepper step={1} labels={['Découverte', 'Prêt !']} />
          <OnboardingPulseCta>
            <Button
              title="Continuer"
              onPress={() => router.push('/(auth)/permission-camera')}
            />
          </OnboardingPulseCta>
          <Button variant="tertiary" title="Plus tard" onPress={skip} />
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
          Plus qu’un pas avant ton premier chat
        </Text>
        <Text variant="body" color="textBody" align="center">
          Ensuite, autorise la caméra et ta position pour découvrir les chats autour de toi.
        </Text>
      </View>

      <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
        <OnboardingSightingPreview />
        <OnboardingScanPreview />
      </View>

      <OnboardingRewardRow
        items={[
          { value: '+30 XP', label: 'Première découverte' },
          { value: 'Badge', label: 'Photographe' },
          { value: 'CatDex', label: 'Débloqué' },
        ]}
      />
    </AuthShell>
  );
}
