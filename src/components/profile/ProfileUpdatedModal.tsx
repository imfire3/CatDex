import { Pressable, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { Button } from '@/components/Button'
import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  visible: boolean
  onDismiss: () => void
}

/** In-tree success card — stays inside the phone frame on web. */
export function ProfileUpdatedModal({ visible, onDismiss }: Props) {
  const { colors, spacing, radius, shadow, iconSize, iconStroke } = useTheme()

  if (!visible) return null

  const mark = spacing[80]
  const dot = spacing[8]

  return (
    <View
      accessibilityViewIsModal
      accessibilityRole="summary"
      accessibilityLabel="Profil mis à jour"
      style={[StyleSheet.absoluteFill, styles.layer]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        onPress={onDismiss}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
      />
      <View
        style={[
          {
            marginHorizontal: spacing[24],
            alignSelf: 'stretch',
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[24],
            alignItems: 'center',
            gap: spacing[16],
          },
          shadow.floating,
        ]}
      >
        <View
          style={{
            width: spacing[96],
            height: spacing[96],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: spacing[8],
              left: spacing[8],
              width: dot,
              height: dot,
              borderRadius: radius.full,
              backgroundColor: colors.brand,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: spacing[16],
              right: spacing[8],
              width: spacing[4],
              height: spacing[4],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: spacing[8],
              right: spacing[16],
              width: dot,
              height: dot,
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: spacing[16],
              left: spacing[4],
              width: spacing[4],
              height: spacing[4],
              borderRadius: radius.full,
              backgroundColor: colors.brand,
            }}
          />
          <View
            style={{
              width: mark,
              height: mark,
              borderRadius: radius.full,
              backgroundColor: colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={iconSize.lg} height={iconSize.lg} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 7 10 17l-5-5"
                stroke={colors.onAccent}
                strokeWidth={iconStroke.bold}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        <Text variant="title" color="text" align="center">
          Profil mis à jour
        </Text>
        <Text variant="bodySmall" color="textSecondary" align="center">
          Tes informations ont bien été enregistrées. Bonne chasse aux chats.
        </Text>
        <View style={{ width: '100%', paddingTop: spacing[8] }}>
          <Button title="Merci" onPress={onDismiss} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 20,
    justifyContent: 'center',
  },
})
