import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatCatDefaultName } from '@/lib/constants';
import {
  analysisAgeLabel,
  dexNumberLabel,
  resolveRevealRarity,
} from '@/lib/catTheme';
import { useTheme } from '@/theme/ThemeProvider';
import { gradients } from '@/theme/gradients';
import type { CatAnalysis, CatGender } from '@/types/cat';

type Props = {
  photoUri: string;
  analysis: CatAnalysis;
  dexNumber: number;
  locationLabel?: string;
  onAdd: () => void;
  onBack: () => void;
};

const STAR_PATH =
  'M8.61188 1.41115C8.84338 0.89177 8.95918 0.63208 9.12038 0.55211C9.26038 0.48263 9.42478 0.48263 9.56478 0.55211C9.72598 0.63208 9.84178 0.89177 10.0733 1.41115L11.9173 5.54808C11.9858 5.70162 12.02 5.77839 12.073 5.83718C12.1198 5.8892 12.1771 5.93081 12.241 5.95929C12.3133 5.99149 12.3969 6.00031 12.5641 6.01795L17.0684 6.49336C17.6339 6.55304 17.9166 6.58288 18.0425 6.71147C18.1518 6.82316 18.2026 6.97956 18.1798 7.1342C18.1536 7.3122 17.9424 7.5025 17.52 7.8832L14.1553 10.9154C14.0305 11.0279 13.968 11.0842 13.9285 11.1527C13.8935 11.2134 13.8716 11.2807 13.8643 11.3503C13.856 11.429 13.8734 11.5112 13.9083 11.6757L14.8481 16.1064C14.9661 16.6627 15.0251 16.9408 14.9417 17.1002C14.8692 17.2388 14.7362 17.3354 14.5821 17.3615C14.4047 17.3915 14.1584 17.2495 13.6658 16.9654L9.74228 14.7024C9.59668 14.6184 9.52388 14.5765 9.44648 14.56C9.37798 14.5455 9.30718 14.5455 9.23868 14.56C9.16128 14.5765 9.08848 14.6184 8.94288 14.7024L5.0194 16.9654C4.52682 17.2495 4.28053 17.3915 4.10312 17.3615C3.94901 17.3354 3.81597 17.2388 3.74353 17.1002C3.66014 16.9408 3.71913 16.6627 3.83712 16.1064L4.77688 11.6757C4.81176 11.5112 4.8292 11.429 4.82092 11.3503C4.81359 11.2807 4.79172 11.2134 4.75672 11.1527C4.71717 11.0842 4.65473 11.0279 4.52986 10.9154L1.16524 7.8832C0.742829 7.5025 0.531619 7.3122 0.505359 7.1342C0.482559 6.97956 0.533369 6.82316 0.642709 6.71147C0.768589 6.58288 1.05134 6.55304 1.61684 6.49336L6.12113 6.01795C6.28831 6.00031 6.37189 5.99149 6.44417 5.95929C6.50812 5.93081 6.56538 5.8892 6.61224 5.83718C6.66519 5.77839 6.69941 5.70162 6.76786 5.54808L8.61188 1.41115Z';

function StarRow({ filled }: { filled: number }) {
  const { colors, spacing } = useTheme();
  const count = Math.min(5, Math.max(0, filled));

  return (
    <View style={{ flexDirection: 'row', gap: spacing[8], alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < count;
        const fill = isFilled ? colors.text : colors.captureFabHalo;
        return (
          <Svg key={index} width={18} height={18} viewBox="0 0 18.6851 17.8654" fill="none">
            <Path
              d={STAR_PATH}
              fill={fill}
              stroke={fill}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      })}
    </View>
  );
}

function Pill({
  label,
  tone,
}: {
  label: string;
  tone: 'brand' | 'ink';
}) {
  const { colors, spacing, radius } = useTheme();
  const backgroundColor = tone === 'brand' ? colors.brand : colors.text;

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: radius.cta,
        paddingHorizontal: spacing[8],
        paddingVertical: spacing[4],
        alignItems: 'center',
        justifyContent: 'center' }}
    >
      <Text variant="bodySmall" color="onAccent">
        {label}
      </Text>
    </View>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.borderDefault,
        borderRadius: radius.cta,
        padding: spacing[16] }}
    >
      <Text variant="body" color="text">
        {title}
      </Text>
      <Text variant="bodySmall" color="textSecondary">
        {body}
      </Text>
    </View>
  );
}

function TraitCard({ label, value }: { label: string; value: string }) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.borderDefault,
        borderRadius: radius.cta,
        padding: spacing[16],
        minWidth: 0 }}
    >
      <Text variant="bodySmall" color="text">
        {label}
      </Text>
      <Text variant="body" weight="medium" color="textSecondary">
        {value}
      </Text>
    </View>
  );
}

