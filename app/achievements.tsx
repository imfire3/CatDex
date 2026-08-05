import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import { useTheme } from '@/theme/ThemeProvider';

type Achievement = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  badgeVariant: 'common' | 'rare' | 'epic' | 'legendary' | 'xp' | 'new';
  badgeLabel: string;
};

const buildAchievements = (catsCount: number, missionsDone: number): Achievement[] => [
  {
    id: 'first-scan',
    title: 'Premier scan',
    description: 'Capture ton premier chat dans la rue.',
    progress: Math.min(catsCount, 1),
    target: 1,
    badgeVariant: 'new',
    badgeLabel: 'Début',
  },
  {
    id: 'collector-5',
    title: 'Collectionneur',
    description: 'Ajoute 5 chats à ton CatDex.',
    progress: Math.min(catsCount, 5),
    target: 5,
    badgeVariant: 'rare',
    badgeLabel: 'Rare',
  },
  {
    id: 'explorer-10',
    title: 'Explorateur urbain',
    description: 'Découvre 10 chats dans ton quartier.',
    progress: Math.min(catsCount, 10),
    target: 10,
    badgeVariant: 'epic',
    badgeLabel: 'Épique',
  },
  {
    id: 'legend-25',
    title: 'Légende du quartier',
    description: 'Atteins 25 chats dans ta collection.',
    progress: Math.min(catsCount, 25),
    target: 25,
    badgeVariant: 'legendary',
    badgeLabel: 'Légendaire',
  },
  {
    id: 'mission-master',
    title: 'Maître des quêtes',
    description: 'Termine ta première mission.',
    progress: Math.min(missionsDone, 1),
    target: 1,
    badgeVariant: 'xp',
    badgeLabel: '+XP',
  },
];

export default function AchievementsScreen() {
  const { colors, fonts, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const catsCount = useCatsStore((state) => state.cats.length);
  const missionsDone = useMissionsStore(
    (state) => state.missions.filter((mission) => mission.completed).length,
  );
  const achievements = buildAchievements(catsCount, missionsDone);
  const unlockedCount = achievements.filter((item) => item.progress >= item.target).length;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[16],
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[12],
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={handleBack}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: colors.surfaceSecondary,
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 6l-6 6 6 6"
              stroke={colors.text}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display, flex: 1 }}>
          Succès
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingBottom: insets.bottom + spacing[32],
          gap: spacing[24],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[16],
              gap: spacing[8],
            },
            shadow.low,
          ]}
        >
          <Text variant="title" color="textBrand">
            Progression
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {unlockedCount} / {achievements.length} succès débloqués
          </Text>
          <ProgressBar
            progress={achievements.length ? unlockedCount / achievements.length : 0}
            height={8}
          />
        </View>

        {achievements.length === 0 ? (
          <EmptyState
            title="Aucun succès"
            description="Explore ton quartier pour débloquer tes premiers badges."
          />
        ) : (
          <View style={{ gap: spacing[16] }}>
            {achievements.map((achievement) => {
              const unlocked = achievement.progress >= achievement.target;
              const ratio = achievement.target
                ? Math.min(1, achievement.progress / achievement.target)
                : 0;

              return (
                <Card key={achievement.id}>
                  <View style={{ gap: spacing[12] }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: spacing[8],
                      }}
                    >
                      <View style={{ flex: 1, gap: spacing[4] }}>
                        <Text variant="title" color="textBrand">
                          {achievement.title}
                        </Text>
                        <Text variant="bodySmall" color="textSecondary">
                          {achievement.description}
                        </Text>
                      </View>
                      <Badge
                        label={unlocked ? 'Débloqué' : achievement.badgeLabel}
                        variant={unlocked ? 'success' : achievement.badgeVariant}
                      />
                    </View>
                    <ProgressBar progress={ratio} height={8} />
                    <Text variant="caption" color="textMuted">
                      {achievement.progress} / {achievement.target}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
