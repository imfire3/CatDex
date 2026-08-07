import { Pressable, View } from 'react-native'

import { Text } from '@/components/Text'
import type { VisibleCollection } from '@/lib/progression'
import { useTheme } from '@/theme'

const COLLECTION_MARK: Record<string, string> = {
  roux: '◆',
  black: '●',
  tabby: '◈',
}

type Props = {
  collections: VisibleCollection[]
  onSeeAll: () => void
}

export function CollectionPreview({ collections, onSeeAll }: Props) {
  const { colors, spacing, radius } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      {collections.map((c) => (
        <View
          key={c.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            opacity: c.locked ? 0.5 : 1,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text variant="body" color={c.locked ? 'textMuted' : 'textBrand'}>
              {c.locked ? '🔒' : COLLECTION_MARK[c.id] ?? '·'}
            </Text>
            <Text variant="body" color="text" style={{ flex: 1 }}>
              {c.label}
            </Text>
            {!c.locked ? (
              <Text variant="caption" color="textBrand">
                {c.current} / {c.target}
              </Text>
            ) : null}
          </View>
          {!c.locked ? (
            <>
              <View
                style={{
                  height: 6,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surfaceSecondary,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${Math.round(Math.min(1, c.current / Math.max(1, c.target)) * 100)}%`,
                    height: '100%',
                    backgroundColor: colors.brand,
                    borderRadius: radius.pill,
                  }}
                />
              </View>
              {c.rewardLabel ? (
                <Text variant="caption" color="textMuted">
                  À gagner · {c.rewardLabel}
                </Text>
              ) : null}
            </>
          ) : (
            <Text variant="caption" color="textMuted">
              {c.unlockHint ?? 'Continue ton aventure pour révéler cette collection.'}
            </Text>
          )}
        </View>
      ))}
      <Pressable onPress={onSeeAll} accessibilityRole="button">
        <Text variant="bodySmall" color="textBrand">
          Voir toutes les collections →
        </Text>
      </Pressable>
    </View>
  )
}
