import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type EmptyStateProps = {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      accessibilityRole="summary"
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing[24],
        gap: spacing[16],
        alignItems: 'center',
      }}
    >
      {illustration}
      <Text variant="h3" align="center">
        {title}
      </Text>
      <Text variant="bodySmall" color="textSecondary" align="center">
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} style={{ alignSelf: 'stretch' }} />
      ) : null}
    </View>
  );
}
