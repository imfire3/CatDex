import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { ProfileBadge } from '@/lib/progression';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  badges: ProfileBadge[];
  onSeeAll?: () => void;
};

export function ProfileBadgeRow({ badges, onSeeAll }: Props) {
  const { colors, spacing, radius, shadow, iconSize } = useTheme();

  return (
    <View style={{ gap: spacing[16] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="title" color="textBrand">
          Badges
        </Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} accessibilityRole="button">
            <Text variant="bodySmall" color="textBrand">
              Voir tous →
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing[16], paddingRight: spacing[8] }}
      >
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={[
              {
                width: 120,
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[16],
                gap: spacing[8],
                opacity: badge.unlocked ? 1 : 0.55,
                alignItems: 'center',
              },
              shadow.low,
            ]}
          >
            <View
              style={{
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.full,
                backgroundColor: badge.unlocked ? colors.accentSoft : colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center' }}
            >
              {badge.unlocked ? (
                <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
                    fill={colors.accent}
                  />
                </Svg>
              ) : (
                <View
                  style={{
                    width: spacing[16],
                    height: spacing[16],
                    borderRadius: radius.full,
                    borderWidth: 2,
                    borderColor: colors.textMuted }}
                />
              )}
            </View>
            <Text
              variant="bodySmall" weight="semibold"
              color="text"
              style={{ textAlign: 'center' }}
              numberOfLines={2}
            >
              {badge.title}
            </Text>
            <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }} numberOfLines={1}>
              {badge.unlocked ? badge.subtitle : 'À découvrir'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
