import { View } from 'react-native';

import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { MAX_LEVEL } from '@/lib/progression';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpMax: number;
};

export function ProfileProgressCard({ level, title, xpIntoLevel, xpMax }: Props) {
  const { colors, spacing, radius, shadow } = useTheme();
  const percent = xpMax > 0 ? Math.round((xpIntoLevel / xpMax) * 100) : 0;
  const remaining = Math.max(0, xpMax - xpIntoLevel);
  const atMax = level >= MAX_LEVEL;

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="title" color="textBrand">
        Ton parcours
      </Text>
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[24],
            gap: spacing[16],
          },
          shadow.medium,
        ]}
      >
        <View style={{ gap: spacing[4] }}>
          <Text variant="title" color="text">
            Niveau {level}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {title}
          </Text>
        </View>
        <ProgressBar progress={xpMax ? xpIntoLevel / xpMax : 0} height={12} />
        <Text variant="caption" weight="semibold" color="textMuted">
          {percent}%
        </Text>
        <Text variant="body" color="textBody">
          {atMax
            ? 'Niveau max atteint — tu es une légende du quartier.'
            : `Plus que ${remaining.toLocaleString('fr-FR')} XP pour atteindre le niveau ${level + 1}.`}
        </Text>
      </View>
    </View>
  );
}
