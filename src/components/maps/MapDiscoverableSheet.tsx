import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'

import { BottomSheet } from '@/components/BottomSheet'
import { Text } from '@/components/Text'
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
 * Short drawer of discoverable cats — closest → farthest from the player.
 */
export function MapDiscoverableSheet({
  visible,
  items,
  showDistance = true,
  onClose,
  onSelect,
}: Props) {
  const { colors, spacing, radius, motion } = useTheme()
  const { height } = useWindowDimensions()
  const listMaxHeight = Math.min(280, Math.round(height * 0.36))

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ gap: spacing[16] }}>
        <View style={{ gap: spacing[4] }}>
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

        {items.length > 0 ? (
          <ScrollView
            style={{ maxHeight: listMaxHeight }}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
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
                    <Text variant="bodySmall" weight="semibold" color="textBrand">
                      {formatDistanceMeters(distanceM)}
                    </Text>
                  ) : null}
                </Pressable>
              )
            })}
          </ScrollView>
        ) : null}
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
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
