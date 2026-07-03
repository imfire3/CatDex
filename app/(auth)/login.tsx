import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components';
import { authService } from '@/services/auth.service';
import { colors, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.signInWithEmail(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.signInWithApple();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Apple sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.signInAnonymously();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Anonymous sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🐱</Text>
          <Text style={styles.title}>CatDex</Text>
          <Text style={styles.subtitle}>Discover cats around you</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Sign In" onPress={handleEmailLogin} loading={loading} style={styles.btn} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleLogin} disabled={loading}>
              <Ionicons name="logo-google" size={24} color={colors.text} />
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.socialBtn} onPress={handleAppleLogin} disabled={loading}>
                <Ionicons name="logo-apple" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          <Button
            title="Continue as Guest"
            onPress={handleAnonymousLogin}
            variant="outline"
            loading={loading}
            style={styles.btn}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 64, marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  form: { gap: spacing.md },
  error: { color: colors.error, fontSize: 14, textAlign: 'center' },
  btn: { marginTop: spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  link: { alignItems: 'center', marginTop: spacing.md },
  linkText: { color: colors.textSecondary, fontSize: 14 },
  linkBold: { color: colors.primary, fontWeight: '600' },
});
