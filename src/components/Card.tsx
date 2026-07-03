import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, borderRadius, spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, style, padding = 'md' }: CardProps) {
  return (
    <View style={[styles.card, styles[`padding_${padding}`], style]}>
      {children}
    </View>
  );
}

interface BadgeChipProps {
  label: string;
  color?: string;
}

export function BadgeChip({ label, color = colors.primary }: BadgeChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

interface XpBarProps {
  xp: number;
  level: number;
}

export function XpBar({ xp, level }: XpBarProps) {
  const currentLevelXp = (level - 1) ** 2 * 100;
  const nextLevelXp = level ** 2 * 100;
  const progress = Math.min(1, (xp - currentLevelXp) / (nextLevelXp - currentLevelXp));

  return (
    <View style={styles.xpContainer}>
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Lv. {level}</Text>
        <Text style={styles.xpText}>{xp} XP</Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingIcon}>🐱</Text>
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padding_sm: { padding: spacing.sm },
  padding_md: { padding: spacing.md },
  padding_lg: { padding: spacing.lg },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  xpContainer: { gap: spacing.xs },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  levelText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  xpText: { color: colors.textSecondary, fontSize: 12 },
  xpTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  empty: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  emptySubtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  loading: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  loadingIcon: { fontSize: 40 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
});
