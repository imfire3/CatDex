import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { TabStackHeader } from '@/layout/TabStackHeader';
import {
  buildCollections,
  buildDailyQuests,
  buildMonthlyQuest,
  buildSpecialMission,
  buildWeeklyQuest,
  CATDEX_GOAL,
  estimateTotalXp,
  LEVEL_DEFS,
  progressionFromTotalXp,
  type QuestItem,
} from '@/lib/progression';
import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import { useTheme } from '@/theme/ThemeProvider';

function RewardChip({ label }: { label: string }) {
  const { colors, fonts, spacing, radius } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: colors.accentSoft,
        borderRadius: radius.full,
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[8],
      }}
    >
      <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
        {label}
      </Text>
    </View>
  );
}

function QuestRow({ quest, compact }: { quest: QuestItem; compact?: boolean }) {
  const { colors, fonts, spacing, radius } = useTheme();
  const soft =
    quest.tone === 'success'
      ? colors.successSoft
      : quest.tone === 'warning'
        ? colors.warningSoft
        : quest.tone === 'danger'
          ? colors.dangerSoft
          : quest.tone === 'info'
            ? colors.infoSoft
            : colors.accentSoft;
  const ink =
    quest.tone === 'success'
      ? colors.success
      : quest.tone === 'warning'
        ? colors.warning
        : quest.tone === 'danger'
          ? colors.danger
          : quest.tone === 'info'
            ? colors.info
            : colors.accent;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[16],
        opacity: quest.completed ? 0.72 : 1,
      }}
    >
      <View
        style={{
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius.full,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: spacing[16],
            height: spacing[16],
            borderRadius: radius.full,
            backgroundColor: ink,
          }}
        />
      </View>
      <View style={{ flex: 1, gap: compact ? spacing[4] : spacing[8] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[8] }}>
          <Text variant="body" color="text" style={{ flex: 1, fontFamily: fonts.bodySemi }}>
            {quest.title}
          </Text>
          <Text variant="caption" style={{ color: ink, fontFamily: fonts.bodySemi }}>
            {quest.completed ? 'OK' : quest.rewardLabel}
          </Text>
        </View>
        {quest.description ? (
          <Text variant="caption" color="textMuted">
            {quest.description}
          </Text>
        ) : null}
        {!compact ? (
          <View style={{ gap: spacing[4] }}>
            <ProgressBar progress={quest.target ? quest.current / quest.target : 0} height={8} />
            <Text variant="caption" color="textSecondary">
              {quest.current}/{quest.target}
            </Text>
          </View>
        ) : (
          <Text variant="caption" color="textSecondary">
            {quest.current}/{quest.target}
          </Text>
        )}
      </View>
    </View>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  const { fonts, spacing } = useTheme();
  return (
    <View style={{ gap: spacing[4] }}>
      <Text variant="h3" color="textBrand" style={{ fontFamily: fonts.display }}>
        {title}
      </Text>
      {hint ? (
        <Text variant="bodySmall" color="textBody">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export default function MissionsScreen() {
  const { colors, fonts, spacing, radius, shadow, iconStroke, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const cats = useCatsStore((state) => state.cats);
  const streakDays = useMissionsStore((state) => state.streakDays);

  const totalXp = estimateTotalXp(cats);
  const { level, xpIntoLevel, xpMax, title, nextReward } = progressionFromTotalXp(totalXp);
  const weekly = buildWeeklyQuest(cats);
  const monthly = buildMonthlyQuest(cats);
  const daily = buildDailyQuests(cats);
  const special = buildSpecialMission(cats);
  const collections = buildCollections(cats);
  const levelDef = LEVEL_DEFS.find((item) => item.level === level);
  const dexProgress = Math.min(1, cats.length / CATDEX_GOAL);
  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24];

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
          Le moteur de ton CatDex — XP, défis et collections à compléter.
        </Text>

        <Card>
          <View style={{ gap: spacing[16] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: spacing[4] }}>
                <Text variant="caption" color="textMuted" style={{ fontFamily: fonts.bodySemi }}>
                  NIVEAU
                </Text>
                <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
                  Niveau {level}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {title}
                  {levelDef ? ` · ${levelDef.goal}` : ''}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: spacing[16],
                  paddingVertical: spacing[8],
                  borderRadius: radius.full,
                  backgroundColor: colors.warningSoft,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[8],
                }}
              >
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3c2 3 1 5-1 7 3 0 6 2 6 6a5 5 0 1 1-10 0c0-4 3-7 5-13Z"
                    fill={colors.warning}
                  />
                </Svg>
                <Text variant="caption" style={{ color: colors.warning, fontFamily: fonts.bodySemi }}>
                  {Math.max(streakDays, cats.length > 0 ? 1 : 0)} j
                </Text>
              </View>
            </View>

            <ProgressBar progress={xpMax ? xpIntoLevel / xpMax : 0} height={spacing[8]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.bodySemi }}>
                {xpIntoLevel.toLocaleString('fr-FR')} / {xpMax.toLocaleString('fr-FR')} XP
              </Text>
              <Text variant="caption" color="textMuted">
                CatDex {cats.length}/{CATDEX_GOAL}
              </Text>
            </View>
            <ProgressBar progress={dexProgress} height={4} />
            <View style={{ gap: spacing[8] }}>
              <Text variant="caption" color="textMuted">
                Prochaine récompense
              </Text>
              <RewardChip label={nextReward} />
            </View>
          </View>
        </Card>

        <View style={{ gap: spacing[16] }}>
          <SectionTitle title="Objectif de la semaine" hint="Reviens chaque jour pour garder ta série." />
          <Card>
            <View style={{ gap: spacing[16] }}>
              <QuestRow quest={weekly} />
              <RewardChip label={`Récompense · ${weekly.rewardLabel}`} />
            </View>
          </Card>
        </View>

        <View style={{ gap: spacing[16] }}>
          <SectionTitle title="Défi mensuel" />
          <Card>
            <View style={{ gap: spacing[16] }}>
              <QuestRow quest={monthly} />
              <RewardChip label={`Récompense · ${monthly.rewardLabel}`} />
            </View>
          </Card>
        </View>

        <View style={{ gap: spacing[16] }}>
          <SectionTitle title="Quêtes quotidiennes" hint="Simples, rapides, à enchaîner." />
          <Card>
            <View style={{ gap: spacing[24] }}>
              {daily.map((quest) => (
                <QuestRow key={quest.id} quest={quest} compact />
              ))}
            </View>
          </Card>
        </View>

        <View style={{ gap: spacing[16] }}>
          <SectionTitle title="Missions spéciales" />
          <Card>
            <View style={{ gap: spacing[16] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge label="Événement" variant="warning" />
                {special.completed ? <Badge label="Terminée" variant="success" /> : null}
              </View>
              <QuestRow quest={special} />
            </View>
          </Card>
        </View>

        <View style={{ gap: spacing[16] }}>
          <SectionTitle
            title="Collections"
            hint="Complète chaque set pour XP, titre, badge et cadre."
          />
          <View style={{ gap: spacing[16] }}>
            {collections.map((track) => {
              const done = track.current >= track.target;
              return (
                <Pressable
                  key={track.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${track.label} ${track.current} sur ${track.target}`}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderColor: done ? colors.accent : colors.border,
                      padding: spacing[16],
                      gap: spacing[8],
                      opacity: pressed ? 0.92 : 1,
                    },
                    shadow.low,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[16] }}>
                    <View
                      style={{
                        width: spacing[32],
                        height: spacing[32],
                        borderRadius: radius.sm,
                        borderWidth: 2,
                        borderColor: done ? colors.accent : colors.borderDefault,
                        backgroundColor: done ? colors.accentSoft : colors.surfaceSecondary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {done ? (
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M6 12.5 10 16.5 18 8"
                            stroke={colors.accent}
                            strokeWidth={iconStroke.bold}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      ) : null}
                    </View>
                    <View style={{ flex: 1, gap: spacing[4] }}>
                      <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
                        {track.label}
                      </Text>
                      <Text variant="caption" color="textMuted">
                        {track.rewardLabel}
                      </Text>
                    </View>
                    <Text variant="caption" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                      {track.current}/{track.target}
                    </Text>
                  </View>
                  <ProgressBar progress={track.target ? track.current / track.target : 0} height={6} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing[16] }}>
          <SectionTitle title="Prochains niveaux" />
          <Card padded={false}>
            <View>
              {LEVEL_DEFS.filter((def) => def.level >= level && def.level <= level + 4).map(
                (def, index, arr) => (
                  <View
                    key={def.level}
                    style={{
                      padding: spacing[16],
                      borderBottomWidth: index === arr.length - 1 ? 0 : 1,
                      borderBottomColor: colors.border,
                      gap: spacing[4],
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: spacing[8],
                      }}
                    >
                      <Text variant="body" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                        Niveau {def.level} · {def.title}
                      </Text>
                      {def.level === level ? <Badge label="En cours" variant="accent" /> : null}
                    </View>
                    <Text variant="bodySmall" color="textBody">
                      {def.goal}
                    </Text>
                    {def.unlock || def.reward ? (
                      <Text variant="caption" color="textMuted">
                        {def.unlock ? `Débloque · ${def.unlock}` : null}
                        {def.unlock && def.reward ? ' · ' : null}
                        {def.reward ? `Récompense · ${def.reward}` : null}
                      </Text>
                    ) : null}
                  </View>
                ),
              )}
            </View>
          </Card>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing[16],
            alignItems: 'center',
            padding: spacing[16],
            borderRadius: radius.lg,
            backgroundColor: colors.surfaceSecondary,
          }}
        >
          <View
            style={{
              width: spacing[40],
              height: spacing[40],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
                fill={colors.brand}
              />
            </Svg>
          </View>
          <View style={{ flex: 1, gap: spacing[4] }}>
            <Text variant="bodySmall" color="text" style={{ fontFamily: fonts.bodySemi }}>
              Coffre quotidien bientôt
            </Text>
            <Text variant="caption" color="textMuted">
              Calendrier de connexion, classement local et cosmétiques arrivent ensuite.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
