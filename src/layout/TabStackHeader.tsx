import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  /** Optional trailing control (counter, share, …). */
  right?: ReactNode;
  /** Defaults to Explorer map. */
  onBack?: () => void;
  /** Extra content under the title row (e.g. filters) that stays sticky. */
  below?: ReactNode;
};

function goBackToMap() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/map');
}

/**
 * Sticky top chrome for CatDex / Missions / Profil — back + centered title.
 * Used when the floating tab bar is hidden on those screens.
 */
export function TabStackHeader({ title, right, onBack = goBackToMap, below }: Props) {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top + spacing[8],
        paddingHorizontal: spacing[24],
        paddingBottom: spacing[16],
        gap: spacing[16],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        zIndex: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: spacing[40] }}>
        <View style={{ flex: 1, alignItems: 'flex-start', zIndex: 1 }}>
          <AuthBackButton onPress={onBack} />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            variant="h3"
            color="textBrand"
            align="center"
            style={{ fontFamily: fonts.display }}
          >
            {title}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', zIndex: 1 }}>
          {right ?? <View style={{ width: spacing[40], height: spacing[40] }} />}
        </View>
      </View>
      {below}
    </View>
  );
}
