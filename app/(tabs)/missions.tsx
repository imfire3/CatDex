import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  CollectionPreview,
  DailyQuestList,
  LockedTeaserList,
  MissionLevelCard,
  WeeklyChallengeCard,
} from '@/components/missions'
import { Text } from '@/components/Text'
import { TabStackHeader } from '@/layout/TabStackHeader'
import {
  buildDailyQuests,
  buildLockedTeasers,
  buildVisibleCollections,
  buildWeeklyQuest,
  estimateTotalXp,
  LEVEL_DEFS,
  nextLevelReward,
  progressionFromTotalXp,
} from '@/lib/progression'
import { useCatsStore } from '@/store/cats'
import { useToastStore } from '@/store/toast'
import { useTheme } from '@/theme'

function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  const { spacing } = useTheme()
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="h3" color="textBrand">
        {title}
      </Text>
      {hint ? (
        <Text variant="bodySmall" color="textSecondary">
          {hint}
        </Text>
      ) : null}
    </View>
  )
}

export default function MissionsScreen() {
  const { colors, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  const cats = useCatsStore((state) => state.cats)
  const showToast = useToastStore((state) => state.show)

  const totalXp = estimateTotalXp(cats)
  const progress = progressionFromTotalXp(totalXp)
  const levelDef = LEVEL_DEFS.find((d) => d.level === progress.level)
  const nextReward = nextLevelReward(progress.level)
  const daily = buildDailyQuests(cats)
  const weekly = buildWeeklyQuest(cats)
  const collections = buildVisibleCollections(cats, progress.level)
  const teasers = buildLockedTeasers(progress.level, cats.length)

  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24]

  const handleSeeRewards = () => {
    const preview = LEVEL_DEFS.slice(0, 8)
      .map((d) => `Niv. ${d.level} · ${d.unlock ?? d.reward ?? d.goal}`)
      .join('\n')
    showToast({
      title: 'Ce qui t’attend',
      description: preview,
      tone: 'default',
    })
  }

  const handleSeeCollections = () => {
    showToast({
      title: 'Autres collections',
      description: 'Continue ton aventure — de nouvelles histoires t’attendent.',
      tone: 'default',
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabStackHeader title="Missions" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          gap: spacing[32],
        }}
      >
        <Text variant="body" color="textBody">
          Chaque mission te rapproche du CatDex ultime.
        </Text>

        <MissionLevelCard
          level={progress.level}
          title={progress.title}
          goal={levelDef?.goal ?? progress.nextReward}
          xpIntoLevel={progress.xpIntoLevel}
          xpMax={progress.xpMax}
          nextLevel={nextReward.nextLevel}
          nextRewardLabel={nextReward.label}
          onSeeRewards={handleSeeRewards}
        />

        <View style={{ gap: spacing[16] }}>
          <SectionLabel title="Aujourd’hui" hint="Termine ces défis avant ce soir." />
          <DailyQuestList quests={daily} />
        </View>

        <View style={{ gap: spacing[16] }}>
          <SectionLabel
            title="En ce moment"
            hint="Un objectif plus ambitieux. Tu as toute la semaine."
          />
          <WeeklyChallengeCard quest={weekly} />
        </View>

        <View style={{ gap: spacing[16] }}>
          <SectionLabel
            title="Collections"
            hint="Chaque collection raconte une nouvelle histoire."
          />
          <CollectionPreview collections={collections} onSeeAll={handleSeeCollections} />
        </View>

        <LockedTeaserList teasers={teasers} />
      </ScrollView>
    </View>
  )
}
