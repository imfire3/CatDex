import { View } from 'react-native'

import { Text } from '@/components/Text'
import type { LockedTeaser as LockedTeaserType } from '@/lib/progression'
import { useTheme } from '@/theme'

type Props = {
  teasers: LockedTeaserType[]
}

/** Blurred desire hooks — no actions. */
export function LockedTeaserList({ teasers }: Props) {
  const { colors, spacing, radius } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      {teasers.map((t) => (
        <View
          key={t.id}
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            opacity: 0.45,
            gap: spacing.xs,
          }}
          pointerEvents="none"
          accessibilityState={{ disabled: true }}
        >
          <Text variant="body" color="textMuted">
            🔒 {t.title}
          </Text>
          <Text variant="caption" color="textMuted">
            ?????????
          </Text>
          <Text variant="caption" color="textMuted">
            {t.subtitle}
          </Text>
        </View>
      ))}
    </View>
  )
}
