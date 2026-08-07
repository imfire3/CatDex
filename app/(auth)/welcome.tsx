import { Redirect, router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';
import { BrandLogo } from '@/components/BrandLogo';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const WELCOME_MAP = require('../../assets/welcome-map-bg.jpg');

/**
 * Welcome — map wallpaper + white auth sheet.
 * No floating cards · no sheet drag handle · clear CTA hierarchy.
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
          colors={['transparent', 'rgba(249,249,251,0.45)', colors.authSheet]}
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
            alignItems: 'center',
            gap: spacing[8],
          },
        ]}
      >
        <BrandLogo size="hero" />
        <Text
          variant="bodySmall"
          align="center"
          style={{
            fontFamily: fonts.bodySemi,
            color: colors.brand,
            textShadowColor: '#FFFFFF',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
          }}
        >
          Ton quartier. Tes chats.
        </Text>
      </Animated.View>

      <Animated.View
        entering={enterSheet}
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
            paddingTop: spacing[32],
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            backgroundColor: colors.authSheet,
            borderTopWidth: 1,
            borderColor: colors.border,
          },
          shadow.floating,
        ]}
      >
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
            onPress={() => router.push('/(auth)/join')}
          />
          <Button
            variant="secondary"
            title="J’ai déjà un compte"
            onPress={() => router.push('/(auth)/login')}
          />
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
  sheet: {
    marginTop: 'auto',
    zIndex: 5,
  },
});

const mapWebStyle = {
  objectFit: 'cover' as const,
  objectPosition: 'center 40%',
};
