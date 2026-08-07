import { View } from 'react-native'

import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

/** Live preview of brand + radius tokens on shared components. */
export const ThemeLabPreview = () => {
  const { colors, fonts, spacing, radius, shadow } = useTheme()

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="label" color="textBrand">
        Aperçu
      </Text>
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[16],
            gap: spacing[16],
          },
          shadow.low,
        ]}
      >
        <Text variant="h3" color="textBrand" style={{ fontFamily: fonts.display }}>
          Ton quartier. Tes chats.
        </Text>
        <Text variant="bodySmall" color="textBody">
          Les boutons, cartes et chips suivent la couleur et la forme choisies.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
          <Chip label="Découvrir" selected />
          <Chip label="Rare" />
          <Chip label="Près de toi" />
        </View>
        <Button title="Créer un compte" onPress={() => undefined} />
        <Button title="J’ai déjà un compte" variant="secondary" onPress={() => undefined} />
      </View>
    </View>
  )
}
