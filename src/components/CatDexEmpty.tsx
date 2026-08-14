import { Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { IconMap, IconPin } from '@/components/Settings/settingsIcons';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  onExplore: () => void;
};

function Sparkle({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5 13.6 10.4 21.5 12 13.6 13.6 12 21.5 10.4 13.6 2.5 12 10.4 10.4Z"
        fill={color}
      />
    </Svg>
  );
}

function PawPrint({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="15.5" r="3.2" fill={color} />
      <Circle cx="7.2" cy="10.2" r="1.8" fill={color} />
      <Circle cx="16.8" cy="10.2" r="1.8" fill={color} />
      <Circle cx="9.2" cy="7.2" r="1.5" fill={color} />
      <Circle cx="14.8" cy="7.2" r="1.5" fill={color} />
    </Svg>
  );
}

function SleepingCatFace({
  color,
  blush,
  size,
}: {
  color: string;
  blush: string;
  size: number;
}) {
  const { iconStroke } = useTheme();
  const stroke = iconStroke.bold;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.2 10.2 8.6 4.6 12 9.2"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.8 10.2 15.4 4.6 12 9.2"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="14" r="6.2" stroke={color} strokeWidth={stroke} />
      <Circle cx="8.2" cy="15.2" r="1.7" fill={blush} fillOpacity={0.35} />
      <Circle cx="15.8" cy="15.2" r="1.7" fill={blush} fillOpacity={0.35} />
      <Path
        d="M8.4 13.2q1.6 1.7 3.2 0"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <Path
        d="M12.4 13.2q1.6 1.7 3.2 0"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <Path
        d="M10.1 16.6q.9 1.3 1.9.2q.9 1.3 1.9-.2"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EmptyIllustration() {
  const { colors, spacing, radius, iconSize, shadow } = useTheme();
  const box = spacing[96] + spacing[64];

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Aucun chat dans le CatDex"
      style={{ alignItems: 'center' }}
    >
      <View
        style={{
          width: box,
          height: box,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={[
            {
              width: spacing[96],
              height: spacing[96],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.low,
          ]}
        >
          <SleepingCatFace
            color={colors.brand}
            blush={colors.rose}
            size={spacing[56]}
          />
        </View>

        <View style={{ position: 'absolute', top: spacing[8], left: spacing[24], opacity: 0.7 }}>
          <Sparkle color={colors.brand} size={iconSize.sm} />
        </View>
        <View style={{ position: 'absolute', top: spacing[16], right: spacing[16], opacity: 0.55 }}>
          <Sparkle color={colors.rose} size={iconSize.sm} />
        </View>
        <View style={{ position: 'absolute', top: spacing[48], right: spacing[8], opacity: 0.45 }}>
          <Sparkle color={colors.brand} size={iconSize.sm} />
        </View>
        <View style={{ position: 'absolute', bottom: spacing[40], left: spacing[8], opacity: 0.5 }}>
          <Sparkle color={colors.rose} size={iconSize.sm} />
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: spacing[16],
            left: spacing[16],
            opacity: 0.45,
            transform: [{ rotate: '-16deg' }],
          }}
        >
          <PawPrint color={colors.brand} size={iconSize.sm} />
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: spacing[16],
            right: spacing[16],
            opacity: 0.45,
            transform: [{ rotate: '18deg' }],
          }}
        >
          <PawPrint color={colors.brand} size={iconSize.sm} />
        </View>
      </View>
      <View
        style={{
          width: spacing[80],
          height: spacing[8],
          marginTop: -spacing[16],
          borderRadius: radius.full,
          backgroundColor: colors.brandSoft,
        }}
      />
    </View>
  );
}

function Chevron({ color, size }: { color: string; size: number }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * CatDex collection empty — sleeping cat, hint card, map CTA.
 */
export function CatDexEmpty({ onExplore }: Props) {
  const { colors, spacing, radius, iconSize, motion } = useTheme();

  return (
    <View
      accessibilityRole="summary"
      style={{
        flexGrow: 1,
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        gap: spacing[32],
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[24],
        }}
      >
        <EmptyIllustration />

        <View style={{ gap: spacing[8], alignItems: 'center', maxWidth: 320 }}>
          <Text variant="title" color="text" align="center">
            Aucun chat trouvé
          </Text>
          <Text variant="body" color="textSecondary" align="center">
            Pars explorer ton quartier et capture ton premier chat !
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explore autour de toi"
          onPress={onExplore}
          style={({ pressed }) => ({
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[16],
            padding: spacing[16],
            borderRadius: radius.xl,
            backgroundColor: colors.brandSoft,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
          })}
        >
          <View
            style={{
              width: spacing[40],
              height: spacing[40],
              borderRadius: radius.full,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconPin color={colors.brand} size={iconSize.sm} />
          </View>
          <View style={{ flex: 1, gap: spacing[4] }}>
            <Text variant="bodySmall" weight="semibold" color="text">
              Explore autour de toi
            </Text>
            <Text variant="caption" color="textSecondary">
              De nouveaux chats t’attendent peut-être juste ici !
            </Text>
          </View>
          <Chevron color={colors.textMuted} size={iconSize.sm} />
        </Pressable>
      </View>

      <Button
        title="Découvrir la carte"
        onPress={onExplore}
        icon={<IconMap color={colors.onAccent} size={iconSize.sm} />}
      />
    </View>
  );
}
