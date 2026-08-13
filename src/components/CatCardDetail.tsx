import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CatImage } from '@/components/CatImage';
import { CatSprite } from '@/components/CatSprite';
import { Text } from '@/components/Text';
import { formatDexNumber } from '@/lib/constants';
import { themeFromColorLabel, themeSoft } from '@/lib/catTheme';
import { enrichAnalysis, genderSymbol } from '@/lib/catTraits';
import { isCatPhotoRef } from '@/lib/photoStorage';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

export type CatCardDetailProps = {
  name: string;
  number: number;
  photoUri?: string | null;
  analysis: CatAnalysis;
  discoveredAt: string;
  views?: number;
  locationLabel?: string;
  onBack: () => void;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
};

function formatPlaceDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function starScore(views: number, number: number) {
  if (views >= 20) return 5;
  if (views >= 10) return 4;
  if (views >= 3) return 3;
  if (views >= 1) return 2;
  return Math.max(1, (number % 3) + 1);
}

function genderLabel(gender?: CatAnalysis['gender']) {
  if (gender === 'male') return 'Mâle';
  if (gender === 'female') return 'Femelle';
  return null;
}

function StarRow({ filled }: { filled: number }) {
  const { colors, spacing } = useTheme();
  const count = Math.max(0, Math.min(5, filled));

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${count} étoiles sur 5`}
      style={{ flexDirection: 'row', gap: spacing[8], alignItems: 'center' }}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < count;
        const tone = isFilled ? colors.brand : colors.brandSoft;
        return (
          <Svg key={index} width={18} height={18} viewBox="0 0 19 18" fill="none">
            <Path
              d="M8.61 1.41c.23-.52.35-.78.51-.86.14-.07.3-.07.44 0 .16.08.28.34.51.86l1.84 4.14c.07.15.1.23.16.29.05.05.1.09.17.12.07.03.15.04.32.06l4.5.47c.57.06.85.09.98.22.11.11.16.27.14.42-.03.18-.24.37-.66.75l-3.36 3.03c-.13.11-.19.17-.23.24-.03.06-.06.13-.06.2-.01.08.01.16.04.32l.94 4.43c.12.56.18.84.09 1-.07.14-.2.23-.36.26-.18.03-.42-.11-.92-.4L9.74 14.7c-.15-.08-.22-.13-.3-.14a.7.7 0 0 0-.2 0c-.08.01-.15.06-.3.14l-3.92 2.26c-.49.29-.74.43-.92.4-.15-.03-.28-.12-.36-.26-.08-.16-.02-.44.1-1l.94-4.43c.03-.16.05-.24.04-.32 0-.07-.02-.14-.06-.2-.04-.07-.1-.13-.23-.24L1.17 7.88c-.42-.38-.63-.57-.66-.75a.55.55 0 0 1 .14-.42c.13-.13.41-.16.98-.22l4.5-.47c.17-.02.25-.03.32-.06.07-.03.12-.07.17-.12.06-.06.09-.14.16-.29L8.61 1.41Z"
              fill={tone}
              stroke={tone}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      })}
    </View>
  );
}

function InfoSection({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  const { spacing } = useTheme();
  return (
    <View style={{ width: '100%', gap: spacing[4] }}>
      <Text variant="body" weight="semibold" color="textBrand">
        {title}
      </Text>
      {body ? (
        <Text variant="bodySmall" color="textSecondary">
          {body}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function TraitStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: 'eye' | 'paint' | 'paw' | 'size';
}) {
  const { colors, spacing, radius, iconStroke } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
      style={{
        flex: 1,
        minWidth: '40%',
        padding: spacing[16],
        borderRadius: radius[8],
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[8] }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}>
        {icon === 'eye' ? (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
              stroke={colors.brand}
              strokeWidth={iconStroke.regular}
            />
            <Path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke={colors.brand}
              strokeWidth={iconStroke.regular}
            />
          </Svg>
        ) : null}
        {icon === 'paint' ? (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3c4.5 0 8 3 8 7.2 0 2.8-1.6 4.3-3.4 4.3-1.2 0-1.9-.8-2.7-.8-.9 0-1.5.9-2.7.9C8.4 14.6 7 13 7 10.4 7 6.4 9.6 3 12 3Z"
              stroke={colors.brand}
              strokeWidth={iconStroke.regular}
            />
          </Svg>
        ) : null}
        {icon === 'paw' ? (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 17.5c-2.2 0-4-1.2-4-2.4 0-.7.8-1 1.5-.7.5.2 1.2.3 2.5.3s2-.1 2.5-.3c.7-.3 1.5.1 1.5.7 0 1.2-1.8 2.4-4 2.4Z"
              fill={colors.brand}
            />
            <Path d="M7.5 11.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Zm9 0a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM9.5 8a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 9.5 8Zm5 0a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 14.5 8Z" fill={colors.brand} />
          </Svg>
        ) : null}
        {icon === 'size' ? (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 17V7m0 10h10M7 7h10"
              stroke={colors.brand}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
            />
          </Svg>
        ) : null}
        <Text variant="caption" weight="semibold" color="textBody">
          {label}
        </Text>
      </View>
      <Text variant="body" weight="semibold" color="textBrand" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function PillRow({
  items,
  tone = 'brand',
}: {
  items: string[];
  tone?: 'brand' | 'soft' | 'mixed';
}) {
  const { colors, spacing } = useTheme();
  if (items.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
      {items.map((label, index) => {
        let backgroundColor = colors.brand;
        let color = colors.onBrand;
        if (tone === 'soft') {
          backgroundColor = colors.brandSoft;
          color = colors.brand;
        } else if (tone === 'mixed') {
          backgroundColor = index === 0 ? colors.brand : colors.brandSoft;
          color = index === 0 ? colors.onBrand : colors.brand;
        }
        return (
          <Badge
            key={`${label}-${index}`}
            label={label}
            color={color}
            backgroundColor={backgroundColor}
          />
        );
      })}
    </View>
  );
}

/**
 * Cat fiche — full-screen app canvas (same background as the rest of CatDex).
 */
export function CatCardDetail({
  name,
  number,
  photoUri,
  analysis: rawAnalysis,
  discoveredAt,
  views = 0,
  locationLabel = 'Rue de Belleville, Paris 20e',
  onBack,
  onPrimaryAction,
  primaryLabel,
  secondaryLabel,
  onSecondaryAction,
}: CatCardDetailProps) {
  const { colors, spacing, radius, iconStroke, scheme, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const [photoFailed, setPhotoFailed] = useState(false);
  const analysis = enrichAnalysis(rawAnalysis, number);
  const theme = themeFromColorLabel(analysis.color, number);
  const soft = themeSoft(theme, scheme);
  const symbol = genderSymbol(analysis.gender);
  const gender = genderLabel(analysis.gender);
  const stars = starScore(views, number);
  const likesPct = 50 + ((number * 13) % 41);

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUri]);

  const showPhoto =
    Boolean(photoUri) &&
    !photoFailed &&
    !photoUri!.startsWith('demo') &&
    !photoUri!.startsWith('blob:') &&
    (isCatPhotoRef(photoUri) ||
      photoUri!.startsWith('data:') ||
      photoUri!.startsWith('http') ||
      photoUri!.startsWith('file:'));
  const traitTags =
    analysis.tags && analysis.tags.length > 0
      ? analysis.tags
      : ['Affectueux', 'Curieux', 'Gourmand'];
  const hasFooterActions = Boolean(primaryLabel && onPrimaryAction);

  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[8],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.background }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={onBack}
          style={({ pressed }) => ({
            width: spacing[40],
            height: spacing[40],
            borderRadius: radius[8],
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? motion.pressScale : 1 }],
          })}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18 9 12l6-6"
              stroke={colors.brand}
              strokeWidth={iconStroke.regular}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>

        <Text variant="bodySmall" weight="semibold" color="textBrand">
          CatDex
        </Text>

        <View style={{ width: spacing[40], height: spacing[40] }} />
      </View>

      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: colors.background }}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          paddingHorizontal: spacing[24],
          paddingTop: spacing[8],
          paddingBottom:
            insets.bottom + spacing[32] + (hasFooterActions ? spacing[96] : spacing[16]),
          gap: spacing[24] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing[8] }}>
          <Text variant="label" color="textMuted">
            {formatDexNumber(number)}
          </Text>
          <StarRow filled={stars} />
        </View>

        <View
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: radius[8],
            backgroundColor: soft,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border }}
        >
          {showPhoto ? (
            <CatImage
              uri={photoUri}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              accessibilityLabel={`Photo de ${name}`}
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <CatSprite colorLabel={analysis.color} seed={number} size={200} />
          )}
        </View>

        <View style={{ gap: spacing[8], width: '100%' }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: spacing[8] }}
          >
            <Text
              variant="title"
              color="textBrand"
            >
              {name}
            </Text>
            {symbol ? (
              <Text variant="body" weight="semibold" color="textBrand">
                {symbol}
              </Text>
            ) : null}
          </View>

          <Text variant="bodySmall" weight="semibold" color="textBrand">
            {traitTags[0] ? `${traitTags[0]} · ` : ''}
            Découvert {formatPlaceDate(discoveredAt)}
            {locationLabel ? ` · ${locationLabel.split(',')[0]}` : ''}
          </Text>

          <PillRow
            items={[analysis.color, analysis.breed, gender].filter(Boolean) as string[]}
            tone="mixed"
          />
        </View>

        <View style={{ gap: spacing[16], width: '100%' }}>
          <InfoSection title="Description" body={analysis.description} />
        </View>

        <View style={{ gap: spacing[16], width: '100%' }}>
          <Text variant="title" color="textBrand">
            Caractéristiques
          </Text>
          <View style={{ gap: spacing[8] }}>
            <View style={{ flexDirection: 'row', gap: spacing[8] }}>
              <TraitStat label="Couleur" value={analysis.color} icon="paint" />
              <TraitStat label="Yeux" value={analysis.eyes ?? '—'} icon="eye" />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[8] }}>
              <TraitStat label="Pelage" value={analysis.coat} icon="paw" />
              <TraitStat label="Taille" value={analysis.size ?? '—'} icon="size" />
            </View>
          </View>
        </View>

        <View style={{ gap: spacing[16], width: '100%' }}>
          <Text variant="title" color="textBrand">
            Personnalité
          </Text>
          <PillRow items={traitTags.slice(0, 3)} tone="soft" />
        </View>

        <View style={{ gap: spacing[16], width: '100%', paddingBottom: spacing[8] }}>
          <Text variant="title" color="textBrand">
            Stats
          </Text>
          <View style={{ gap: spacing[8] }}>
            <Text variant="bodySmall" color="textBody">
              Aimé par {likesPct} % · Observé {views === 1 ? 'une fois' : `${views} fois`} · Découvert
            </Text>
            <Text variant="caption" color="textMuted">
              Première apparition · {formatPlaceDate(discoveredAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {hasFooterActions ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            paddingHorizontal: spacing[24],
            paddingTop: spacing[16],
            paddingBottom: Math.max(insets.bottom, spacing[16]),
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: spacing[8] }}
        >
          <Button title={primaryLabel!} onPress={onPrimaryAction!} />
          {secondaryLabel && onSecondaryAction ? (
            <Button title={secondaryLabel} variant="secondary" onPress={onSecondaryAction} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
