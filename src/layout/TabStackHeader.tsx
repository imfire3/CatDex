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
 * Matches Figma header: px 24, py 16, equal side balance, title scales on narrow screens.
 */
export function TabStackHeader({ title, right, onBack = goBackToMap, below }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const side = spacing[40];

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingTop: insets.top,
        paddingHorizontal: spacing[24],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        zIndex: 2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: side,
          width: '100%',
          paddingVertical: spacing[16],
        }}
      >
        <View style={{ flex: 1, alignItems: 'flex-start', zIndex: 1, minWidth: side }}>
          <AuthBackButton onPress={onBack} />
        </View>

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: side + spacing[8],
            right: side + spacing[8],
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing[16],
          }}
        >
          <Text
            variant="title"
            color="textBrand"
            align="center"
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {title}
          </Text>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', zIndex: 1, minWidth: side }}>
          {right ?? <View style={{ width: side, height: side }} />}
        </View>
      </View>
      {below ? <View style={{ paddingBottom: spacing[16] }}>{below}</View> : null}
    </View>
  );
}
