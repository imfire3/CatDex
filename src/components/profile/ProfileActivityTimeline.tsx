import { View } from 'react-native'

import { Text } from '@/components/Text'
import type { ActivityItem } from '@/lib/progression'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  items: ActivityItem[]
}

/** Two short lines — adventure journal, not a feed. */
export function ProfileActivityTimeline({ items }: Props) {
  const { spacing } = useTheme()

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="title" color="textBrand">
        Journal d’exploration
      </Text>
      {items.map((item) => (
        <View key={item.id} style={{ gap: spacing[4] }}>
          <Text variant="caption" color="textMuted">
            {item.when}
          </Text>
          <Text variant="body" color="text">
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text variant="bodySmall" color="textSecondary">
              {item.subtitle}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  )
}
