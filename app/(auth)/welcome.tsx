import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';
import { BrandLogo } from '@/components/BrandLogo';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const WELCOME_MAP = require('../../assets/welcome-paris-bg-v2.jpg');
const WELCOME_CAT = require('../../assets/welcome-cat.jpg');
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * Welcome — map wallpaper + white auth sheet.
 * Typography: title (tagline) · headline · body · button · link.
 */
export default function WelcomeScreen() {
  const { colors, spacing, radius, motion, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const [heroSource, setHeroSource] = useState<ImageSourcePropType>(WELCOME_MAP);

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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View entering={enter} style={styles.heroWrap} pointerEvents="none">
        <ImageBackground
          source={heroSource}
          resizeMode="cover"
          style={styles.heroImage}
          imageStyle={styles.heroImageInner}
          onError={() => {
            if (heroSource !== WELCOME_CAT) setHeroSource(WELCOME_CAT);
          }}
          accessibilityRole="image"
          accessibilityLabel="Carte du quartier CatDex"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.45)', 'transparent', 'transparent']}
            style={[styles.topVeil, { height: insets.top + spacing[96] }]}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', 'rgba(249,249,251,0.35)', colors.authSheet]}
            style={styles.bottomVeil}
            pointerEvents="none"
          />
        </ImageBackground>
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
      </Animated.View>

      <Animated.View
        entering={enterSheet}
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, spacing[32]),
            paddingHorizontal: spacing[24],
            paddingTop: spacing[32],
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            backgroundColor: colors.authSheet,
            borderTopWidth: 1,
            borderColor: colors.border,
          },
          shadow.floating,
        ]}
      >
        <View style={{ gap: spacing[8], marginBottom: spacing[32] }}>
          <Text variant="headline" color="textBrand">
            Commence ta collection
          </Text>
          <Text variant="body" color="textSecondary">
            Explore la carte, capture des chats et remplis ton CatDex.
          </Text>
        </View>

        <View style={{ gap: spacing[16] }}>
          <Button
            title="Créer un compte"
            onPress={() => router.push('/(auth)/signup')}
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
  heroWrap: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  heroImage: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  heroImageInner: {
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
