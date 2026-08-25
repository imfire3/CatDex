import { View } from 'react-native'

import { Button } from '@/components/Button'
import { IconCamera } from '@/components/Settings/settingsIcons'
import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  onExplore: () => void
  onCapture?: () => void
}

/** Locked companion slot — desire, not docs. */
export function ProfileFavoriteEmpty({ onExplore }: Props) {
  const { colors, spacing, radius, shadow, iconSize } = useTheme()

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="title" color="textBrand">
        Ta première découverte
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
        <View
          style={{
            width: spacing[56],
            height: spacing[56],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconCamera color={colors.brand} size={iconSize.md} />
        </View>
        <Text
          variant="body" weight="semibold"
          color="textBody"
          style={{ textAlign: 'center' }}
        >
          Capture ton premier chat pour lancer ta collection et débloquer ton premier badge.
        </Text>
        <View style={{ width: '100%' }}>
          <Button title="Trouver un chat près de moi" onPress={onExplore} />
        </View>
      </View>
    </View>
  )
}
