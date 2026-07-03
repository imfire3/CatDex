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
import { Button, Input } from '@/components';
import { authService } from '@/services/auth.service';
import { colors, spacing, typography } from '@/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.signUpWithEmail(email, password, displayName);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
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
          <Text style={styles.title}>Join CatDex</Text>
          <Text style={styles.subtitle}>Start your cat discovery journey</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Display Name"
            placeholder="Cat Explorer"
            value={displayName}
            onChangeText={setDisplayName}
          />
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

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={() => router.back()} style={styles.link}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
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
  link: { alignItems: 'center', marginTop: spacing.md },
  linkText: { color: colors.textSecondary, fontSize: 14 },
  linkBold: { color: colors.primary, fontWeight: '600' },
});
