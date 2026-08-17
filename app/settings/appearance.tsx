import { useEffect } from 'react'
import { Pressable, View } from 'react-native'

import {
  ColorSwatchGroup,
  ShapePresetGroup,
  ThemeLabPreview,
} from '@/components/ThemeLab'
import { SettingsScreen } from '@/components/Settings'
import { Text } from '@/components/Text'
import { useThemeLabStore } from '@/store/themeLab'
import { useTheme } from '@/theme/ThemeProvider'

export default function AppearanceSettingsScreen() {
  const { spacing } = useTheme()
  const lab = useThemeLabStore((s) => s.overrides)
  const labHydrated = useThemeLabStore((s) => s.hydrated)
  const hydrateLab = useThemeLabStore((s) => s.hydrate)
  const setBrandId = useThemeLabStore((s) => s.setBrandId)
  const setShape = useThemeLabStore((s) => s.setShape)
  const resetLab = useThemeLabStore((s) => s.reset)

  useEffect(() => {
    void hydrateLab()
  }, [hydrateLab])

  return (
    <SettingsScreen
      title="Apparence"
      subtitle="Couleur et forme — les changements s’appliquent tout de suite."
    >
      <ThemeLabPreview />

      <View style={{ gap: spacing[24] }}>
        <ColorSwatchGroup
          value={lab.brandId}
          onChange={setBrandId}
          disabled={!labHydrated}
        />
        <ShapePresetGroup
          value={lab.shape}
          onChange={setShape}
          disabled={!labHydrated}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Réinitialiser couleur et forme"
          disabled={!labHydrated}
          onPress={() => resetLab()}
          style={({ pressed }) => ({
            alignSelf: 'flex-start',
            opacity: pressed ? 0.7 : 1,
            paddingVertical: spacing[8],
          })}
        >
          <Text variant="bodySmall" weight="semibold" color="textBrand">
            Réinitialiser
          </Text>
        </Pressable>
      </View>
    </SettingsScreen>
  )
}
