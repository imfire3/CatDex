import { router } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CollectionPreview, DailyQuestList } from '@/components/missions'
import { Text } from '@/components/Text'
import { TabStackHeader } from '@/layout/TabStackHeader'
import {
  buildDailyQuests,
  buildVisibleCollections,
  estimateTotalXp,
  progressionFromTotalXp,
} from '@/lib/progression'
import { useCatsStore } from '@/store/cats'
import { useMissionsStore } from '@/store/missions'
import { useToastStore } from '@/store/toast'
import { useTheme } from '@/theme'

export default function MissionsScreen() {
  const { colors, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  const cats = useCatsStore((state) => state.cats)
  const streakDays = useMissionsStore((state) => state.streakDays)
  const showToast = useToastStore((state) => state.show)

  const totalXp = estimateTotalXp(cats)
  const progress = progressionFromTotalXp(totalXp)
  const collections = buildVisibleCollections(cats, progress.level)
  const daily = buildDailyQuests(cats, { streakDays })

  const heroUri = useMemo(() => {
    const featured = collections.find((item) => !item.locked) ?? collections[0]
    if (!featured) return null
    const match = cats.find(
      (cat) =>
        featured.match(cat) &&
        cat.photoUri &&
        !cat.photoUri.startsWith('blob:'),
    )
    return match?.photoUri ?? null
  }, [cats, collections])

  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24]

  const handleSeeCollections = () => {
    showToast({
      title: 'Autres collections',
      description: 'Continue ton aventure — de nouvelles histoires t’attendent.',
      tone: 'default',
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabStackHeader
        title="Missions"
        density="compact"
        onBack={() => router.replace('/(tabs)/map')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          gap: spacing[24],
        }}
      >
        <CollectionPreview
          collections={collections}
          heroUri={heroUri}
          onSeeAll={handleSeeCollections}
          onPressCollection={() => router.push('/(tabs)/catdex')}
        />

        <View style={{ gap: spacing[16] }}>
          <View style={{ gap: spacing[4] }}>
            <Text variant="title" color="textBrand">
              Aujourd’hui
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              Trois objectifs liés à tes captures.
            </Text>
          </View>
          <DailyQuestList
            quests={daily}
            onPress={(quest) => {
              if (quest.completed) return
              if (quest.id === 'daily-scan') router.push('/scanner')
              else router.push('/(tabs)/map')
            }}
          />
        </View>
      </ScrollView>
    </View>
  )
}
