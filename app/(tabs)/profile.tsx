import { router } from 'expo-router'
import { Pressable, ScrollView, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatImage } from '@/components/CatImage'
import { CatSprite } from '@/components/CatSprite'
import {
  ProfileActivityTimeline,
  ProfileBadgeRow,
  ProfileFavoriteEmpty,
  ProfileHero,
  ProfileSettingsLink,
  ProfileStatGrid,
} from '@/components/profile'
import { Text } from '@/components/Text'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TabStackHeader } from '@/layout/TabStackHeader'
import { themeFromColorLabel } from '@/lib/catTheme'
import { enrichAnalysis } from '@/lib/catTraits'
import { isCatPhotoRef } from '@/lib/photoStorage'
import {
  buildProfileBadges,
  buildRecentActivity,
  countUnlockedBadges,
  estimateTotalXp,
  favoriteCat,
  progressionFromTotalXp,
  uniquePlaces,
} from '@/lib/progression'
import { useAuthStore } from '@/store/auth'
import { useCatsStore } from '@/store/cats'
import { useMissionsStore } from '@/store/missions'
import { useToastStore } from '@/store/toast'
import { useTheme } from '@/theme/ThemeProvider'
import type { Cat } from '@/types/cat'

function FavoriteCompact({ cat, onPress }: { cat: Cat; onPress: () => void }) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme()
  const analysis = enrichAnalysis(cat.analysis, cat.number)
  const theme = themeFromColorLabel(analysis.color, cat.number)
  const canShowPhoto =
    Boolean(cat.photoUri) &&
    !cat.photoUri.startsWith('blob:') &&
    (isCatPhotoRef(cat.photoUri) ||
      cat.photoUri.startsWith('data:') ||
      cat.photoUri.startsWith('http') ||
      cat.photoUri.startsWith('file:'))

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="h3" color="textBrand">
        Compagnon favori
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Compagnon favori ${cat.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          {
            borderRadius: radius.cta,
            overflow: 'hidden',
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.md,
            transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
          },
          shadow.low,
        ]}
      >
        <View
          style={{
            width: spacing[64],
            height: spacing[64],
            borderRadius: radius.md,
            overflow: 'hidden',
            backgroundColor: theme.soft,
          }}
        >
          {canShowPhoto ? (
            <CatImage uri={cat.photoUri} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <CatSprite colorLabel={analysis.color} seed={cat.number} size={48} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
            {cat.name}
          </Text>
          <Text variant="caption" color="textMuted">
            Ton compagnon
          </Text>
        </View>
      </Pressable>
    </View>
  )
}

export default function ProfileScreen() {
  const { colors, spacing, motion } = useTheme()
  const insets = useSafeAreaInsets()
  const reduceMotion = useReducedMotion()
  const user = useAuthStore((state) => state.user)
  const cats = useCatsStore((state) => state.cats)
  const streakDays = useMissionsStore((state) => state.streakDays)
  const showToast = useToastStore((state) => state.show)

  const displayName = user?.displayName ?? 'Explorateur'
  const fav = favoriteCat(cats)
  const avatarUri =
    user?.avatarUrl ||
    (fav?.photoUri &&
    !fav.photoUri.startsWith('blob:') &&
    !fav.photoUri.startsWith('catphoto:')
      ? fav.photoUri
      : undefined)

  const totalXp = estimateTotalXp(cats)
  const { level, xpIntoLevel, xpMax } = progressionFromTotalXp(totalXp)
  const places = uniquePlaces(cats)
  const streak = Math.max(streakDays, cats.length > 0 ? 1 : 0)
  const badges = buildProfileBadges(cats, level, streak)
  const badgesCount = countUnlockedBadges(cats, level, streak)
  const activity = buildRecentActivity(cats, level)

  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24]
  const enterHero = reduceMotion ? undefined : FadeIn.duration(motion.duration.slow)
  const enterSections = reduceMotion
    ? undefined
    : FadeInDown.delay(100).duration(motion.duration.slow)

  const goExplore = () => router.push('/(tabs)/map')

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabStackHeader title="Profil" />
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: listBottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enterHero}>
          <ProfileHero
            displayName={displayName}
            avatarUri={avatarUri}
            level={level}
            xpIntoLevel={xpIntoLevel}
            xpMax={xpMax}
          />
        </Animated.View>

        <Animated.View
          entering={enterSections}
          style={{
            paddingHorizontal: spacing[24],
            paddingTop: spacing[32],
            gap: spacing[32],
          }}
        >
          <ProfileStatGrid
            stats={[
              { label: 'Chats', value: String(cats.length) },
              { label: 'Badges', value: String(badgesCount) },
              { label: 'Lieux', value: String(places) },
              { label: 'Jour', value: String(streak) },
            ]}
          />

          {fav ? (
            <FavoriteCompact
              cat={fav}
              onPress={() => router.push({ pathname: '/cat/[id]', params: { id: fav.id } })}
            />
          ) : (
            <ProfileFavoriteEmpty onExplore={goExplore} />
          )}

          <ProfileBadgeRow
            badges={badges}
            onSeeAll={() =>
              showToast({
                title: 'Tes badges',
                description: 'Chaque badge marque une étape de ton aventure.',
                tone: 'default',
              })
            }
          />

          <ProfileActivityTimeline items={activity} />

          <ProfileSettingsLink onPress={() => router.push('/settings')} />
        </Animated.View>
      </ScrollView>
    </View>
  )
}
