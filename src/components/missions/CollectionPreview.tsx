import { Image, Pressable, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

import { DEMO_CAT_IMAGE } from '@/components/Auth/Onboarding/demoCat'
import { CatImage } from '@/components/CatImage'
import { CatSprite } from '@/components/CatSprite'
import { Text } from '@/components/Text'
import type { VisibleCollection } from '@/lib/progression'
import { useTheme } from '@/theme'

const COAT_FOR_ID: Record<string, string> = {
  roux: 'roux',
  black: 'noir',
  tabby: 'tigré',
}

type Props = {
  collections: VisibleCollection[]
  heroUri?: string | null
  onSeeAll: () => void
  onPressCollection?: (collection: VisibleCollection) => void
}

function BrandBar({ progress, height }: { progress: number; height: number }) {
  const { colors, radius } = useTheme()
  const clamped = Math.max(0, Math.min(1, progress))

  return (
    <View
      style={{
        height,
        borderRadius: radius.pill,
        backgroundColor: colors.surfaceSecondary,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.round(clamped * 100)}%`,
          height: '100%',
          backgroundColor: colors.brand,
          borderRadius: radius.pill,
        }}
      />
    </View>
  )
}

/** Figma icon/paw — 16×16 in a 40px surface circle. */
function PawIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 9C5.93333 9 4.4 10.2667 4.4 11.7333C4.4 12.7333 5.46667 13.4667 8 13.4667C10.5333 13.4667 11.6 12.7333 11.6 11.7333C11.6 10.2667 10.0667 9 8 9Z"
        fill={color}
      />
      <Path
        d="M4.73333 6.93333C4.43275 6.93333 4.14449 6.81393 3.93195 6.60139C3.7194 6.38885 3.6 6.10058 3.6 5.8C3.6 5.49942 3.7194 5.21115 3.93195 4.99861C4.14449 4.78607 4.43275 4.66667 4.73333 4.66667C5.03391 4.66667 5.32218 4.78607 5.53472 4.99861C5.74726 5.21115 5.86667 5.49942 5.86667 5.8C5.86667 6.10058 5.74726 6.38885 5.53472 6.60139C5.32218 6.81393 5.03391 6.93333 4.73333 6.93333ZM6.93333 5.46667C6.66812 5.46667 6.41376 5.36131 6.22623 5.17377C6.03869 4.98624 5.93333 4.73188 5.93333 4.46667C5.93333 4.20145 6.03869 3.9471 6.22623 3.75956C6.41376 3.57202 6.66812 3.46667 6.93333 3.46667C7.19855 3.46667 7.4529 3.57202 7.64044 3.75956C7.82798 3.9471 7.93333 4.20145 7.93333 4.46667C7.93333 4.73188 7.82798 4.98624 7.64044 5.17377C7.4529 5.36131 7.19855 5.46667 6.93333 5.46667ZM9.06667 5.46667C8.80145 5.46667 8.5471 5.36131 8.35956 5.17377C8.17202 4.98624 8.06667 4.73188 8.06667 4.46667C8.06667 4.20145 8.17202 3.9471 8.35956 3.75956C8.5471 3.57202 8.80145 3.46667 9.06667 3.46667C9.33188 3.46667 9.58624 3.57202 9.77377 3.75956C9.96131 3.9471 10.0667 4.20145 10.0667 4.46667C10.0667 4.73188 9.96131 4.98624 9.77377 5.17377C9.58624 5.36131 9.33188 5.46667 9.06667 5.46667ZM11.2667 6.93333C10.9661 6.93333 10.6778 6.81393 10.4653 6.60139C10.2527 6.38885 10.1333 6.10058 10.1333 5.8C10.1333 5.49942 10.2527 5.21115 10.4653 4.99861C10.6778 4.78607 10.9661 4.66667 11.2667 4.66667C11.5672 4.66667 11.8555 4.78607 12.0681 4.99861C12.2806 5.21115 12.4 5.49942 12.4 5.8C12.4 6.10058 12.2806 6.38885 12.0681 6.60139C11.8555 6.81393 11.5672 6.93333 11.2667 6.93333Z"
        fill={color}
      />
    </Svg>
  )
}

function LockIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M7 11h10v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function DiamondIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 1.5 14.5 8 8 14.5 1.5 8 8 1.5Z" fill={color} />
    </Svg>
  )
}

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M6 0.8 7 4.2 10.4 5.2 7 6.2 6 9.6 5 6.2 1.6 5.2 5 4.2 6 0.8Z"
        fill={color}
      />
    </Svg>
  )
}

function ChevronIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

/** Figma LockedCollectionCard sprite — cat-silhouette.svg */
function CatSilhouette({ size }: { size: number }) {
  const { colors } = useTheme()
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M9.16667 15.8333L6.66667 7.5L13.3333 10.8333L20 7.5L26.6667 10.8333L33.3333 7.5L30.8333 15.8333V23.3333C30.8333 26.2065 29.692 28.962 27.6603 30.9937C25.6287 33.0253 22.8732 34.1667 20 34.1667C17.1268 34.1667 14.3713 33.0253 12.3397 30.9937C10.308 28.962 9.16667 26.2065 9.16667 23.3333V15.8333Z"
        fill={colors.text}
      />
      <Circle cx={16.6667} cy={21.6667} r={1.5} fill={colors.background} />
      <Circle cx={23.3333} cy={21.6667} r={1.5} fill={colors.background} />
    </Svg>
  )
}

/** Collections hub — summary, active track, locked grid, rare teaser. */
export function CollectionPreview({
  collections,
  heroUri,
  onSeeAll,
  onPressCollection,
}: Props) {
  const { colors, spacing, radius, iconSize } = useTheme()
  const active = collections.filter((item) => !item.locked)
  const locked = collections.filter((item) => item.locked)
  const featured = active[0] ?? collections[0]
  const featuredRatio = featured
    ? featured.current / Math.max(1, featured.target)
    : 0
  const inProgressLabel =
    active.length === 1
      ? '1 collection en cours'
      : `${active.length} collections en cours`
  const portraitSize = spacing[80]

  return (
    <View style={{ gap: spacing[24] }}>
      <View style={{ gap: spacing[8] }}>
        <Text variant="title" color="textBrand">
          Collections
        </Text>
        <Text variant="bodySmall" weight="medium" color="textSecondary">
          De nouvelles séries se débloquent au fil de ton aventure.
        </Text>
      </View>

      {featured ? (
        <View
          style={{
            backgroundColor: colors.brandSoft,
            borderRadius: radius.cta,
            padding: spacing[16],
            gap: spacing[16],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[16] }}>
            <View
              style={{
                width: spacing[40],
                height: spacing[40],
                borderRadius: radius.pill,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PawIcon size={iconSize.sm} color={colors.brand} />
            </View>
            <View style={{ flex: 1, gap: spacing[4] }}>
              <Text variant="body" weight="medium" color="textBrand">
                {inProgressLabel}
              </Text>
              <Text variant="caption" weight="medium" color="textBrand">
                {featured.current} / {featured.target} chats
              </Text>
            </View>
          </View>
          <BrandBar progress={featuredRatio} height={spacing[8]} />
        </View>
      ) : null}

      {active.map((collection) => {
        const ratio = collection.current / Math.max(1, collection.target)
        const showHero = collection.id === featured?.id
        return (
          <Pressable
            key={collection.id}
            accessibilityRole="button"
            accessibilityLabel={`${collection.label}, ${collection.current} sur ${collection.target}`}
            onPress={() => onPressCollection?.(collection)}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: radius.cta,
              borderWidth: 1,
              borderColor: colors.brand,
              padding: spacing[16],
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[16],
              opacity: pressed ? 0.94 : 1,
            })}
          >
            <View style={{ width: portraitSize, height: portraitSize }}>
              <View
                style={{
                  width: portraitSize,
                  height: portraitSize,
                  borderRadius: radius.pill,
                  overflow: 'hidden',
                  backgroundColor: colors.surfaceSecondary,
                  borderWidth: 2,
                  borderColor: colors.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showHero && heroUri ? (
                  <CatImage
                    uri={heroUri}
                    resizeMode="cover"
                    style={{ width: portraitSize, height: portraitSize }}
                    accessibilityLabel={collection.label}
                  />
                ) : showHero ? (
                  <Image
                    source={DEMO_CAT_IMAGE}
                    resizeMode="cover"
                    style={{ width: portraitSize, height: portraitSize }}
                    accessibilityLabel={collection.label}
                  />
                ) : (
                  <CatSprite
                    colorLabel={COAT_FOR_ID[collection.id] ?? 'roux'}
                    seed={collection.target}
                    size={portraitSize}
                    faceOnly
                  />
                )}
              </View>
              <View
                pointerEvents="none"
                style={{ position: 'absolute', top: spacing[4], right: 0 }}
              >
                <Sparkle size={12} color={colors.brand} />
              </View>
              <View
                pointerEvents="none"
                style={{ position: 'absolute', bottom: spacing[8], left: 0 }}
              >
                <Sparkle size={8} color={colors.brand} />
              </View>
            </View>

            <View style={{ flex: 1, minWidth: 0, gap: spacing[8] }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[8],
                }}
              >
                <DiamondIcon size={12} color={colors.brand} />
                <Text
                  variant="body"
                  weight="medium"
                  color="textBrand"
                  numberOfLines={1}
                  style={{ flex: 1 }}
                >
                  {collection.label}
                </Text>
                <Text variant="caption" weight="medium" color="textBrand">
                  {collection.current} / {collection.target}
                </Text>
                <ChevronIcon size={iconSize.sm} color={colors.brand} />
              </View>
              <BrandBar progress={ratio} height={spacing[8]} />
              {collection.rewardLabel ? (
                <Text variant="caption" weight="medium" color="textBrand">
                  {collection.rewardLabel}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )
      })}

      {locked.length > 0 ? (
        <View style={{ gap: spacing[16] }}>
          <Text variant="title" color="textBrand">
            À débloquer
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing[16] }}>
            {locked.map((collection) => (
              <View
                key={collection.id}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: radius.cta,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing[16],
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[8],
                }}
              >
                <View style={{ width: spacing[64], height: spacing[64] }}>
                  <View
                    style={{
                      width: spacing[64],
                      height: spacing[64],
                      borderRadius: radius.pill,
                      overflow: 'hidden',
                      backgroundColor: colors.surfaceSecondary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.72,
                    }}
                  >
                    <CatSilhouette size={spacing[40]} />
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      top: -spacing[4],
                      right: -spacing[4],
                      width: spacing[24],
                      height: spacing[24],
                      borderRadius: radius.pill,
                      backgroundColor: colors.brand,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LockIcon size={12} color={colors.onAccent} />
                  </View>
                </View>
                <Text variant="bodySmall" weight="medium" color="text" align="center">
                  {collection.label}
                </Text>
                <Text variant="caption" weight="medium" color="textMuted" align="center">
                  Continue ton aventure
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View
        style={{
          backgroundColor: colors.brandSoft,
          borderRadius: radius.cta,
          paddingVertical: spacing[32],
          paddingHorizontal: spacing[16],
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[16],
        }}
      >
        <View
          style={{
            width: spacing[48],
            height: spacing[48],
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockIcon size={iconSize.md} color={colors.brand} />
        </View>
        <Text variant="body" weight="medium" color="textBrand" align="center">
          Collections rares
        </Text>
        <Text variant="caption" weight="medium" color="textBrand" align="center">
          Mystère
        </Text>
      </View>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Voir toutes les collections"
        onPress={onSeeAll}
        style={{ alignSelf: 'flex-start', paddingVertical: spacing[8] }}
      >
        <Text variant="bodySmall" weight="medium" color="textBrand">
          Voir toutes les collections →
        </Text>
      </Pressable>
    </View>
  )
}
