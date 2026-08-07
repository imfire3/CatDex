import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthShell } from '@/components/Auth/AuthShell';
import { OnboardingStepper } from '@/components/Auth/OnboardingStepper';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const POWERS = [
  {
    key: 'explore',
    title: 'Explorer',
    body: 'Repère les chats près de toi.',
    hook: 'Belleville : 14 chats repérés aujourd’hui',
    softKey: 'brandSoft' as const,
    tintKey: 'brand' as const,
    icon: 'paw' as const,
    badge: 'recommended' as const,
  },
  {
    key: 'capture',
    title: 'Capturer',
    body: 'Analyse automatiquement chaque rencontre.',
    hook: 'Premier chat garanti en quelques minutes',
    softKey: 'orangeSoft' as const,
    tintKey: 'orange' as const,
    icon: 'capture' as const,
    badge: 'recommended' as const,
  },
  {
    key: 'collect',
    title: 'Collectionner',
    body: 'Construis le plus grand CatDex du quartier.',
    hook: 'Certaines espèces n’apparaissent qu’à certaines heures',
    softKey: 'roseSoft' as const,
    tintKey: 'rose' as const,
    icon: 'star' as const,
    badge: 'optional' as const,
  },
];

function PowerIcon({
  name,
  color,
}: {
  name: (typeof POWERS)[number]['icon'];
  color: string;
}) {
  if (name === 'paw') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 18.5c-2.6 0-4.7-1.4-4.7-2.8 0-.8.9-1.2 1.8-.9.6.2 1.4.4 2.9.4s2.3-.2 2.9-.4c.9-.3 1.8.1 1.8.9 0 1.4-2.1 2.8-4.7 2.8Z"
          fill={color}
        />
        <Circle cx="7.2" cy="11.2" r="1.9" fill={color} />
        <Circle cx="16.8" cy="11.2" r="1.9" fill={color} />
        <Circle cx="9.4" cy="7.4" r="1.7" fill={color} />
        <Circle cx="14.6" cy="7.4" r="1.7" fill={color} />
      </Svg>
    );
  }

  if (name === 'capture') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
        <Path d="M3 12h18" stroke={color} strokeWidth={2} />
        <Circle cx="12" cy="12" r="3.2" fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.2 13.9 8.6l5.7.5-4.3 3.7 1.3 5.5L12 15.6 7.4 18.3l1.3-5.5L4.4 9.1l5.7-.5L12 3.2Z"
        fill={color}
      />
    </Svg>
  );
}

export default function IntroScreen() {
  const { colors, fonts, spacing, radius } = useTheme();
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
          <Button
            title="Commencer l’aventure"
            onPress={() => router.push('/(auth)/permissions')}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[8], alignItems: 'center' }}>
        <Text variant="label" color="textMuted" align="center">
          Prêt à jouer
        </Text>
        <Text
          variant="h1"
          color="textBrand"
          align="center"
          style={{ fontFamily: fonts.display }}
        >
          Ton aventure commence ici
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          Plus de 500 chats à découvrir dans ta ville.
        </Text>
      </View>

      <View style={{ gap: spacing[8], alignSelf: 'stretch' }}>
        {POWERS.map((power) => (
          <View
            key={power.key}
            style={{
              gap: spacing[4],
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
                  backgroundColor: colors[power.softKey],
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PowerIcon name={power.icon} color={colors[power.tintKey]} />
              </View>

              <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing[8],
                  }}
                >
                  <Text variant="h3" color="text" style={{ flexShrink: 1 }}>
                    {power.title}
                  </Text>
                  {power.badge === 'recommended' ? (
                    <Badge label="Recommandé" variant="success" />
                  ) : (
                    <Badge
                      label="Optionnel"
                      color={colors.textSecondary}
                      backgroundColor={colors.surfaceSecondary}
                    />
                  )}
                </View>
                <Text variant="bodySmall" color="textSecondary">
                  {power.body}
                </Text>
                <Text
                  variant="caption"
                  color="textBrand"
                  style={{ fontFamily: fonts.bodySemi }}
                >
                  {power.hook}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text variant="caption" color="textMuted" align="center">
        247 chats découverts aujourd’hui · Déjà 3 412 explorateurs
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[8],
          paddingVertical: spacing[4],
          alignSelf: 'stretch',
        }}
      >
        <Text variant="caption" color="textMuted" align="center">
          Tes données restent privées. Tu gardes le contrôle.
        </Text>
      </View>
    </AuthShell>
  );
}
