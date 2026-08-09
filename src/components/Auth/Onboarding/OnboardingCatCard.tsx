import { Image, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

import { DEMO_CAT_IMAGE, DEMO_ONBOARDING_CAT } from './demoCat';

type OnboardingCatCardProps = {
  /** Slightly larger hero card (sighting) vs compact (reward). */
  size?: 'hero' | 'compact';
  showMeta?: boolean;
};

/**
 * Pokémon-style CatDex card — photo window, name, #id, rarity.
 * Photo only (no baked welcome UI).
 */
export function OnboardingCatCard({
  size = 'hero',
  showMeta = true,
}: OnboardingCatCardProps) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const isHero = size === 'hero';
  const cardW = isHero ? spacing[96] + spacing[80] + spacing[16] : spacing[96] + spacing[80];
  const photoH = isHero ? spacing[96] + spacing[64] : spacing[96] + spacing[48];

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Carte CatDex de ${DEMO_ONBOARDING_CAT.name}, ${DEMO_ONBOARDING_CAT.rarity}`}
      style={[
        {
          width: cardW,
          borderRadius: radius.cta,
          overflow: 'hidden',
          backgroundColor: colors.surfaceElevated,
          borderWidth: 2,
          borderColor: colors.brandSoft,
        },
        shadow.floating,
      ]}
    >
      <View
        style={{
          margin: spacing[8],
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: colors.brandSoft,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ height: photoH, backgroundColor: colors.surfaceSecondary }}>
          <Image
            source={DEMO_CAT_IMAGE}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            accessibilityIgnoresInvertColors
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: spacing[40],
              backgroundColor: colors.text,
              opacity: 0.45,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingHorizontal: spacing[8],
              paddingBottom: spacing[8],
            }}
          >
            <Text variant="caption" color="onAccent" style={{ fontFamily: fonts.bodySemi }}>
              #{String(DEMO_ONBOARDING_CAT.number).padStart(3, '0')}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: spacing[16],
          paddingBottom: spacing[16],
          paddingTop: spacing[4],
          gap: spacing[8],
          alignItems: 'center',
        }}
      >
        <Text variant={isHero ? 'h2' : 'h3'} color="text" style={{ fontFamily: fonts.display }}>
          {DEMO_ONBOARDING_CAT.name}
        </Text>
        <View
          style={{
            paddingVertical: spacing[4],
            paddingHorizontal: spacing[16],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
          }}
        >
          <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
            {DEMO_ONBOARDING_CAT.rarity}
          </Text>
        </View>
        {showMeta ? (
          <Text variant="caption" color="textSecondary" align="center">
            {DEMO_ONBOARDING_CAT.breed} · {DEMO_ONBOARDING_CAT.color}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
