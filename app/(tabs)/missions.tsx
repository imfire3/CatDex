import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ProgressBar, XPBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import { useTheme } from '@/theme/ThemeProvider';

export default function MissionsScreen() {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const missions = useMissionsStore((state) => state.missions);
  const catsCount = useCatsStore((state) => state.cats.length);
  const done = missions.filter((m) => m.completed).length;
  const level = Math.max(1, Math.floor(catsCount / 3) + 1);
  const xp = (catsCount % 3) * 40 + done * 20;
  const xpMax = 120;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[24],
          paddingBottom: spacing[96] + spacing[24],
          gap: spacing[24],
        }}
      >
        <View style={{ gap: spacing[8] }}>
          <Text variant="h1">Missions</Text>
          <Text variant="body" color="textBody">
            Gagne de l’XP, remplis tes objectifs, progresse comme un dresseur urbain.
          </Text>
        </View>

        <XPBar level={level} xp={xp} xpMax={xpMax} />

        <View
          style={[
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[16],
              gap: spacing[8],
            },
            shadow.small,
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="h3">Objectif hebdo</Text>
            <Text variant="caption" color="accent" style={{ fontFamily: fonts.bodySemi }}>
              {done}/{missions.length}
            </Text>
          </View>
          <ProgressBar progress={missions.length ? done / missions.length : 0} height={8} />
        </View>

        <View style={{ gap: spacing[16] }}>
          <Text variant="h3">Quêtes du jour</Text>
          {missions.map((mission) => (
            <Card key={mission.id}>
              <View style={{ gap: spacing[8] }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: spacing[8],
                  }}
                >
                  <Text variant="h3" style={{ flex: 1 }}>
                    {mission.title}
                  </Text>
                  <Badge
                    label={mission.completed ? 'Terminée' : 'En cours'}
                    variant={mission.completed ? 'success' : 'accent'}
                  />
                </View>
                <Text variant="bodySmall" color="textBody">
                  {mission.description}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
