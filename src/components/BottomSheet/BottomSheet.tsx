import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/ThemeProvider'

export type BottomSheetProps = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * In-tree bottom sheet — stays inside MobileWebFrame on desktop web
 * (RN Modal portals to the full computer viewport).
 * Full phone width with horizontal content padding.
 */
export function BottomSheet({ visible, onClose, children, style }: BottomSheetProps) {
  const { colors, spacing, radius, shadow } = useTheme()
  const insets = useSafeAreaInsets()

  if (!visible) return null

  return (
    <View
      pointerEvents="box-none"
      accessibilityViewIsModal
      style={[StyleSheet.absoluteFill, styles.layer]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      />
      <View
        style={[
          styles.sheet,
          {
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingHorizontal: spacing[24],
            paddingTop: spacing[8],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: colors.border,
          },
          shadow.floating,
          style,
        ]}
      >
        <View
          style={[
            styles.handle,
            {
              width: spacing[40],
              height: spacing[4],
              backgroundColor: colors.border,
              marginBottom: spacing[16],
              borderRadius: radius.full,
            },
          ]}
        />
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
  },
  handle: {
    alignSelf: 'center',
  },
})
