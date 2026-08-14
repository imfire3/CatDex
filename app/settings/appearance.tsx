import { useEffect } from 'react'
import { Pressable, View } from 'react-native'

import {
  ColorSwatchGroup,
  ShapePresetGroup,
  ThemeLabPreview,
} from '@/components/ThemeLab'
import { SettingsScreen } from '@/components/Settings'
import { Text } from '@/components/Text'
import {
  formatTheme,
  type ThemePreference,
  useSettingsPrefsStore,
} from '@/store/settingsPrefs'
import { useThemeLabStore } from '@/store/themeLab'
import { useTheme } from '@/theme/ThemeProvider'

const OPTIONS: ThemePreference[] = ['clair', 'sombre', 'automatique']

export default function AppearanceSettingsScreen() {
  const { colors, spacing, radius, motion } = useTheme()
  const prefs = useSettingsPrefsStore((s) => s.prefs)
  const hydrated = useSettingsPrefsStore((s) => s.hydrated)
  const hydrate = useSettingsPrefsStore((s) => s.hydrate)
  const setTheme = useSettingsPrefsStore((s) => s.setTheme)

  const lab = useThemeLabStore((s) => s.overrides)
  const labHydrated = useThemeLabStore((s) => s.hydrated)
  const hydrateLab = useThemeLabStore((s) => s.hydrate)
  const setBrandId = useThemeLabStore((s) => s.setBrandId)
  const setShape = useThemeLabStore((s) => s.setShape)
  const resetLab = useThemeLabStore((s) => s.reset)

  useEffect(() => {
    void hydrate()
    void hydrateLab()
  }, [hydrate, hydrateLab])

  const handleReset = () => {
    resetLab()
  }

  return (
    <SettingsScreen
      title="Apparence"
      subtitle="Couleur, forme et thème — les changements s’appliquent tout de suite."
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
          onPress={handleReset}
          style={({ pressed }) => ({
            alignSelf: 'flex-start',
            opacity: pressed ? 0.7 : 1,
            paddingVertical: spacing[8],
          })}
        >
          <Text
            variant="bodySmall" weight="semibold"
            color="textBrand"
          >
            Réinitialiser
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: spacing[8] }}>
        <Text variant="label" color="textBrand">
          Mode d’affichage
        </Text>
        <View>
          {OPTIONS.map((option, index) => {
            const selected = prefs.theme === option
            return (
              <View key={option}>
                {index > 0 ? (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      marginLeft: spacing[16] }}
                  />
                ) : null}
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled: !hydrated }}
                  accessibilityLabel={formatTheme(option)}
                  disabled={!hydrated}
                  onPress={() => setTheme(option)}
                  style={({ pressed }) => ({
                    padding: spacing[16],
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing[16],
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? motion.pressScale : 1 }],
                  })}
                >
                  <View
                    style={{
                      width: spacing[24],
                      height: spacing[24],
                      borderRadius: radius.full,
                      borderWidth: 2,
                      borderColor: selected ? colors.brand : colors.borderDefault,
                      alignItems: 'center',
                      justifyContent: 'center' }}
                  >
                    {selected ? (
                      <View
                        style={{
                          width: spacing[8],
                          height: spacing[8],
                          borderRadius: radius.full,
                          backgroundColor: colors.brand }}
                      />
                    ) : null}
                  </View>
                  <Text
                    variant="body" weight="semibold"
                    color="text"
                    style={{ flex: 1 }}
                  >
                    {formatTheme(option)}
                  </Text>
                </Pressable>
              </View>
            )
          })}
        </View>
        <Text variant="caption" color="textMuted">
          Le mode sombre arrive bientôt — ton choix est déjà mémorisé.
        </Text>
      </View>
    </SettingsScreen>
  )
}
