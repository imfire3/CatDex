import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '../services/api';
import { Colors, FontSize, Spacing } from '../constants/theme';
import type { LeaderboardEntry } from '@catdex/shared';

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.getLeaderboard().then(setEntries).catch(console.warn);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, item.rank <= 3 && styles.topRow]}>
            <Text style={[styles.rank, item.rank <= 3 && styles.topRank]}>
              {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : `#${item.rank}`}
            </Text>
            <View style={styles.info}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.details}>Lv.{item.level} · {item.discoveries} discoveries</Text>
            </View>
            <Text style={styles.xp}>{item.xp.toLocaleString()} XP</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  topRow: { borderWidth: 1, borderColor: Colors.gold + '55' },
  rank: { width: 40, fontSize: FontSize.lg, fontWeight: '800', color: Colors.textSecondary },
  topRank: { fontSize: 24 },
  info: { flex: 1 },
  username: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  details: { color: Colors.textSecondary, fontSize: FontSize.sm },
  xp: { color: Colors.accent, fontWeight: '800', fontSize: FontSize.md },
});
