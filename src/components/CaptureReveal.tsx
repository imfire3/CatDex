import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { enrichAnalysis } from '@/lib/catTraits';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

type Props = {
  name: string;
  number: number;
  photoUri: string;
  analysis: CatAnalysis;
  onAdd: () => void;
  onRetake: () => void;
};

/**
 * Post-capture reveal — white centered layout from CatDex mock.
 * "NOUVEAU CATDEX" · #NNN · photo · name · trait pills · description · sticky CTA
 */
export function CaptureReveal({
  name,
  number,
  photoUri,
  analysis: rawAnalysis,
  onAdd,
  onRetake,
}: Props) {
  const { colors, fonts, spacing, radius, scheme, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const analysis = enrichAnalysis(rawAnalysis, number);
  const theme = themeFromColorLabel(analysis.color, number);
  const soft = themeSoft(theme, scheme);
  const dexLabel = formatDexNumber(number);
  const footerPadBottom = Math.max(insets.bottom, spacing[16]);
  // Button 56 + retake row + gaps + footer padding
  const footerReserve =
    spacing[56] + spacing[16] + spacing[40] + spacing[16] + footerPadBottom;

  const pills = [
    analysis.tags?.[0],
    analysis.coat,
    analysis.breed !== 'Indéterminée' ? analysis.breed : analysis.color,
  ].filter((v): v is string => Boolean(v && String(v).trim()));

  const uniquePills = [...new Set(pills)].slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing[32],
          paddingHorizontal: spacing[24],
          paddingBottom: footerReserve + spacing[24],
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', gap: spacing[4], marginBottom: spacing[24] }}>
          <Text
            variant="label"
            color="textBrand"
            align="center"
            style={{ letterSpacing: 1.2 }}
          >
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

        <View
          style={[
            {
              width: '100%',
              aspectRatio: 1,
              borderRadius: radius[8],
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceElevated,
              overflow: 'hidden',
              marginBottom: spacing[24],
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: soft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={{ uri: photoUri }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              accessibilityLabel={`Photo de ${name}`}
            />
          </View>
        </View>

        <Text
          variant="h2"
          align="center"
          color="text"
          style={{ fontFamily: fonts.display, marginBottom: spacing[16] }}
        >
          {name}
        </Text>

        {uniquePills.length > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: spacing[8],
              marginBottom: spacing[16],
            }}
          >
            {uniquePills.map((label) => (
              <Badge
                key={label}
                label={label}
                color={theme.badge}
                backgroundColor={soft}
              />
            ))}
          </View>
        ) : null}

        <Text
          variant="body"
          color="textBody"
          align="center"
          style={{
            paddingHorizontal: spacing[8],
            fontFamily: fonts.body,
          }}
        >
          {analysis.description}
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing[24],
            paddingTop: spacing[16],
            paddingBottom: footerPadBottom,
            backgroundColor: colors.background,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            gap: spacing[8],
          },
          shadow.low,
        ]}
      >
        <Button title="Ajouter à ma collection" onPress={onAdd} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reprendre la photo"
          onPress={onRetake}
          style={({ pressed }) => ({
            alignItems: 'center',
            paddingVertical: spacing[8],
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="body"
            color="textBrand"
            style={{ fontFamily: fonts.bodySemi }}
          >
            Reprendre la photo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
