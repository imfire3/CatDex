import { BlurView } from 'expo-blur';
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

type CardBaseProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

/** Surface card — depth, soft border, 24 radius */
export function Card({ children, onPress, style, padded = true }: CardBaseProps) {
  const { colors, spacing, radius, shadow, motion } = useTheme();

  const content = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? spacing[24] : 0,
          overflow: 'hidden',
        },
        shadow.low,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? motion.cardPressScale : 1 }] }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export function GlassCard({ children, onPress, style, padded = true }: CardBaseProps) {
  const { colors, spacing, radius, shadow, motion } = useTheme();

  const body = (
    <View
      style={[
        {
          borderRadius: radius.lg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow.low,
        style,
      ]}
    >
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={{ padding: padded ? spacing[16] : 0, backgroundColor: colors.glassFill }}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? motion.cardPressScale : 1 }] }]}
      >
        {body}
      </Pressable>
    );
  }

  return body;
}

export type ImageCardProps = {
  source: ImageSourcePropType | { uri: string };
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ImageCard({ source, title, subtitle, onPress, style }: ImageCardProps) {
  const { colors, fonts, spacing, radius, shadow, motion } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          aspectRatio: 3 / 4,
          borderRadius: radius.xl,
          overflow: 'hidden',
          backgroundColor: colors.surfaceSecondary,
          transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
        },
        shadow.medium,
        style,
      ]}
    >
      <Image source={source} style={StyleSheet.absoluteFill} />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: spacing[16],
          backgroundColor: colors.overlay,
        }}
      >
        <Text variant="body" color="onAccent" numberOfLines={1} style={{ fontFamily: fonts.bodySemi }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="onAccent" numberOfLines={1} style={{ opacity: 0.8 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
