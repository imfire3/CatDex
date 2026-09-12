import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Button } from '@/components/Button';
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
  /** Top-level tabs do not need a back affordance. */
  showBack?: boolean;
  /** Figma Missions header: 48px icon button, 16px title, no divider. */
  density?: 'default' | 'compact';
};

function goBackToMap() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/map');
}

/**
 * Sticky top chrome for CatDex / Missions / Profil — back + centered title.
 * Matches Figma header: px 24, py 16, equal side balance, title scales on narrow screens.
 */
export function TabStackHeader({
  title,
  right,
  onBack = goBackToMap,
  below,
  showBack = true,
  density = 'default',
}: Props) {
  const { colors, spacing, iconSize } = useTheme();
  const insets = useSafeAreaInsets();
  const compact = density === 'compact';
  const side = compact ? spacing[48] : spacing[40];
  const rowPad = compact ? spacing[8] : spacing[16];
  const titleVariant = compact ? 'button' : 'title';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingTop: insets.top,
        paddingHorizontal: spacing[24],
        borderBottomWidth: compact ? 0 : 1,
        borderBottomColor: colors.border,
        width: '100%',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: side,
          width: '100%',
          paddingVertical: rowPad,
          gap: compact ? spacing[8] : 0,
        }}
      >
        <View style={{ flex: 1, alignItems: 'flex-start', zIndex: 1, minWidth: side }}>
          {showBack ? (
            compact ? (
              <Button
                variant="icon"
                accessibilityLabel="Retour"
                onPress={onBack}
                style={{ borderWidth: 1 }}
                icon={
                  <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M15 18l-6-6 6-6"
                      stroke={colors.brand}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                }
              />
            ) : (
              <AuthBackButton onPress={onBack} />
            )
          ) : (
            <View style={{ width: side, height: side }} />
          )}
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
            paddingVertical: rowPad,
          }}
        >
          <Text
            variant={titleVariant}
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
      {below ? (
        <View style={{ paddingBottom: spacing[16], width: '100%', minWidth: 0 }}>
          {below}
        </View>
      ) : null}
    </View>
  );
}
