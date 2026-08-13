import { Pressable, View } from 'react-native'

import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'
import { BRAND_PRESETS } from '@/theme/themeOverrides'

type Props = {
  value: string
  onChange: (brandId: string) => void
  disabled?: boolean
}

/** Horizontal brand swatches for rapid color swaps. */
export const ColorSwatchGroup = ({ value, onChange, disabled }: Props) => {
  const { colors, spacing, radius, shadow, motion } = useTheme()

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="label" color="textBrand">
        Couleur marque
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing[16],
        }}
      >
        {BRAND_PRESETS.map((preset) => {
          const selected = value === preset.id
          return (
            <Pressable
              key={preset.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`Couleur ${preset.label}`}
              disabled={disabled}
              onPress={() => onChange(preset.id)}
              style={({ pressed }) => ({
                alignItems: 'center',
                gap: spacing[8],
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? motion.pressScale : 1 }],
              })}
            >
              <View
                style={[
                  {
                    width: spacing[48],
                    height: spacing[48],
                    borderRadius: radius.full,
                    backgroundColor: preset.brand,
                    borderWidth: selected ? 3 : 2,
                    borderColor: selected ? colors.text : colors.surfaceElevated,
                  },
                  shadow.low,
                ]}
              />
              <Text
                variant="caption"
                weight={selected ? 'semibold' : 'regular'}
                color={selected ? 'textBrand' : 'textSecondary'}
              >
                {preset.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
