import { View } from 'react-native';

import { SettingsScreen } from '@/components/Settings';
import { Text } from '@/components/Text';
import {
  CATDEX_GOAL,
  estimateTotalXp,
  progressionFromTotalXp,
  uniquePlaces,
} from '@/lib/progression';
import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import { useTheme } from '@/theme/ThemeProvider';

function StatRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing[16],
        paddingVertical: spacing[16],
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border }}
    >
      <Text variant="body" color="textSecondary">
        {label}
      </Text>
      <Text variant="body" weight="semibold" color="text">
        {value}
      </Text>
    </View>
  );
}

export default function StatsSettingsScreen() {
  const { spacing } = useTheme();
  const cats = useCatsStore((s) => s.cats);
  const streakDays = useMissionsStore((s) => s.streakDays);
  const missions = useMissionsStore((s) => s.missions);

  const totalXp = estimateTotalXp(cats);
  const { level, xpIntoLevel, xpMax, title } = progressionFromTotalXp(totalXp);
  const places = uniquePlaces(cats);
  const streak = Math.max(streakDays, cats.length > 0 ? 1 : 0);
  const badges = Math.min(cats.length, 12);
  const missionsDone = missions.filter((m) => m.completed).length;

  return (
    <SettingsScreen
      title="Mes statistiques"
      subtitle="Ta progression d’explorateur, en un coup d’œil."
    >
      <View>
        <View style={{ paddingVertical: spacing[16], gap: spacing[4] }}>
          <Text variant="caption" weight="semibold" color="textMuted">
            Titre
          </Text>
          <Text variant="title" color="textBrand">
            {title}
          </Text>
        </View>
        <StatRow label="Niveau" value={`Nv. ${level}`} />
        <StatRow
          label="XP"
          value={`${xpIntoLevel.toLocaleString('fr-FR')} / ${xpMax.toLocaleString('fr-FR')}`}
        />
        <StatRow label="Chats découverts" value={`${cats.length} / ${CATDEX_GOAL}`} />
        <StatRow label="Chats capturés" value={`${cats.length}`} />
        <StatRow label="Badges" value={`${badges}`} />
        <StatRow label="Missions terminées" value={`${missionsDone}`} />
        <StatRow label="Série actuelle" value={`${streak} j`} />
        <StatRow label="Lieux explorés" value={`${places}`} last />
      </View>
    </SettingsScreen>
  );
}
