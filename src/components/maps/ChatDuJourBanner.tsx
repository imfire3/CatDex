import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  name: string;
  meta: string;
  extraCount?: number;
  onPress: () => void;
  onSeeAll?: () => void;
};

/**
 * Replaces the dense map legend — one reason to walk: today's cat.
 */
export function ChatDuJourBanner({
  name,
  meta,
  extraCount = 0,
  onPress,
  onSeeAll,
}: Props) {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          top: insets.top + spacing[8] + spacing[48] + spacing[8],
          left: spacing[16],
          right: spacing[16],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Chat du jour, ${name}, ${meta}`}
        onPress={onPress}
        style={({ pressed }) => [
          {
            flex: 1,
            minWidth: 0,
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing[16],
            paddingVertical: spacing[8],
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? motion.pressScale : 1 }],
          },
          shadow.low,
        ]}
      >
        <Text variant="caption" weight="semibold" color="textBrand">
          Chat du jour
        </Text>
        <Text variant="bodySmall" weight="semibold" color="text" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {meta}
        </Text>
      </Pressable>
      {extraCount > 0 && onSeeAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Voir ${extraCount} autres chats à découvrir`}
          onPress={onSeeAll}
          style={({ pressed }) => [
            {
              justifyContent: 'center',
              paddingHorizontal: spacing[16],
              borderRadius: radius.lg,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.92 : 1,
            },
            shadow.low,
          ]}
        >
          <Text variant="caption" weight="semibold" color="textBrand">
            +{extraCount}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 22,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
});
