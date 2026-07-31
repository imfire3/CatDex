import { BlurView } from 'expo-blur';
import { Platform, Image, StyleSheet, View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { ViewStyle } from 'react-native';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatCatDefaultName, formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

type Props = {
  photoUri: string;
  analysis: CatAnalysis;
  nextNumber: number;
  insets: EdgeInsets;
  revealCardStyle: AnimatedStyle<ViewStyle>;
  blurOverlayStyle: AnimatedStyle<ViewStyle>;
  onAdd: () => void;
  onRetake: () => void;
};

export function ScannerReveal({
  photoUri,
  analysis,
  nextNumber,
  insets,
  revealCardStyle,
  blurOverlayStyle,
  onAdd,
  onRetake,
}: Props) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const theme = themeFromColorLabel(analysis.color, nextNumber);
  const dexLabel = formatDexNumber(nextNumber);
  const displayName =
    analysis.suggestedName?.trim() || formatCatDefaultName(nextNumber);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing[24],
          paddingHorizontal: spacing[24],
        },
      ]}
    >
      <View style={{ alignItems: 'center', gap: spacing[4], marginBottom: spacing[16] }}>
        <Text variant="label" color="accent" align="center">
          Nouveau CatDex
        </Text>
        <Text
          variant="display"
          align="center"
          style={{ fontFamily: fonts.display, color: colors.text }}
        >
          {dexLabel}
        </Text>
      </View>

      <Animated.View style={[revealCardStyle, { alignItems: 'center', width: '100%' }]}>
        <View
          style={[
            {
              padding: spacing[8],
              borderRadius: radius['2xl'],
              backgroundColor: themeSoft(theme),
              overflow: 'hidden',
            },
            shadow.medium,
          ]}
        >
          <View>
            <Image
              source={{ uri: photoUri }}
              style={{
                width: spacing[96] * 2,
                height: spacing[96] * 2,
                borderRadius: radius.xl,
              }}
            />
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, blurOverlayStyle, { borderRadius: radius.xl }]}
            >
              {Platform.OS === 'web' ? (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: colors.overlay, borderRadius: radius.xl },
                  ]}
                />
              ) : (
                <BlurView
                  intensity={48}
                  tint="dark"
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
                />
              )}
            </Animated.View>
          </View>
        </View>

        <Text
          variant="h2"
          align="center"
          style={{ marginTop: spacing[24], fontFamily: fonts.display }}
        >
          {displayName}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: spacing[8],
            marginTop: spacing[16],
          }}
        >
          <Badge label={analysis.breed} color={theme.badge} backgroundColor={`${theme.hex}33`} />
          <Badge label={analysis.color} color={theme.badge} backgroundColor={`${theme.hex}33`} />
          <Badge label={analysis.coat} color={theme.badge} backgroundColor={`${theme.hex}33`} />
        </View>

        <Text
          variant="body"
          color="textBody"
          align="center"
          style={{
            marginTop: spacing[16],
            paddingHorizontal: spacing[8],
            fontFamily: fonts.body,
          }}
        >
          {analysis.description}
        </Text>
      </Animated.View>

      <View
        style={{
          marginTop: 'auto',
          paddingBottom: Math.max(insets.bottom, spacing[16]),
          gap: spacing[8],
        }}
      >
        <Button title="Ajouter au CatDex" onPress={onAdd} />
        <Button title="Reprendre la photo" variant="ghost" onPress={onRetake} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
