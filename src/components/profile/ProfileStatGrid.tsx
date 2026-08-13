import { View } from 'react-native'

import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

type Stat = { label: string; value: string }

type Props = {
  stats: [Stat, Stat, Stat, Stat]
}

/** Four big numbers — no chrome. */
export function ProfileStatGrid({ stats }: Props) {
  const { colors, spacing } = useTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing[8] }}
    >
      {stats.map((stat) => (
        <View key={stat.label} style={{ flex: 1, alignItems: 'center', gap: spacing[4] }}>
          <Text variant="title" color="textBrand">
            {stat.value}
          </Text>
          <Text variant="caption" color="textSecondary">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  )
}
