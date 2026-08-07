import { View } from 'react-native'

import { Text } from '@/components/Text'
import type { QuestItem } from '@/lib/progression'
import { useTheme } from '@/theme'

const QUEST_MARK: Record<string, string> = {
  'daily-scan': '◎',
  'daily-place': '◇',
  'daily-likes': '♡',
}

type Props = {
  quests: QuestItem[]
}

/** Max 3 — desire + XP, not a checklist. */
export function DailyQuestList({ quests }: Props) {
  const { colors, spacing, radius } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      {quests.map((q) => (
        <View
          key={q.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            opacity: q.completed ? 0.55 : 1,
          }}
        >
          <View
            style={{
              width: spacing[40],
              height: spacing[40],
              borderRadius: radius.pill,
              backgroundColor: q.completed ? colors.successSoft : colors.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="body" color="textBrand">
              {q.completed ? '✓' : QUEST_MARK[q.id] ?? '·'}
            </Text>
          </View>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="body" color="text">
              {q.title}
            </Text>
            <Text variant="caption" color="textBrand">
              À gagner · {q.rewardLabel}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}
