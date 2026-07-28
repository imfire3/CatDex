import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CatCard } from '@/components/CatCard';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function CatDexScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const cats = useCatsStore((state) => state.cats);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
          CatDex
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.body }]}>
          {cats.length === 0
            ? 'Ta collection est vide. Scanne ton premier chat.'
            : `${cats.length} découverte${cats.length > 1 ? 's' : ''} · plus récents`}
        </Text>
      </View>

      <FlatList
        data={cats}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 120,
          gap: 12,
        }}
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bodySemi }]}>
              Aucun chat pour l’instant
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted, fontFamily: fonts.body }]}>
              Appuie sur Scanner pour capturer un chat dans le 20e.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CatCard cat={item} onPress={() => router.push(`/cat/${item.id}`)} />
        )}
      />
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
  empty: {
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 17,
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
