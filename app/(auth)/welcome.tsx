import { Redirect, router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuthStore, getPostAuthHref } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

const WELCOME_HERO = require('../../assets/welcome-hero.jpg');

export default function WelcomeScreen() {
  const { fonts, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (user) {
    return <Redirect href={getPostAuthHref(onboardingCompleted)} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: '#060816' }]}>
      <Image source={WELCOME_HERO} style={styles.hero} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(6,8,22,0.55)', '#060816']}
        style={styles.fade}
        pointerEvents="none"
      />

      <View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            paddingHorizontal: spacing[24],
            paddingTop: spacing[32],
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            backgroundColor: '#060816',
          },
        ]}
      >
        <View style={{ gap: spacing[8], marginBottom: spacing[32] }}>
          <Text variant="h2" style={{ color: '#FFFFFF', fontFamily: fonts.body }}>
            Bienvenu sur
          </Text>
          <Text
            variant="display"
            style={{
              color: '#FFFFFF',
              fontFamily: fonts.display,
              marginTop: -spacing[4],
            }}
          >
            CatDex
          </Text>
          <Text
            variant="body"
            style={{ color: 'rgba(255,255,255,0.78)', marginTop: spacing[8], maxWidth: 320 }}
          >
            Découvre les chats de ton quartier et capture-les !
          </Text>
        </View>

        <View style={{ gap: spacing[16] }}>
          <Button title="C’est parti !" onPress={() => router.push('/(auth)/signup')} />
          <Button
            title="J’ai déjà un compte"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
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
  sheet: {
    marginTop: 'auto',
  },
});
