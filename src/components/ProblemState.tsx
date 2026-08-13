import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction: () => void;
};

/** Full-screen problem state — Oups + clear Retour action. */
export function ProblemState({
  title = 'Oups',
  description = 'Il y a un problème. Réessaie ou reviens en arrière.',
  actionLabel = 'Retour',
  onAction,
}: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + spacing[32],
        paddingBottom: insets.bottom + spacing[24],
        paddingHorizontal: spacing[24],
        justifyContent: 'center',
        gap: spacing[24] }}
      accessibilityRole="alert"
    >
      <View style={{ gap: spacing[8], alignItems: 'center' }}>
        <Text variant="headline" color="textBrand" align="center">
          {title}
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {description}
        </Text>
      </View>
      <Button
        title={actionLabel}
        onPress={onAction}
        accessibilityLabel={actionLabel}
      />
    </View>
  );
}
