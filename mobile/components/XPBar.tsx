import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface XPBarProps {
  current: number;
  required: number;
  progress: number;
  level: number;
}

export function XPBar({ current, required, progress, level }: XPBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.level}>Lv. {level}</Text>
        <Text style={styles.xp}>{current} / {required} XP</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  level: { color: Colors.accent, fontWeight: '700', fontSize: FontSize.sm },
  xp: { color: Colors.textSecondary, fontSize: FontSize.sm },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});
