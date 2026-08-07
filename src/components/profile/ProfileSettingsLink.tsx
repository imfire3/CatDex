import { Pressable, View } from 'react-native'

import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  onPress: () => void
}

/** One line into settings. */
export function ProfileSettingsLink({ onPress }: Props) {
  const { colors, fonts, spacing, motion } = useTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ouvrir les réglages"
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: spacing[8],
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? motion.pressScale : 1 }],
      })}
    >
      <Text variant="body" color="textSecondary" style={{ fontFamily: fonts.bodySemi }}>
        ⚙️ Réglages
      </Text>
    </Pressable>
  )
}
