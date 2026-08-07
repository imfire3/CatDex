import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import type { Mission } from '@/types/cat';

type Props = {
  mission: Mission | null;
  streak: number;
  onContinue: () => void;
};

export function ProfileMissionCard({ mission, streak, onContinue }: Props) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();

  const active = mission && !mission.completed ? mission : null;

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="h3" color="textBrand">
        Mission du jour
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
          shadow.low,
        ]}
      >
        {active ? (
          <>
            <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
              {active.title}
            </Text>
            <Text variant="bodySmall" color="textBody">
              {active.description}
            </Text>
            <Button title="Continuer" onPress={onContinue} />
          </>
        ) : (
          <>
            <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
              Mission accomplie
            </Text>
            <Text variant="bodySmall" color="textBody">
              Reviens demain pour garder ta série{streak > 0 ? ` de ${streak} jour${streak > 1 ? 's' : ''}` : ''}.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
