import { Pressable, View } from 'react-native'

import { Text } from '@/components/Text'
import { useTheme } from '@/theme'

type Props = {
  level: number
  title: string
  goal: string
  xpIntoLevel: number
  xpMax: number
  nextLevel: number
  nextRewardLabel: string
  onSeeRewards: () => void
}

/** Single focus: level + bar + one next desire. */
export function MissionLevelCard({
  level,
  title,
  goal,
  xpIntoLevel,
  xpMax,
  nextLevel,
  nextRewardLabel,
  onSeeRewards,
}: Props) {
  const { colors, spacing, radius } = useTheme()
  const ratio = xpMax > 0 ? Math.min(1, xpIntoLevel / xpMax) : 1
  const remaining = Math.max(0, xpMax - xpIntoLevel)

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.md }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text variant="title" color="textBrand">
          Niveau {level} — {title}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {goal}
        </Text>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text variant="caption" color="textMuted">
          En route vers le niveau {nextLevel}
        </Text>
        <View
          style={{
            height: 8,
            borderRadius: radius.pill,
            backgroundColor: colors.surfaceSecondary,
            overflow: 'hidden' }}
        >
          <View
            style={{
              width: `${Math.round(ratio * 100)}%`,
              height: '100%',
              backgroundColor: colors.brand,
              borderRadius: radius.pill }}
          />
        </View>
        <Text variant="caption" color="textMuted">
          {xpIntoLevel} / {xpMax} XP · encore {remaining} XP
        </Text>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text variant="caption" color="textMuted">
          À gagner · Niveau {nextLevel}
        </Text>
        <Text variant="body" color="textBrand">
          {nextRewardLabel}
        </Text>
      </View>

      <Pressable onPress={onSeeRewards} accessibilityRole="button">
        <Text variant="bodySmall" color="textBrand">
          Les prochaines récompenses →
        </Text>
      </Pressable>
    </View>
  )
}
