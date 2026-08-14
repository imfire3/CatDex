import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Text } from '@/components/Text';
import { TabStackHeader } from '@/layout/TabStackHeader';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

function goBackFromSettings() {
  if (router.canGoBack()) router.back();
  else router.replace('/settings');
}

/** Shared chrome for profile settings subpages. */
export function SettingsScreen({ title, subtitle, children, footer }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabStackHeader title={title} onBack={goBackFromSettings} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: Math.max(insets.bottom, spacing[24]) + (footer ? spacing[80] : 0),
          gap: spacing[24] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {subtitle ? (
          <Text variant="body" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
        {children}
      </ScrollView>

      {footer ? (
        <View
          style={{
            paddingHorizontal: spacing[24],
            paddingTop: spacing[16],
            paddingBottom: Math.max(insets.bottom, spacing[16]),
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: spacing[8] }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
