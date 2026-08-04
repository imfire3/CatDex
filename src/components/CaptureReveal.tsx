import { Image, Pressable, ScrollView, View } from 'react-native';
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
 * "NOUVEAU CATDEX" · #NNN · photo · name · trait pills · description · CTAs
 */
export function CaptureReveal({
  name,
  number,
  photoUri,
  analysis: rawAnalysis,
  onAdd,
  onRetake,
}: Props) {
  const { colors, fonts, spacing, radius, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const analysis = enrichAnalysis(rawAnalysis, number);
  const theme = themeFromColorLabel(analysis.color, number);
  const soft = themeSoft(theme, scheme);
  const dexLabel = formatDexNumber(number);

  const pills = [
    analysis.tags?.[0],
    analysis.coat,
    analysis.breed !== 'Indéterminée' ? analysis.breed : analysis.color,
  ].filter((v): v is string => Boolean(v && String(v).trim()));

  const uniquePills = [...new Set(pills)].slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing[32],
          paddingHorizontal: spacing[24],
          paddingBottom: insets.bottom + spacing[24],
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
            marginBottom: spacing[32],
            fontFamily: fonts.body,
          }}
        >
          {analysis.description}
        </Text>

        <View style={{ width: '100%', marginTop: 'auto', gap: spacing[16] }}>
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
      </ScrollView>
    </View>
  );
}
