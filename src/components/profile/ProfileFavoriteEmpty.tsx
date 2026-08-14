import { View } from 'react-native'

import { Button } from '@/components/Button'
import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  onExplore: () => void
  onCapture?: () => void
}

/** Locked companion slot — desire, not docs. */
export function ProfileFavoriteEmpty({ onExplore }: Props) {
  const { colors, spacing, radius, shadow } = useTheme()

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="title" color="textBrand">
        Compagnon favori
      </Text>
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[24],
            gap: spacing[16],
            alignItems: 'center',
            opacity: 0.85,
          },
          shadow.low,
        ]}
      >
        <Text variant="title" color="textMuted">
          🔒
        </Text>
        <Text
          variant="body" weight="semibold"
          color="textBody"
          style={{ textAlign: 'center' }}
        >
          Ton futur compagnon apparaîtra ici.
        </Text>
        <View style={{ width: '100%' }}>
          <Button title="Explorer" variant="secondary" onPress={onExplore} />
        </View>
      </View>
    </View>
  )
}
