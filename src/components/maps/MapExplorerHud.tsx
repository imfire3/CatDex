/**
 * Floating map chrome — profile, notifications inbox, map settings,
 * recenter, Missions / Capture / CatDex.
 */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { Text } from '@/components/Text';
import {
  getMapActionClusterBottom,
  MAP_CAPTURE_FAB_SIZE,
} from '@/layout/tabBarMetrics';
import { useAuthStore } from '@/store/auth';
import {
  selectUnreadCount,
  useNotificationsStore,
} from '@/store/notifications';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  missionCount?: number;
  collectionCount?: number;
  onRecenter?: () => void;
  captureHighlighted?: boolean;
  /** Intercept Capture FAB (e.g. camera permission gate). */
  onCapturePress?: () => void;
};

function RoundTool({
  label,
  onPress,
  badge,
  children,
}: {
  label: string;
  onPress: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: spacing[48],
          height: spacing[48],
          borderRadius: radius.full,
          backgroundColor: colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        },
        shadow.medium,
      ]}
    >
      {children}
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
            {badge > 9 ? '9+' : String(badge)}
          </Text>
        </View>
      ) : null}
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
  onRecenter,
  captureHighlighted = false,
  onCapturePress,
}: Props) {
  const { colors, spacing, radius, shadow, iconStroke, iconSize, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const unread = useNotificationsStore((state) => selectUnreadCount(state.items));
  const clusterBottom = getMapActionClusterBottom(insets.bottom, spacing);
  const stroke = iconStroke.regular;
  const initials = (
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'CD'
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + spacing[8],
          left: spacing[16],
          zIndex: 24,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le profil"
          onPress={() => router.push('/(tabs)/profile')}
          style={({ pressed }) => [
            {
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: colors.surfaceElevated,
              backgroundColor: colors.surfaceElevated,
              transform: [{ scale: pressed ? motion.pressScale : 1 }],
            },
            shadow.medium,
          ]}
        >
          <Avatar
            size="L"
            source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
            initials={initials}
            gradient={!user?.avatarUrl}
            accessibilityLabel="Photo de profil"
          />
        </Pressable>
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + spacing[8],
          right: spacing[16],
          zIndex: 24,
          flexDirection: 'row',
          gap: spacing[8],
        }}
      >
        <RoundTool
          label="Notifications"
          badge={unread}
          onPress={() => router.push('/notifications')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3V9ZM9.5 19h5"
              stroke={colors.brand}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </RoundTool>
        <RoundTool
          label="Réglages de la carte"
          onPress={() => router.push('/settings/map')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h8M16 17h4"
              stroke={colors.brand}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <Circle cx="16" cy="7" r="2" stroke={colors.brand} strokeWidth={stroke} />
            <Circle cx="9" cy="12" r="2" stroke={colors.brand} strokeWidth={stroke} />
            <Circle cx="14" cy="17" r="2" stroke={colors.brand} strokeWidth={stroke} />
          </Svg>
        </RoundTool>
      </View>

      {onRecenter ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            right: spacing[16],
            bottom: clusterBottom + MAP_CAPTURE_FAB_SIZE + spacing[16],
            zIndex: 20,
          }}
        >
          <RoundTool label="Recentrer sur ma position" onPress={onRecenter}>
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="6" stroke={colors.brand} strokeWidth={stroke} />
              <Path
                d="M12 3v3M12 18v3M3 12h3M18 12h3"
                stroke={colors.brand}
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            </Svg>
          </RoundTool>
        </View>
      ) : null}

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
          onPress={() => {
            if (onCapturePress) {
              onCapturePress();
              return;
            }
            router.push('/scanner');
          }}
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
