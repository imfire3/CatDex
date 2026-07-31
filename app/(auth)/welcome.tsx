import { Redirect, router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const WELCOME_HERO = require('../../assets/welcome-hero.jpg');

export default function WelcomeScreen() {
  const { colors, fonts, spacing, radius, shadow, motion, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  const enter = reduceMotion ? undefined : FadeIn.duration(motion.duration.slow);
  const enterCard = reduceMotion
    ? undefined
    : FadeInDown.delay(120).duration(motion.duration.slow);
  const enterSheet = reduceMotion
    ? undefined
    : FadeInUp.delay(180).duration(motion.duration.normal);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View entering={enter} style={StyleSheet.absoluteFill}>
        <Image source={WELCOME_HERO} style={styles.hero} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', colors.overlay, colors.background]}
          style={styles.fade}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.View
        entering={enterCard}
        pointerEvents="none"
        style={[
          styles.teaserWrap,
          {
            top: insets.top + spacing[48],
            right: spacing[24],
          },
        ]}
      >
        <View
          style={[
            {
              width: spacing[96] + spacing[32],
              borderRadius: radius.xl,
              overflow: 'hidden',
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: colors.accent,
              transform: [{ rotate: '6deg' }],
            },
            shadow.large,
          ]}
        >
          <View style={{ aspectRatio: 1, backgroundColor: colors.surfaceSecondary }}>
            <Image source={WELCOME_HERO} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['transparent', colors.overlay]}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={{
                position: 'absolute',
                top: spacing[8],
                left: spacing[8],
                paddingHorizontal: spacing[8],
                paddingVertical: spacing[4],
                borderRadius: radius.full,
                backgroundColor: colors.glassFill,
              }}
            >
              <Text variant="caption" color="accent" style={{ fontFamily: fonts.bodySemi }}>
                #001
              </Text>
            </View>
          </View>
          <View style={{ padding: spacing[8], gap: spacing[4] }}>
            <Text variant="bodySmall" style={{ fontFamily: fonts.bodySemi }} numberOfLines={1}>
              Ta première carte
            </Text>
            <Text variant="caption" color="textSecondary">
              À découvrir
            </Text>
          </View>
          <LinearGradient
            colors={[gradients.primarySoft[0], 'transparent']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

      <Animated.View
        entering={enterSheet}
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
            paddingTop: spacing[32],
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={{ gap: spacing[8], marginBottom: spacing[32] }}>
          <Text variant="h2" style={{ color: colors.text, fontFamily: fonts.body }}>
            Bienvenue sur
          </Text>
          <Text
            variant="display"
            style={{
              color: colors.text,
              fontFamily: fonts.display,
              marginTop: -spacing[4],
            }}
          >
            CatDex
          </Text>
          <Text
            variant="body"
            style={{ color: colors.textBody, marginTop: spacing[8], maxWidth: 320 }}
          >
            Explore ton quartier, capture des chats et complète ta collection.
          </Text>
        </View>

        <View style={{ gap: spacing[16] }}>
          <Button title="Créer un compte" onPress={() => router.push('/(auth)/signup')} />
          <Button
            title="J’ai déjà un compte"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '68%',
    width: '100%',
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    bottom: '32%',
  },
  teaserWrap: {
    position: 'absolute',
    zIndex: 2,
  },
  sheet: {
    marginTop: 'auto',
    zIndex: 3,
  },
});
