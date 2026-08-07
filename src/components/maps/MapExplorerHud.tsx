/**
 * Floating map chrome — matches Explorer mock:
 * right tool stack + Missions / Capture / Collection cluster above the tab bar.
 */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import {
  getMapActionClusterBottom,
  getMapSideToolsBottom,
  MAP_CAPTURE_FAB_SIZE,
} from '@/layout/tabBarMetrics';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  missionCount?: number;
  collectionCount?: number;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  onRecenter?: () => void;
  onNavigateNearest?: () => void;
  captureHighlighted?: boolean;
};

function RoundTool({
  label,
  active,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(active) }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: spacing[48],
          height: spacing[48],
          borderRadius: radius.full,
          backgroundColor: active ? colors.brand : colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        },
        shadow.medium,
      ]}
    >
      {children}
    </Pressable>
  );
}

function HudPill({
  label,
  badge,
  onPress,
  icon,
}: {
  label: string;
  badge?: number;
  onPress: () => void;
  icon: React.ReactNode;
}) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: spacing[48],
          paddingHorizontal: spacing[16],
          borderRadius: radius.full,
          backgroundColor: colors.surfaceElevated,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[8],
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        },
        shadow.medium,
      ]}
    >
      {icon}
      <Text
        variant="bodySmall"
        color="textBrand"
        style={{ fontFamily: fonts.bodySemi }}
      >
        {label}
      </Text>
      {typeof badge === 'number' && badge > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: -spacing[4],
            right: -spacing[4],
            minWidth: spacing[24],
            height: spacing[24],
            paddingHorizontal: spacing[4],
            borderRadius: radius.full,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.surfaceElevated,
          }}
        >
          <Text
            variant="caption"
            color="onAccent"
            style={{ fontFamily: fonts.bodySemi, lineHeight: 14 }}
          >
            {badge > 99 ? '99+' : String(badge)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function MapExplorerHud({
  missionCount = 0,
  collectionCount = 0,
  filtersOpen = false,
  onToggleFilters,
  onRecenter,
  onNavigateNearest,
  captureHighlighted = false,
}: Props) {
  const { colors, spacing, radius, shadow, iconStroke, iconSize, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const clusterBottom = getMapActionClusterBottom(insets.bottom, spacing);
  const toolsBottom = getMapSideToolsBottom(insets.bottom, spacing);
  const stroke = iconStroke.regular;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {/* Right tool stack */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          right: spacing[16],
          bottom: toolsBottom,
          gap: spacing[8],
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <RoundTool
          label="Filtres"
          active={filtersOpen}
          onPress={() => onToggleFilters?.()}
        >
          <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 6h16l-6 7.5V18l-4 2v-6.5L4 6Z"
              stroke={filtersOpen ? colors.onBrand : colors.brand}
              strokeWidth={stroke}
              strokeLinejoin="round"
            />
          </Svg>
        </RoundTool>

        {/* Navigation arrow = “ma position” (Maps convention). Never open a cat sheet here. */}
        <RoundTool label="Recentrer sur ma position" onPress={() => onRecenter?.()}>
          <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3.5 20 19.5 12 15.8 4 19.5 12 3.5Z"
              stroke={colors.brand}
              strokeWidth={stroke}
              strokeLinejoin="round"
              fill={colors.brandSoft}
            />
          </Svg>
        </RoundTool>

        <RoundTool label="Aller au chat le plus proche" onPress={() => onNavigateNearest?.()}>
          <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 4.5c-2.6 0-4.7 2-4.7 4.5 0 3.4 4.7 8.5 4.7 8.5s4.7-5.1 4.7-8.5c0-2.5-2.1-4.5-4.7-4.5Z"
              stroke={colors.brand}
              strokeWidth={stroke}
              strokeLinejoin="round"
              fill={colors.brandSoft}
            />
            <Circle cx="12" cy="9" r="1.6" fill={colors.brand} />
          </Svg>
        </RoundTool>
      </View>

      {/* Missions · Capture · Collection */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: spacing[16],
          right: spacing[16],
          bottom: clusterBottom,
          zIndex: 22,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[8],
        }}
      >
        <HudPill
          label="Missions"
          badge={missionCount}
          onPress={() => router.push('/(tabs)/missions')}
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
                fill={colors.brand}
              />
            </Svg>
          }
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Photographier un chat"
          onPress={() => router.push('/scanner')}
          style={({ pressed }) => [
            {
              width: MAP_CAPTURE_FAB_SIZE,
              height: MAP_CAPTURE_FAB_SIZE,
              borderRadius: radius.full,
              backgroundColor: captureHighlighted ? colors.brandPressed : colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? motion.pressScale : 1 }],
            },
            shadow.glow,
          ]}
        >
          <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
            <Path
              d="M8 8.5 9.2 6h5.6L16 8.5h1.5A2.5 2.5 0 0 1 20 11v6a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17v-6A2.5 2.5 0 0 1 6.5 8.5H8Z"
              stroke={colors.onBrand}
              strokeWidth={stroke}
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="14" r="3.1" stroke={colors.onBrand} strokeWidth={stroke} />
          </Svg>
        </Pressable>

        <HudPill
          label="Mon CatDex"
          badge={collectionCount}
          onPress={() => router.push('/(tabs)/catdex')}
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect
                x="5"
                y="4"
                width="14"
                height="16"
                rx="2"
                stroke={colors.brand}
                strokeWidth={stroke}
              />
              <Path
                d="M9 4v16M9 9h6"
                stroke={colors.brand}
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            </Svg>
          }
        />
      </View>
    </View>
  );
}
