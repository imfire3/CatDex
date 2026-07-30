import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge } from '@/components/Badge';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type PhotoCardProps = {
  source: ImageSourcePropType | { uri: string };
  title: string;
  subtitle?: string;
  meta?: string;
  badges?: string[];
  tint?: string;
  badgeColor?: string;
  badgeBackground?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Pokédex-style collection card */
export function PhotoCard({
  source,
  title,
  subtitle,
  meta,
  badges,
  tint,
  badgeColor,
  badgeBackground,
  onPress,
  style,
  accessibilityLabel,
}: PhotoCardProps) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();
  const surface = tint ?? colors.surface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          borderRadius: radius.xl,
          overflow: 'hidden',
          backgroundColor: surface,
          borderWidth: 1,
          borderColor: colors.border,
          transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
        },
        shadow.medium,
        style,
      ]}
    >
      <View style={{ aspectRatio: 1, backgroundColor: colors.surfaceSecondary }}>
        <Image source={source} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['transparent', 'rgba(6,8,22,0.75)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ padding: spacing[16], gap: spacing[8] }}>
        <Text variant="h3" numberOfLines={1} style={{ fontFamily: fonts.bodySemi }}>
          {title}
        </Text>

        {badges && badges.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
            {badges.slice(0, 2).map((badge) => (
              <Badge
                key={badge}
                label={badge}
                color={badgeColor}
                backgroundColor={badgeBackground}
              />
            ))}
          </View>
        ) : null}

        {subtitle ? (
          <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
