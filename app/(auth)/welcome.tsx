import { Redirect, router } from 'expo-router';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const WELCOME_MAP = require('../../assets/welcome-map-bg.jpg');

const FLOATING_CARDS: {
  source: ImageSourcePropType;
  dex: string;
  name: string;
  tint: string;
  rotate: string;
  side: 'left' | 'right';
  top: 'safe' | 'mid';
}[] = [
  {
    source: require('../../assets/welcome-cat.jpg'),
    dex: '#003',
    name: 'Moka',
    tint: '#E8F8F2',
    rotate: '-10deg',
    side: 'left',
    top: 'safe',
  },
  {
    source: require('../../assets/welcome-hero.jpg'),
    dex: '#007',
    name: 'Nori',
    tint: '#EAF6FC',
    rotate: '8deg',
    side: 'right',
    top: 'safe',
  },
  {
    source: require('../../assets/welcome-cat.png'),
    dex: '#012',
    name: 'Pacha',
    tint: '#FFF3EC',
    rotate: '-6deg',
    side: 'left',
    top: 'mid',
  },
];

function MiniCollectible({
  source,
  dex,
  name,
  tint,
  rotate,
  width,
}: {
  source: ImageSourcePropType;
  dex: string;
  name: string;
  tint: string;
  rotate: string;
  width: number;
}) {
  const { fonts, spacing, radius, colors } = useTheme();

  return (
    <View
      style={[
        {
          width,
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          transform: [{ rotate }],
        },
      ]}
    >
      <View style={{ aspectRatio: 1, backgroundColor: tint, padding: spacing[8] }}>
        <Image
          source={source}
          resizeMode="cover"
          style={{ width: '100%', height: '100%', borderRadius: radius.md }}
        />
        <View
          style={{
            position: 'absolute',
            top: spacing[8],
            left: spacing[8],
            paddingHorizontal: spacing[8],
            paddingVertical: spacing[4],
            borderRadius: radius.full,
            backgroundColor: colors.surface,
          }}
        >
          <Text variant="caption" color="accent" style={{ fontFamily: fonts.bodySemi }}>
            {dex}
          </Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: spacing[8], paddingVertical: spacing[8] }}>
        <Text
          variant="caption"
          color="textBrand"
          style={{
            fontFamily: fonts.bodySemi,
            textTransform: 'uppercase',
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    </View>
  );
}

/**
 * Welcome — immersive CatDex map world as wallpaper + white auth sheet.
 * Inspired by the Pokémon GO–style map mock (not a 1:1 copy).
 */
export default function WelcomeScreen() {
  const { colors, fonts, spacing, radius, motion, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const enter = reduceMotion ? undefined : FadeIn.duration(motion.duration.slow);
  const enterBrand = reduceMotion
    ? undefined
    : FadeInDown.delay(80).duration(motion.duration.slow);
  const enterSheet = reduceMotion
    ? undefined
    : FadeInUp.delay(160).duration(motion.duration.normal);

  const cardWidth = spacing[96];
  const slow = motion.duration.slow;

  return (
    <View style={[styles.root, { backgroundColor: colors.sky }]}>
      <Animated.View entering={enter} style={StyleSheet.absoluteFill}>
        <Image
          source={WELCOME_MAP}
          resizeMode="cover"
          style={[styles.map, mapWebStyle as object]}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'transparent', 'transparent']}
          style={[styles.topVeil, { height: insets.top + spacing[96] }]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.45)', '#FFFFFF']}
          style={styles.bottomVeil}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.View
        entering={enterBrand}
        pointerEvents="none"
        style={[
          styles.brand,
          {
            paddingTop: insets.top + spacing[16],
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <Text
          variant="display"
          align="center"
          style={{
            fontFamily: fonts.display,
            color: colors.brand,
            textShadowColor: '#FFFFFF',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 8,
          }}
        >
          CatDex
        </Text>
        <Text
          variant="bodySmall"
          align="center"
          style={{
            fontFamily: fonts.bodySemi,
            color: colors.brand,
            marginTop: spacing[4],
            textShadowColor: '#FFFFFF',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
          }}
        >
          Ton quartier. Tes chats.
        </Text>
      </Animated.View>

      <View
        pointerEvents="none"
        style={[
          styles.deck,
          {
            top: insets.top + spacing[96],
            left: spacing[16],
            right: spacing[16],
            bottom: spacing[96] * 2 + spacing[48],
          },
        ]}
      >
        {FLOATING_CARDS.map((card, index) => (
          <Animated.View
            key={card.dex}
            entering={
              reduceMotion ? undefined : FadeInDown.delay(120 + index * 80).duration(slow)
            }
            style={[
              styles.cardAbs,
              {
                top: card.top === 'safe' ? 0 : spacing[96] + spacing[16],
                left: card.side === 'left' ? 0 : undefined,
                right: card.side === 'right' ? 0 : undefined,
                zIndex: index + 1,
              },
            ]}
          >
            <MiniCollectible
              source={card.source}
              dex={card.dex}
              name={card.name}
              tint={card.tint}
              rotate={card.rotate}
              width={cardWidth}
            />
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={enterSheet}
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
            paddingTop: spacing[24],
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderColor: colors.border,
          },
          shadow.floating,
        ]}
      >
        <View
          style={{
            alignSelf: 'center',
            width: spacing[40],
            height: spacing[4],
            borderRadius: radius.full,
            backgroundColor: colors.borderDefault,
            marginBottom: spacing[16],
          }}
        />
        <View style={{ gap: spacing[8], marginBottom: spacing[24] }}>
          <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
            Commence ta collection
          </Text>
          <Text variant="body" color="textSecondary">
            Explore la carte, capture des chats et remplis ton CatDex.
          </Text>
        </View>

        <View style={{ gap: spacing[8] }}>
          <Button
            title="Créer un compte"
            onPress={() => router.push('/(auth)/signup')}
          />
          <Button
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            accessibilityLabel="J’ai déjà un compte"
          >
            <Text
              variant="body"
              style={{ fontFamily: fonts.bodySemi, color: colors.brand }}
            >
              J’ai déjà un compte
            </Text>
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  topVeil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomVeil: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '48%',
  },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
    alignItems: 'center',
  },
  deck: {
    position: 'absolute',
    zIndex: 3,
  },
  cardAbs: {
    position: 'absolute',
  },
  sheet: {
    marginTop: 'auto',
    zIndex: 5,
  },
});

const mapWebStyle = {
  objectFit: 'cover' as const,
  objectPosition: 'center 40%',
};
