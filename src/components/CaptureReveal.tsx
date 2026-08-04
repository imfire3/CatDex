import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatDexNumber } from '@/lib/constants';
import {
  catDexRarityLabel,
  resolveRevealRarity,
  rarityTokens,
  themeFromColorLabel,
  themeSoft,
} from '@/lib/catTheme';
import { enrichAnalysis, genderSymbol } from '@/lib/catTraits';
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
 * Post-capture reveal — same visual language as CatCardDetail,
 * with a flex sticky bottom CTA bar (always pinned above the home indicator).
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
  const rarityId = resolveRevealRarity(analysis, number);
  const rarity = rarityTokens[rarityId];
  const symbol = genderSymbol(analysis.gender);
  const footerPadBottom = Math.max(insets.bottom, spacing[16]);

  const pills = [
    analysis.tags?.[0],
    analysis.coat,
    analysis.breed !== 'Indéterminée' ? analysis.breed : analysis.color,
  ].filter((v): v is string => Boolean(v && String(v).trim()));

  const uniquePills = [...new Set(pills)].slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={{
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[8],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.background,
        }}
      >
        <AuthBackButton onPress={onRetake} />
        <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
          CatDex
        </Text>
        <View style={{ width: spacing[40], height: spacing[40] }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing[24],
          paddingTop: spacing[8],
          paddingBottom: spacing[24],
          gap: spacing[24],
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing[4] }}>
          <Text variant="label" color="textBrand" style={{ letterSpacing: 1.2 }}>
            Nouveau CatDex
          </Text>
          <Text
            variant="h1"
            color="text"
            style={{ fontFamily: fonts.display }}
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
              backgroundColor: soft,
              overflow: 'hidden',
            },
            shadow.low,
          ]}
        >
          <Image
            source={{ uri: photoUri }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            accessibilityLabel={`Photo de ${name}`}
          />
        </View>

        <View style={{ gap: spacing[8], width: '100%' }}>
          <Badge
            label={catDexRarityLabel(rarityId).toUpperCase()}
            color={rarity.foreground}
            backgroundColor={rarity.background}
          />

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: spacing[8],
            }}
          >
            <Text
              variant="h2"
              color="textBrand"
              style={{ fontFamily: fonts.display, textTransform: 'uppercase' }}
            >
              {name}
            </Text>
            {symbol ? (
              <Text variant="body" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                {symbol}
              </Text>
            ) : null}
          </View>

          {uniquePills.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing[8],
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
        </View>

        <View
          style={{
            width: '100%',
            gap: spacing[8],
            padding: spacing[16],
            borderRadius: radius[8],
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text variant="body" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
            Description
          </Text>
          <Text variant="body" color="textBody" style={{ fontFamily: fonts.body }}>
            {analysis.description}
          </Text>
        </View>

        <View style={{ gap: spacing[8], width: '100%' }}>
          <Text variant="h3" color="textBrand">
            Caractéristiques
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing[8] }}>
            <TraitStat label="Couleur" value={analysis.color || '—'} />
            <TraitStat label="Race" value={analysis.breed || '—'} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[8] }}>
            <TraitStat label="Pelage" value={analysis.coat || '—'} />
            <TraitStat label="Taille" value={analysis.size || '—'} />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: footerPadBottom,
          backgroundColor: colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          gap: spacing[8],
        }}
      >
        <Button title="Ajouter à ma collection" onPress={onAdd} />
        <Button title="Reprendre la photo" variant="secondary" onPress={onRetake} />
      </View>
    </View>
  );
}

function TraitStat({ label, value }: { label: string; value: string }) {
  const { colors, fonts, spacing, radius } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        gap: spacing[4],
        padding: spacing[16],
        borderRadius: radius[8],
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <Text variant="bodySmall" color="text" style={{ fontFamily: fonts.bodySemi }} numberOfLines={1}>
        {value}
      </Text>
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
});
