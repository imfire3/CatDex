import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type GalleryCardProps = {
  source: ImageSourcePropType | { uri: string };
  title?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: 64 | 80 | 96;
};

/** Compact square thumbnail for nearby strips / galleries. */
export function GalleryCard({ source, title, onPress, style, size = 80 }: GalleryCardProps) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          opacity: pressed ? 0.9 : 1,
          gap: spacing[8],
          alignItems: 'center',
        },
        style,
      ]}
    >
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius.lg,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceSecondary,
          },
          shadow.small,
        ]}
      >
        <Image source={source} style={StyleSheet.absoluteFill} />
      </View>
      {title ? (
        <Text variant="caption" style={{ fontFamily: fonts.bodySemi }} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
    </Pressable>
  );
}
