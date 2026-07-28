import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MiniMap } from '@/components/maps/CatMap';
import { formatCaptureTime } from '@/lib/constants';
import { useCatsStore } from '@/store/cats';
import { useTheme } from '@/theme/ThemeProvider';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts } = useTheme();
  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const incrementViews = useCatsStore((state) => state.incrementViews);

  useEffect(() => {
    if (id) incrementViews(id);
  }, [id, incrementViews]);

  if (!cat) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted, fontFamily: fonts.body }}>Chat introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Stack.Screen options={{ title: cat.name }} />
      <Image source={{ uri: cat.photoUri }} style={styles.hero} />

      <View style={styles.section}>
        <Text style={[styles.name, { color: colors.text, fontFamily: fonts.display }]}>
          {cat.name}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Découvert le {formatCaptureTime(cat.discoveredAt)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bodySemi }]}>
          Infos IA
        </Text>
        <InfoRow label="Race probable" value={cat.analysis.breed} />
        <InfoRow label="Couleur" value={cat.analysis.color} />
        <InfoRow label="Robe" value={cat.analysis.coat} />
        <Text style={[styles.description, { color: colors.textMuted, fontFamily: fonts.body }]}>
          {cat.analysis.description}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bodySemi }]}>
          Statistiques
        </Text>
        <InfoRow label="Vues" value={String(cat.views)} />
        <InfoRow label="Heure de capture" value={formatCaptureTime(cat.discoveredAt)} />
      </View>

      {cat.notes ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bodySemi }]}>
            Notes
          </Text>
          <Text style={[styles.description, { color: colors.textMuted, fontFamily: fonts.body }]}>
            {cat.notes}
          </Text>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surface, overflow: 'hidden', padding: 0 }]}>
        <Text
          style={[
            styles.cardTitle,
            { color: colors.text, fontFamily: fonts.bodySemi, padding: 16, paddingBottom: 10 },
          ]}
        >
          Lieu d’observation
        </Text>
        <MiniMap latitude={cat.latitude} longitude={cat.longitude} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 14 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: '100%',
    height: 360,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  name: {
    fontSize: 32,
    letterSpacing: -0.7,
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
