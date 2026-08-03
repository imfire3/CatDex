import type { ReactNode } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatCatDefaultName } from '@/lib/constants';
import {
  analysisAgeLabel,
  analysisWeightLabel,
  captureDistanceLabel,
  revealRarityLabel,
  resolveRevealRarity,
  rarityTokens,
  themeFromColorLabel,
} from '@/lib/catTheme';
import { genderSymbol } from '@/lib/catTraits';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

type Props = {
  photoUri: string;
  analysis: CatAnalysis;
  dexNumber: number;
  onAdd: () => void;
  onBack: () => void;
};

function OverlayIconButton({
  accessibilityLabel,
  onPress,
  children,
}: {
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
}) {
  const { colors, spacing, radius } = useTheme();

  const content = (
    <View
      style={{
        width: spacing[40],
        height: spacing[40],
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      {Platform.OS === 'web' ? (
        <View
          style={{
            width: spacing[40],
            height: spacing[40],
            borderRadius: radius.full,
            backgroundColor: colors.overlay,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
      ) : (
        <BlurView intensity={48} tint="dark" style={{ borderRadius: radius.full, overflow: 'hidden' }}>
          {content}
        </BlurView>
      )}
    </Pressable>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const { fonts, spacing } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing[4] }}>
      {icon}
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <Text variant="bodySmall" color="text" style={{ fontFamily: fonts.bodySemi }}>
        {value}
      </Text>
    </View>
  );
}

function TraitTag({
  label,
  dotColor,
}: {
  label: string;
  dotColor?: string;
}) {
  const { colors, spacing, radius, fonts } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        height: spacing[24],
        paddingHorizontal: spacing[8],
        borderRadius: radius.full,
        backgroundColor: colors.surfaceSecondary,
      }}
    >
      {dotColor ? (
        <View
          style={{
            width: spacing[8],
            height: spacing[8],
            borderRadius: radius.full,
            backgroundColor: dotColor,
          }}
        />
      ) : null}
      <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.bodySemi }}>
        {label}
      </Text>
    </View>
  );
}

/** Post-analysis reveal — full-bleed photo + bottom profile sheet. */
export function CatRevealView({ photoUri, analysis, dexNumber, onAdd, onBack }: Props) {
  const { colors, fonts, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const theme = themeFromColorLabel(analysis.color, dexNumber);
  const displayName = analysis.suggestedName?.trim() || formatCatDefaultName(dexNumber);
  const gender = genderSymbol(analysis.gender);
  const rarityId = resolveRevealRarity(analysis, dexNumber);
  const rarity = rarityTokens[rarityId];

  const coatTag = (() => {
    const coat = analysis.coat ?? '';
    const color = analysis.color ?? '';
    if (/tigré|tabby/i.test(`${color} ${coat}`)) return 'Tigré';
    return coat || 'Pelage';
  })();

  const mutedIcon = colors.textMuted;

  return (
    <View style={[styles.root, { backgroundColor: colors.text }]}>
      <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(249,249,251,0.08)', 'rgba(249,249,251,0.35)', colors.surfaceElevated]}
        locations={[0.35, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + spacing[8],
          left: spacing[16],
          right: spacing[16],
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <AuthBackButton onPress={onBack} />
        <View style={{ flexDirection: 'row', gap: spacing[8] }}>
          <OverlayIconButton accessibilityLabel="Favori" onPress={() => undefined}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 20.5 4.5 12.8a5.5 5.5 0 0 1 7.8-7.8L12 4.5l-.3-.3a5.5 5.5 0 1 1 7.8 7.8L12 20.5Z"
                stroke={colors.onAccent}
                strokeWidth={iconStroke.regular}
                strokeLinejoin="round"
              />
            </Svg>
          </OverlayIconButton>
          <OverlayIconButton accessibilityLabel="Partager" onPress={() => undefined}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
                stroke={colors.onAccent}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </OverlayIconButton>
        </View>
      </View>

      <View
        style={[
          styles.sheet,
          {
            paddingHorizontal: spacing[24],
            paddingTop: spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[16]),
            borderTopLeftRadius: spacing[24],
            borderTopRightRadius: spacing[24],
            backgroundColor: colors.surfaceElevated,
          },
          shadow.floating,
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[8],
            marginBottom: spacing[16],
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[4], flexWrap: 'wrap' }}>
            <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
              {displayName}
            </Text>
            {gender ? (
              <Text variant="h3" style={{ fontFamily: fonts.bodySemi, color: colors.mapPlayer }}>
                {gender}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              paddingHorizontal: spacing[8],
              height: spacing[24],
              borderRadius: radius.full,
              backgroundColor: rarity.background,
              borderWidth: 1,
              borderColor: rarity.border,
              justifyContent: 'center',
            }}
          >
            <Text variant="caption" style={{ fontFamily: fonts.bodySemi, color: rarity.foreground }}>
              {revealRarityLabel(rarityId)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8], marginBottom: spacing[24] }}>
          <TraitTag label={analysis.color} dotColor={theme.hex} />
          <TraitTag label={analysis.breed} />
          <TraitTag label={coatTag} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginBottom: spacing[24],
            paddingVertical: spacing[8],
          }}
        >
          <StatItem
            label="Poids"
            value={analysisWeightLabel(dexNumber)}
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 3a5 5 0 0 0-5 5v2H5v12h14V10h-2V8a5 5 0 0 0-5-5Z"
                  stroke={mutedIcon}
                  strokeWidth={iconStroke.regular}
                  strokeLinejoin="round"
                />
              </Svg>
            }
          />
          <StatItem
            label="Âge"
            value={analysisAgeLabel(dexNumber)}
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="13" r="8" stroke={mutedIcon} strokeWidth={iconStroke.regular} />
                <Path d="M12 9v4l2.5 1.5" stroke={mutedIcon} strokeWidth={iconStroke.regular} strokeLinecap="round" />
                <Path d="M9 3h6" stroke={mutedIcon} strokeWidth={iconStroke.regular} strokeLinecap="round" />
              </Svg>
            }
          />
          <StatItem
            label="Distance"
            value={captureDistanceLabel(dexNumber)}
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                  stroke={mutedIcon}
                  strokeWidth={iconStroke.regular}
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="10" r="2.5" fill={mutedIcon} />
              </Svg>
            }
          />
        </View>

        <Button title="Ajouter au CatDex" onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
