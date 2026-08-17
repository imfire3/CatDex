import { router } from 'expo-router'
import { Linking, Pressable, ScrollView, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'

import { Button } from '@/components/Button'
import { CatImage } from '@/components/CatImage'
import { CatSprite } from '@/components/CatSprite'
import {
  ProfileActivityTimeline,
  ProfileBadgeRow,
  ProfileFavoriteEmpty,
  ProfileHero,
  ProfileMenuCard,
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
import { SUPPORT_CTA_LABEL, SUPPORT_REVOLUT_URL } from '@/lib/supportLinks'
import { useAuthStore } from '@/store/auth'
import { useCatsStore } from '@/store/cats'
import { useMissionsStore } from '@/store/missions'
import { useToastStore } from '@/store/toast'
import { useTheme } from '@/theme/ThemeProvider'
import type { Cat } from '@/types/cat'

function FavoriteCompact({ cat, onPress }: { cat: Cat; onPress: () => void }) {
  const { colors, spacing, radius, shadow, motion } = useTheme()
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
      <Text variant="title" color="textBrand">
        Compagnon favori
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Compagnon favori ${cat.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          {
            borderRadius: radius.lg,
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
            backgroundColor: theme.soft }}
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
          <Text variant="body" weight="semibold" color="text">
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
  const signOut = useAuthStore((state) => state.signOut)
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
  const { level } = progressionFromTotalXp(totalXp)
  const places = uniquePlaces(cats)
  const streak = Math.max(streakDays, cats.length > 0 ? 1 : 0)
  const badges = buildProfileBadges(cats, level, streak)
  const badgesCount = countUnlockedBadges(cats, level, streak)
  const activity = buildRecentActivity(cats, level)

  const listBottom = spacing[24]
  const enterHero = reduceMotion ? undefined : FadeIn.duration(motion.duration.slow)
  const enterSections = reduceMotion
    ? undefined
    : FadeInDown.delay(100).duration(motion.duration.slow)

  const goExplore = () => router.push('/(tabs)/map')
  const goEdit = () => router.push('/settings/edit-profile')

  const handleSignOut = () => {
    void (async () => {
      try {
        await signOut()
      } finally {
        router.replace('/(auth)/welcome')
      }
    })()
  }

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
            subtitle={user?.email}
            avatarUri={avatarUri}
            level={level}
            onEdit={goEdit}
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

          {fav ? (
            <FavoriteCompact
              cat={fav}
              onPress={() => router.push({ pathname: '/cat/[id]', params: { id: fav.id } })}
            />
          ) : (
            <ProfileFavoriteEmpty onExplore={goExplore} />
          )}

          <ProfileMenuCard
            onEditProfile={goEdit}
            onNotifications={() => router.push('/settings/notifications')}
            onPrivacy={() => router.push('/settings/privacy')}
            onSettings={() => router.push('/settings')}
          />
        </Animated.View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: Math.max(insets.bottom, spacing[16]),
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: spacing[8],
        }}
      >
        <Button
          title={SUPPORT_CTA_LABEL}
          variant="secondary"
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 20.4S3.6 14.7 3.6 9.2A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8.4 2.6c0 5.5-8.4 11.2-8.4 11.2Z"
                fill={colors.brand}
              />
            </Svg>
          }
          onPress={() => {
            void Linking.openURL(SUPPORT_REVOLUT_URL)
          }}
          accessibilityLabel="Soutenir CatDex via Revolut"
        />
        <Button
          title="Déconnexion"
          variant="destructive"
          onPress={handleSignOut}
          accessibilityLabel="Se déconnecter"
        />
      </View>
    </View>
  )
}
