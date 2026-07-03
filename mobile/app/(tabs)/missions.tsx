import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { MissionCard } from '../../components/MissionCard';
import { api } from '../../services/api';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import type { Mission, Season } from '@catdex/shared';

export default function MissionsScreen() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [m, s] = await Promise.all([api.getMissions(), api.getSeason()]);
      setMissions(m);
      setSeason(s);
    } catch (e) {
      console.warn(e);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const daily = missions.filter((m) => m.type === 'daily');
  const weekly = missions.filter((m) => m.type === 'weekly');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {season && (
        <View style={styles.seasonCard}>
          <Text style={styles.seasonLabel}>🌟 MONTHLY SEASON</Text>
          <Text style={styles.seasonName}>{season.name}</Text>
          <Text style={styles.seasonChallenge}>{season.challenge}</Text>
          <Text style={styles.seasonReward}>
            Limited badge + {season.specialBackground.replace(/_/g, ' ')} background
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Daily Missions</Text>
      {daily.map((m) => <MissionCard key={m.id} mission={m} />)}

      <Text style={styles.sectionTitle}>Weekly Missions</Text>
      {weekly.map((m) => <MissionCard key={m.id} mission={m} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 40 },
  seasonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold + '55',
  },
  seasonLabel: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '700' },
  seasonName: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginTop: 4 },
  seasonChallenge: { color: Colors.textSecondary, fontSize: FontSize.md, marginTop: Spacing.sm },
  seasonReward: { color: Colors.accent, fontSize: FontSize.sm, marginTop: Spacing.sm },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
});
