import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CAT_LIFESTYLE_OPTIONS } from '@/lib/catLifestyle';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Onboarding callout — street cats appear on the map; pets stay private.
 */
export function LifestyleExplain() {
  const { colors, spacing, radius, shadow, motion, iconStroke } = useTheme();
  const reduceMotion = useReducedMotion();
  const stroke = iconStroke.regular;

  return (
    <Animated.View
      entering={
        reduceMotion ? undefined : FadeInUp.delay(420).duration(motion.duration.slow)
      }
      accessibilityRole="summary"
      accessibilityLabel="Deux types de chats : de rue ou domestique"
      style={{
        alignSelf: 'stretch',
        gap: spacing[8],
        paddingHorizontal: spacing[8],
      }}
    >
      <Text variant="bodySmall" weight="semibold" color="textBrand" align="center">
        Deux types de chats dans CatDex
      </Text>

      {CAT_LIFESTYLE_OPTIONS.map((option) => {
        const street = option.value === 'sauvage';
        return (
          <View
            key={option.value}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing[16],
                padding: spacing[16],
                borderRadius: radius[16],
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
              },
              shadow.low,
            ]}
          >
            <View
              style={{
                width: spacing[40],
                height: spacing[40],
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: street ? colors.brandSoft : colors.surfaceSecondary,
              }}
            >
              {street ? (
                <MapPinIcon color={colors.brand} stroke={stroke} />
              ) : (
                <HomeLockIcon color={colors.textSecondary} stroke={stroke} />
              )}
            </View>
            <View style={{ flex: 1, gap: spacing[4] }}>
              <Text variant="bodySmall" weight="semibold" color="text">
                {option.label}
              </Text>
              <Text variant="caption" color="textSecondary">
                {option.hint}
              </Text>
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
}

function MapPinIcon({ color, stroke }: { color: string; stroke: number }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="10" r="2.4" fill={color} />
    </Svg>
  );
}

function HomeLockIcon({ color, stroke }: { color: string; stroke: number }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11.5 12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-7.5Z"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <Path
        d="M10 20.5v-5h4v5"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
