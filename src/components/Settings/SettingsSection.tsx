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

/** Section title + settings rows on the canvas — no wrapping card. */
export function SettingsSection({ title, children, tone = 'default' }: Props) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing[16] }}>
      <Text variant="title" color={tone === 'danger' ? 'danger' : 'textBrand'}>
        {title}
      </Text>
      <View>{children}</View>
    </View>
  );
}
