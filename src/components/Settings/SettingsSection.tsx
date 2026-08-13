import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  children: ReactNode;
  /** Visually isolate destructive / account-danger blocks */
  tone?: 'default' | 'danger';
};

/** Section title + card of SettingsRow children. */
export function SettingsSection({ title, children, tone = 'default' }: Props) {
  const { colors, spacing, radius, shadow } = useTheme();

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="title" color={tone === 'danger' ? 'danger' : 'textBrand'}>
        {title}
      </Text>
      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: tone === 'danger' ? colors.dangerSoft : colors.border,
            overflow: 'hidden',
          },
          shadow.low,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