function GenderMark({ gender }: { gender?: CatGender }) {
  const { colors } = useTheme();
  if (gender !== 'male' && gender !== 'female') return null;

  if (gender === 'female') {
    return (
      <Text variant="body" weight="semibold" color="brand">
        ♀
      </Text>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 2.5h5v5M17.5 2.5 11.2 8.8M8.5 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
        stroke={colors.brand}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function starCountForDex(analysis: CatAnalysis, dexNumber: number): number {
  const rarity = resolveRevealRarity(analysis, dexNumber);
  if (rarity === 'exceptional') return 5;
  if (rarity === 'rare') return 4;
  if (rarity === 'uncommon') return 3;
  return 2 + (Math.abs(dexNumber) % 2);
}

function formatCapturePlace(): string {
  const now = new Date();
  const date = now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `À proximité · ${date}`;
}

/** Post-analysis cat fiche — Figma node 141:48, before CatDex add. */
export function CatRevealView({
  photoUri,
  analysis,
  dexNumber,
  locationLabel,
  onAdd,
  onBack,
}: Props) {
  const { colors, spacing, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  const displayName = analysis.suggestedName?.trim() || formatCatDefaultName(dexNumber);
  const ageLabel = analysisAgeLabel(dexNumber).replace(/^~\s*/, '');
  const stars = starCountForDex(analysis, dexNumber);
  const traits = [
    ...(analysis.tags ?? []),
    'Affectueux',
    'Curieux',
    'Gourmand',
  ]
    .filter((tag, index, list) => list.indexOf(tag) === index)
    .slice(0, 3);

  const likes = 86 + (Math.abs(dexNumber * 7) % 13);
  const place = locationLabel?.trim() || formatCapturePlace();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...gradients.primarySoft, colors.surface]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[24] + spacing[56] + Math.max(insets.bottom, spacing[16]),
          gap: spacing[24] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing[24] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AuthBackButton onPress={onBack} />
            <StarRow filled={stars} />
            <View style={{ width: spacing[40] }} />
          </View>

          <View style={styles.hero}>
            <Image
              source={{ uri: photoUri }}
              style={styles.heroImage}
              resizeMode="contain"
              accessibilityLabel="Photo capturée du chat"
            />
          </View>

          <View style={{ gap: spacing[8] }}>
            <View style={{ alignSelf: 'flex-start' }}>
              <Pill label={dexNumberLabel(dexNumber)} tone="brand" />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8], flexWrap: 'wrap' }}>
              <Text
                variant="title" weight="bold"
                color="text"
                style={{
                  textTransform: 'uppercase',
                  flexShrink: 1 }}
              >
                {displayName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
                <GenderMark gender={analysis.gender} />
                <Text variant="bodySmall" weight="semibold" color="brand">
                  {ageLabel}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              <Pill label={analysis.color || '—'} tone="ink" />
              <Pill label={analysis.breed || '—'} tone="brand" />
            </View>
          </View>
        </View>

        <View style={{ gap: spacing[24] }}>
          <View style={{ gap: spacing[8] }}>
            <InfoCard
              title="Description"
              body={analysis.description?.trim() || 'Description du chat'}
            />
            <InfoCard title="Emplacement" body={place} />
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="body" weight="bold" color="textSecondary">
              Caractéristiques
            </Text>
            <View style={{ gap: spacing[8] }}>
              <View style={{ flexDirection: 'row', gap: spacing[8] }}>
                <TraitCard label="Couleur" value={analysis.color || '—'} />
                <TraitCard label="Yeux" value={analysis.eyes || '—'} />
              </View>
              <View style={{ flexDirection: 'row', gap: spacing[8] }}>
                <TraitCard label="Pelage" value={analysis.coat || '—'} />
                <TraitCard label="Taille" value={analysis.size || '—'} />
              </View>
            </View>
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="body" weight="semibold" color="textSecondary">
              Traits
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              {traits.map((tag) => (
                <Pill key={tag} label={tag} tone="ink" />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="body" weight="semibold" color="textSecondary">
              Stats
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
              <Pill label={`${likes}% de j’aime`} tone="ink" />
              <Pill label="Vu 1 fois" tone="ink" />
              <Pill label="Nouveau" tone="ink" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing[24],
            paddingTop: spacing[16],
            paddingBottom: Math.max(insets.bottom, spacing[16]),
            backgroundColor: colors.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
          },
          shadow.low,
        ]}
      >
        <Button title="Ajouter au CatDex" onPress={onAdd} />
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
  hero: {
    width: '100%',
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
