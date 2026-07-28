import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const catsCount = useCatsStore((state) => state.cats.length);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
          Profil
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Compte et préférences
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.md, gap: 12 }}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: fonts.body }]}>
            Explorateur
          </Text>
          <Text style={[styles.value, { color: colors.text, fontFamily: fonts.bodySemi }]}>
            {user?.displayName ?? '—'}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted, fontFamily: fonts.body }]}>
            {user?.email} · {user?.provider}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: fonts.body }]}>
            Collection
          </Text>
          <Text style={[styles.value, { color: colors.text, fontFamily: fonts.bodySemi }]}>
            {catsCount} chat{catsCount === 1 ? '' : 's'}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted, fontFamily: fonts.body }]}>
            Zone de test · Paris 20e
          </Text>
        </View>

        <Button
          title="Se déconnecter"
          variant="secondary"
          onPress={() => {
            signOut();
            router.replace('/(auth)/login');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    letterSpacing: -0.8,
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
  },
  card: {
    borderRadius: 18,
    padding: 18,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    marginTop: 8,
    fontSize: 20,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
  },
});
