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
  location?: string;
  dexLabel?: string;
  badges?: string[];
  rarityLabel?: string;
  rarityColor?: string;
  rarityBackground?: string;
  tint?: string;
  accentColor?: string;
  badgeColor?: string;
  badgeBackground?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Pokédex-style collection card — photo ~60%, secondary meta below */
export function PhotoCard({
  source,
  title,
  subtitle,
  meta,
  location,
  dexLabel,
  badges,
  rarityLabel,
  rarityColor,
  rarityBackground,
  tint,
  accentColor,
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
          borderRadius: radius.card,
          overflow: 'hidden',
          backgroundColor: surface,
          borderWidth: 1,
          borderColor: accentColor ?? colors.border,
          transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
        },
        shadow.low,
        style,
      ]}
    >
      {/* Photo dominates (~60% visual weight via tall aspect) */}
      <View style={{ aspectRatio: 0.85, backgroundColor: colors.surfaceSecondary }}>
        <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', colors.overlay]}
          style={StyleSheet.absoluteFill}
        />
        {dexLabel ? (
          <View
            style={{
              position: 'absolute',
              top: spacing[8],
              left: spacing[8],
              paddingHorizontal: spacing[8],
              paddingVertical: spacing[4],
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text variant="tiny" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
              {dexLabel}
            </Text>
          </View>
        ) : null}
        {rarityLabel ? (
          <View style={{ position: 'absolute', top: spacing[8], right: spacing[8] }}>
            <Badge
              label={rarityLabel}
              color={rarityColor}
              backgroundColor={rarityBackground}
            />
          </View>
        ) : null}
      </View>

      <View style={{ padding: spacing[16], gap: spacing[8] }}>
        <Text
          variant="title"
          color="textBrand"
          numberOfLines={1}
          style={{ fontFamily: fonts.bodySemi }}
        >
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
        {location ? (
          <Text variant="tiny" color="textMuted" numberOfLines={1}>
            {location}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="tiny" color="textMuted" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
