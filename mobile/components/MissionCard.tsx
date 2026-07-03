import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mission } from '@catdex/shared';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const progress = mission.target > 0 ? mission.progress / mission.target : 0;

  return (
    <View style={[styles.card, mission.completed && styles.completed]}>
      <View style={styles.header}>
        <Text style={styles.type}>{mission.type.toUpperCase()}</Text>
        <Text style={styles.xp}>+{mission.xpReward} XP</Text>
      </View>
      <Text style={styles.title}>{mission.title}</Text>
      <Text style={styles.description}>{mission.description}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {mission.completed ? '✅ Complete!' : `${mission.progress} / ${mission.target}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completed: { borderColor: Colors.success, opacity: 0.8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  type: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
  xp: { color: Colors.accent, fontSize: FontSize.sm, fontWeight: '600' },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  description: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4, textAlign: 'right' },
});
