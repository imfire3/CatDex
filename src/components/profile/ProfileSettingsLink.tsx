import { Pressable, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  onPress: () => void
}

/** Clear entry into the settings hub. */
export function ProfileSettingsLink({ onPress }: Props) {
  const { colors, fonts, spacing, radius, shadow, iconStroke, iconSize, motion } = useTheme()

  return (
    <View style={{ gap: spacing[8] }}>
      <Text variant="h3" color="textBrand">
        Réglages
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvrir les réglages"
        onPress={onPress}
        style={({ pressed }) => [
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[16],
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[16],
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? motion.pressScale : 1 }],
          },
          shadow.low,
        ]}
      >
        <View
          style={{
            width: spacing[40],
            height: spacing[40],
            borderRadius: radius.full,
            backgroundColor: colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="12"
              cy="12"
              r="3"
              stroke={colors.brand}
              strokeWidth={iconStroke.regular}
            />
            <Path
              d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
              stroke={colors.brand}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
            Tous les réglages
          </Text>
          <Text variant="caption" color="textMuted">
            Compte, confidentialité, aide
          </Text>
        </View>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 6l6 6-6 6"
            stroke={colors.textMuted}
            strokeWidth={iconStroke.regular}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </View>
  )
}
