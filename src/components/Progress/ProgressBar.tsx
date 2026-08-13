import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export function ProgressBar({
  progress,
  height = 8,
  label,
}: {
  progress: number;
  height?: number;
  label?: string;
}) {
  const { colors, spacing, radius, gradients } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={{ gap: spacing[8] }}>
      {label ? (
        <Text variant="caption" color="textSecondary">
          {label}
        </Text>
      ) : null}
      <View
        style={{
          height,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceTertiary,
          overflow: 'hidden' }}
      >
        <LinearGradient
          colors={[gradients.xp[0], gradients.xp[1]]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: `${clamped * 100}%`, height: '100%', borderRadius: radius.full }}
        />
      </View>
    </View>
  );
}

export function XPBar({
  level,
  xp,
  xpMax,
}: {
  level: number;
  xp: number;
  xpMax: number;
}) {
  const { colors, spacing, radius, shadow } = useTheme();
  const progress = xpMax > 0 ? xp / xpMax : 0;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[16],
          gap: spacing[8],
        },
        shadow.small,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="title">Niveau {level}</Text>
        <Text variant="caption" weight="semibold" color="textSecondary">
          {xp} / {xpMax} XP
        </Text>
      </View>
      <ProgressBar progress={progress} height={10} />
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: spacing[16] }}
    >
      <Text variant="title">{title}</Text>
      {actionLabel && onAction ? (
        <Text
          variant="bodySmall" weight="semibold"
          color="accent"
          onPress={onAction}
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}
