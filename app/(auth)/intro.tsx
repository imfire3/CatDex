import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingStepper } from '@/components/Auth/OnboardingStepper';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const STEPS = [
  {
    key: 'location',
    title: 'Localisation',
    body: 'Vois les chats autour de toi et les quartiers à explorer.',
    softKey: 'brandSoft' as const,
    tintKey: 'brand' as const,
    icon: 'location' as const,
    badge: 'recommended' as const,
  },
  {
    key: 'camera',
    title: 'Caméra',
    body: 'Photographie et analyse les chats que tu rencontres.',
    softKey: 'orangeSoft' as const,
    tintKey: 'orange' as const,
    icon: 'camera' as const,
    badge: 'recommended' as const,
  },
  {
    key: 'notifications',
    title: 'Notifications',
    body: 'Ne manque aucun chat rare ni tes récompenses.',
    softKey: 'roseSoft' as const,
    tintKey: 'rose' as const,
    icon: 'bell' as const,
    badge: 'optional' as const,
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

function ShieldIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5 5.5 6.25v5.1c0 4.2 2.85 7.95 6.5 9.15 3.65-1.2 6.5-4.95 6.5-9.15v-5.1L12 3.5Z"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 12.25 11.25 14l3.5-3.75"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5.5"
        y="10.5"
        width="13"
        height="9.5"
        rx="2"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Path
        d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
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
      scroll
      sheetStyle={{ backgroundColor: colors.surface }}
      footer={
        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          <OnboardingStepper step={0} />
          <Button
            title="Continuer"
            onPress={() => router.push('/(auth)/permissions')}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[8], alignItems: 'center' }}>
        <Text variant="label" color="textMuted" align="center">
          Découvre CatDex
        </Text>
        <Text variant="h1" color="textBrand" align="center">
          CatDex en 3 gestes
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          Salut {user.displayName} — voici l’essentiel avant de partir explorer.
        </Text>
      </View>

      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          gap: spacing[24],
        }}
      >
        <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
          {STEPS.map((step) => (
            <View
              key={step.key}
              style={{
                gap: spacing[8],
                padding: spacing[16],
                borderRadius: radius.cta,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[16],
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
                    flexShrink: 0,
                  }}
                >
                  <StepIcon name={step.icon} color={colors[step.tintKey]} />
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing[8],
                    minWidth: 0,
                  }}
                >
                  <Text variant="h3" color="text" style={{ flexShrink: 1 }}>
                    {step.title}
                  </Text>
                  {step.badge === 'recommended' ? (
                    <Badge label="Recommandé" variant="success" />
                  ) : (
                    <Badge
                      label="Optionnel"
                      color={colors.textSecondary}
                      backgroundColor={colors.surfaceSecondary}
                    />
                  )}
                </View>
              </View>

              <Text
                variant="bodySmall"
                color="textSecondary"
                style={{ marginLeft: spacing[48] + spacing[16] }}
              >
                {step.body}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[16],
            paddingVertical: spacing[16],
            paddingHorizontal: spacing[16],
            borderRadius: radius.md,
            backgroundColor: colors.brandSoft,
            alignSelf: 'stretch',
          }}
        >
          <ShieldIcon color={colors.brand} />
          <Text variant="bodySmall" color="textBody" style={{ flex: 1 }}>
            Tes données restent privées. Tu gardes le contrôle.
          </Text>
          <LockIcon color={colors.brand} />
        </View>
      </View>
    </AuthShell>
  );
}
