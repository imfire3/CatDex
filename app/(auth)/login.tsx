import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { SLOGAN } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function LoginScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');

  if (user) {
    return <Redirect href="/(tabs)/map" />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.accentSoft, colors.background, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.hero}>
          <View style={[styles.art, { backgroundColor: colors.surface }]}>
            <Svg width={160} height={160} viewBox="0 0 160 160" fill="none">
              <Path
                d="M18 118c18-28 42-42 62-42 12 0 24 4 36 12 12-8 24-12 36-12 20 0 44 14 62 42"
                stroke={colors.textMuted}
                strokeWidth="2"
                opacity={0.35}
              />
              <Path
                d="M48 78 38 48M68 68l-8-28M92 68l8-28M112 78l10-30"
                stroke={colors.accent}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Circle cx="80" cy="96" r="28" stroke={colors.text} strokeWidth="2.5" />
              <Circle cx="70" cy="92" r="3" fill={colors.accent} />
              <Circle cx="90" cy="92" r="3" fill={colors.accent} />
              <Path
                d="M74 104c4 4 8 4 12 0"
                stroke={colors.text}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text style={[styles.brand, { color: colors.text, fontFamily: fonts.display }]}>
            CatDex
          </Text>
          <Text style={[styles.slogan, { color: colors.textMuted, fontFamily: fonts.bodyMedium }]}>
            {SLOGAN}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Continuer avec Apple"
            variant="secondary"
            onPress={() => {
              signIn('apple');
              router.replace('/(tabs)/map');
            }}
          />
          <Button
            title="Continuer avec Google"
            variant="secondary"
            onPress={() => {
              signIn('google');
              router.replace('/(tabs)/map');
            }}
          />
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@exemple.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
                fontFamily: fonts.body,
              },
            ]}
          />
          <Button
            title="Continuer avec e-mail"
            onPress={() => {
              signIn('email', email || 'explorer@catdex.app');
              router.replace('/(tabs)/map');
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: 24,
  },
  art: {
    width: 200,
    height: 200,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 28,
    fontSize: 44,
    letterSpacing: -1,
  },
  slogan: {
    marginTop: 8,
    fontSize: 17,
  },
  actions: {
    gap: 12,
  },
  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
