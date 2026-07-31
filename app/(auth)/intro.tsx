import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const STEPS = [
  {
    key: 'explore',
    title: 'Explore ton quartier',
    body: 'La carte montre les chats autour de toi. Filtre par proximité, rareté ou déjà vus.',
    softKey: 'skySoft' as const,
    tintKey: 'sky' as const,
    icon: 'map' as const,
  },
  {
    key: 'capture',
    title: 'Capture avec la caméra',
    body: 'Photographie un chat : l’IA le décrit (couleur, race, robe) et te propose un nom.',
    softKey: 'orangeSoft' as const,
    tintKey: 'orange' as const,
    icon: 'camera' as const,
  },
  {
    key: 'collect',
    title: 'Remplis ton CatDex',
    body: 'Chaque capture rejoint ta collection. Relis les fiches, gagne des missions, progresse.',
    softKey: 'mintSoft' as const,
    tintKey: 'mint' as const,
    icon: 'book' as const,
  },
];

function StepIcon({
  name,
  color,
}: {
  name: (typeof STEPS)[number]['icon'];
  color: string;
}) {
  const { iconStroke } = useTheme();
  if (name === 'map') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
          stroke={color}
          strokeWidth={iconStroke.regular}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={iconStroke.regular} />
      </Svg>
    );
  }
  if (name === 'camera') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
          stroke={color}
          strokeWidth={iconStroke.regular}
          strokeLinecap="round"
        />
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={iconStroke.regular} />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="3.5"
        width="16"
        height="17"
        rx="2.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Path
        d="M8 9h8M8 13h5"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function IntroScreen() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/map" />;
  }

  return (
    <AuthShell>
      <View style={{ gap: spacing[8] }}>
        <Text variant="label" color="textMuted">
          Comment ça marche
        </Text>
        <Text variant="h1" color="textBrand" style={{ fontFamily: fonts.display }}>
          CatDex en 3 gestes
        </Text>
        <Text variant="body" color="textSecondary">
          Salut {user.displayName} — voici l’essentiel avant de partir explorer.
        </Text>
      </View>

      <View style={{ gap: spacing[16] }}>
        {STEPS.map((step, index) => (
          <View
            key={step.key}
            style={[
              {
                flexDirection: 'row',
                gap: spacing[16],
                padding: spacing[16],
                borderRadius: radius.lg,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.borderDefault,
              },
              shadow.low,
            ]}
          >
            <View
              style={{
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.md,
                backgroundColor: colors[step.softKey],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StepIcon name={step.icon} color={colors[step.tintKey]} />
            </View>
            <View style={{ flex: 1, gap: spacing[4] }}>
              <Text
                variant="caption"
                color="textMuted"
                style={{ fontFamily: fonts.bodySemi }}
              >
                {index + 1} / {STEPS.length}
              </Text>
              <Text variant="h3" color="textBrand">
                {step.title}
              </Text>
              <Text variant="bodySmall" color="textSecondary">
                {step.body}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Button title="Continuer" onPress={() => router.push('/(auth)/permissions')} />
    </AuthShell>
  );
}
