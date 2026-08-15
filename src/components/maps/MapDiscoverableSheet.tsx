import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'

import { Text } from '@/components/Text'
import { MOBILE_WEB_WIDTH } from '@/layout/MobileWebFrame'
import { formatDistanceMeters } from '@/lib/constants'
import type { CatWithDistance } from '@/lib/mapExplore'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  visible: boolean
  items: CatWithDistance[]
  /** Hide meter labels until a real GPS fix is available. */
  showDistance?: boolean
  onClose: () => void
  onSelect: (item: CatWithDistance) => void
}

/**
 * Centered in-tree modal of discoverable cats — closest → farthest.
 * Stays inside the phone frame (no RN Modal portal).
 */
export function MapDiscoverableSheet({
  visible,
  items,
  showDistance = true,
  onClose,
  onSelect,
}: Props) {
  const { colors, spacing, radius, shadow, motion, iconStroke } = useTheme()
  const insets = useSafeAreaInsets()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()

  if (!visible) return null

  // Cap to phone preview width so desktop web never stretches past the frame.
  const frameWidth = Math.min(windowWidth, MOBILE_WEB_WIDTH)
  const sidePad = spacing[16]
  const sheetMaxWidth = frameWidth - sidePad * 2
  const sheetMaxHeight = Math.min(
    Math.round(windowHeight * 0.72),
    560,
  )
  const listMaxHeight = Math.max(
    160,
    sheetMaxHeight - spacing[80] - spacing[48] - Math.max(insets.bottom, spacing[16]),
  )

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
        pointerEvents="box-none"
        style={[
          styles.center,
          {
            paddingHorizontal: sidePad,
            paddingVertical: Math.max(insets.top, spacing[24]),
          },
        ]}
      >
        <View
          style={[
            {
              width: '100%',
              maxWidth: sheetMaxWidth,
              maxHeight: sheetMaxHeight,
              alignSelf: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.sheet,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing[24],
              paddingTop: spacing[16],
              paddingBottom: Math.max(insets.bottom, spacing[24]),
              gap: spacing[16],
            },
            shadow.floating,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: spacing[16],
            }}
          >
            <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
              <Text variant="h3" color="textBrand">
                À découvrir
              </Text>
              <Text variant="bodySmall" color="textSecondary">
                {items.length === 0
                  ? 'Aucun chat mystère autour de toi pour le moment.'
                  : showDistance
                    ? `Du plus proche au plus loin · ${items.length} chat${items.length > 1 ? 's' : ''}`
                    : `${items.length} chat${items.length > 1 ? 's' : ''} à découvrir · distance dès que le GPS est actif`}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => ({
                width: spacing[40],
                height: spacing[40],
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? motion.pressScale : 1 }],
                flexShrink: 0,
              })}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 6l12 12M18 6 6 18"
                  stroke={colors.text}
                  strokeWidth={iconStroke.regular}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          </View>

          {items.length > 0 ? (
            <ScrollView
              style={{ maxHeight: listMaxHeight }}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {items.map(({ cat, distanceM }, index) => {
                const isLast = index === items.length - 1
                return (
                  <Pressable
                    key={cat.id}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showDistance
                        ? `Chat mystère, ${formatDistanceMeters(distanceM)}`
                        : 'Chat mystère'
                    }
                    accessibilityHint="Affiche ce chat sur la carte"
                    onPress={() => onSelect({ cat, distanceM })}
                    style={({ pressed }) => [
                      styles.row,
                      {
                        paddingVertical: spacing[16],
                        paddingHorizontal: spacing[16],
                        borderRadius: radius.md,
                        backgroundColor: pressed
                          ? colors.brandSoft
                          : colors.surfaceSecondary,
                        borderWidth: 1,
                        borderColor: colors.border,
                        marginBottom: isLast ? 0 : spacing[8],
                        transform: [
                          { scale: pressed ? motion.pressScale : 1 },
                        ],
                      },
                    ]}
                  >
                    <View
                      style={[styles.ring, { borderColor: colors.brand }]}
                    />
                    <View style={styles.rowText}>
                      <Text variant="body" weight="semibold" color="text">
                        Chat mystère
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {cat.analysis?.breed?.trim() || 'Espèce à identifier'}
                      </Text>
                    </View>
                    {showDistance ? (
                      <Text
                        variant="bodySmall"
                        weight="semibold"
                        color="textBrand"
                      >
                        {formatDistanceMeters(distanceM)}
                      </Text>
                    ) : null}
                  </Pressable>
                )
              })}
            </ScrollView>
          ) : null}
        </View>
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
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  ring: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
})
