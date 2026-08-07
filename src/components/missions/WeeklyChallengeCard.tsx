import { View } from 'react-native'

import { Text } from '@/components/Text'
import type { QuestItem } from '@/lib/progression'
import { useTheme } from '@/theme'

type Props = {
  quest: QuestItem
}

export function WeeklyChallengeCard({ quest }: Props) {
  const { colors, spacing, radius } = useTheme()
  const ratio = quest.target > 0 ? Math.min(1, quest.current / quest.target) : 0
  const xpLabel = quest.rewardLabel.startsWith('+')
    ? quest.rewardLabel
    : `+${quest.rewardLabel}`

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: quest.completed ? colors.success : colors.brand,
        padding: spacing.md,
        gap: spacing.sm,
      }}
    >
      <Text variant="label" color="textBrand">
        DÉFI DE LA SEMAINE
      </Text>
      <Text variant="h3" color="text">
        {quest.title}
      </Text>
      <View style={{ gap: spacing.xs }}>
        <View
          style={{
            height: 10,
            borderRadius: radius.pill,
            backgroundColor: colors.surfaceSecondary,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${Math.round(ratio * 100)}%`,
              height: '100%',
              backgroundColor: quest.completed ? colors.success : colors.brand,
              borderRadius: radius.pill,
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption" color="textMuted">
            {quest.current} / {quest.target}
          </Text>
          <Text variant="caption" color="textBrand">
            À gagner · {xpLabel}
          </Text>
        </View>
      </View>
    </View>
  )
}
