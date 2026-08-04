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
    key: 'location',
    title: 'Localisation',
    body: 'Voir les chats autour de toi et les quartiers à explorer.',
    softKey: 'skySoft' as const,
    tintKey: 'sky' as const,
    icon: 'location' as const,
  },
  {
    key: 'camera',
    title: 'Caméra',
    body: 'Photographie et analyse les chats que tu rencontres.',
    softKey: 'skySoft' as const,
    tintKey: 'sky' as const,
    icon: 'camera' as const,
  },
  {
    key: 'notifications',
    title: 'Notifications',
    body: 'Ne manque aucun chat rare ni tes récompenses.',
    softKey: 'roseSoft' as const,
    tintKey: 'rose' as const,
    icon: 'bell' as const,
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

  if (name === 'location') {
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
          d="M4 9.5V8a2 2 0 0 1 2-2h1.5l1-1.5h7L16.5 6H18a2 2 0 0 1 2 2v1.5"
          stroke={color}
          strokeWidth={iconStroke.regular}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect
          x="4"
          y="9.5"
          width="16"
          height="10.5"
          rx="2"
          stroke={color}
          strokeWidth={iconStroke.regular}
        />
        <Circle cx="12" cy="14.5" r="2.75" stroke={color} strokeWidth={iconStroke.regular} />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5a1.75 1.75 0 0 1 1.75 1.58V6.5h2.5A2.25 2.25 0 0 1 18.25 8.75v8.5A2.25 2.25 0 0 1 16 19.5H8A2.25 2.25 0 0 1 5.75 17.25v-8.5A2.25 2.25 0 0 1 8 6.5h2.5V5.08A1.75 1.75 0 0 1 12 3.5Z"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinejoin="round"
      />
      <Path
        d="M10.25 17.25h3.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function IntroScreen() {
  const { colors, spacing, radius } = useTheme();
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
      footer={
        <View style={{ alignSelf: 'stretch' }}>
          <Button
            title="Continuer"
            onPress={() => router.push('/(auth)/permissions')}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[8] }}>
        <Text variant="label" color="textMuted">
          Comment ça marche
        </Text>
        <Text variant="h1" color="textBrand">
          CatDex en 3 gestes
        </Text>
        <Text variant="body" color="textSecondary">
          Salut {user.displayName} — voici l’essentiel avant de partir explorer.
        </Text>
      </View>

      <View style={{ gap: spacing[8] }}>
        {STEPS.map((step) => (
          <View
            key={step.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[16],
              padding: spacing[16],
              borderRadius: radius.cta,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.ctaSecondaryBorder,
            }}
          >
            <View
              style={{
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.full,
                backgroundColor: colors[step.softKey],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StepIcon name={step.icon} color={colors[step.tintKey]} />
            </View>

            <View style={{ flex: 1, gap: spacing[4] }}>
              <Text variant="h3" color="text">
                {step.title}
              </Text>
              <Text variant="bodySmall" color="textSecondary">
                {step.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </AuthShell>
  );
}
