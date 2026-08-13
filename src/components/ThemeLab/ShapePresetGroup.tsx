import { Pressable, View } from 'react-native'

import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'
import { SHAPE_PRESETS, type ShapePreset } from '@/theme/themeOverrides'

type Props = {
  value: ShapePreset
  onChange: (shape: ShapePreset) => void
  disabled?: boolean
}

const previewRadius = (shape: ShapePreset) => {
  if (shape === 'squared') return 8
  if (shape === 'rounded') return 24
  return 16
}

/** Shape presets — squared / standard / rounded corners. */
export const ShapePresetGroup = ({ value, onChange, disabled }: Props) => {
  const { colors, spacing, radius, shadow, motion } = useTheme()

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="label" color="textBrand">
        Forme
      </Text>
      <View style={{ gap: spacing[8] }}>
        {SHAPE_PRESETS.map((preset) => {
          const selected = value === preset.id
          const corner = previewRadius(preset.id)
          return (
            <Pressable
              key={preset.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`Forme ${preset.label}`}
              disabled={disabled}
              onPress={() => onChange(preset.id)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[16],
                  padding: spacing[16],
                  borderRadius: radius.lg,
                  backgroundColor: selected ? colors.brandSoft : colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: selected ? colors.brand : colors.border,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? motion.pressScale : 1 }],
                },
                shadow.low,
              ]}
            >
              <View
                style={{
                  width: spacing[40],
                  height: spacing[40],
                  borderRadius: corner,
                  backgroundColor: colors.brand }}
              />
              <View style={{ flex: 1, gap: spacing[4] }}>
                <Text
                  variant="body" weight="semibold"
                  color="text"
                >
                  {preset.label}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {preset.hint}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
