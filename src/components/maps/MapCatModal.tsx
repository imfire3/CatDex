import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { CatImage } from '@/components/CatImage';
import { Text } from '@/components/Text';
import {
  getMapActionClusterBottom,
  MAP_CAPTURE_FAB_SIZE,
} from '@/layout/tabBarMetrics';
import { formatDistanceMeters } from '@/lib/constants';
import type { CatDiscoveryState } from '@/lib/catDiscovery';
import {
  catDexRarityLabel,
  rarityTokens,
  resolveRevealRarity,
} from '@/lib/catTheme';
import { isCatPhotoRef } from '@/lib/photoStorage';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  visible: boolean;
  cat: Cat | null;
  /** @deprecated Prefer discoveryState. */
  captured?: boolean;
  discoveryState?: CatDiscoveryState;
  distanceM?: number | null;
  onClose: () => void;
  onViewCard: () => void;
  /** Primary action for discoverable cats — open the scanner. */
  onCapture: () => void;
};

/**
 * Explorer pin popup — owned → Voir la fiche ; discoverable → Photographier.
 */
export function MapCatModal({
  visible,
  cat,
  captured = false,
  discoveryState,
  distanceM,
  onClose,
  onViewCard,
  onCapture,
}: Props) {
  const { colors, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const [photoFailed, setPhotoFailed] = useState(false);

  const state: CatDiscoveryState =
    discoveryState ?? (captured ? 'owned' : 'discoverable');
  const owned = state === 'owned';

  useEffect(() => {
    setPhotoFailed(false);
  }, [cat?.id, cat?.photoUri]);

  if (!visible || !cat) return null;

  const distanceLabel =
    typeof distanceM === 'number' ? formatDistanceMeters(distanceM) : null;
  const rarityId = resolveRevealRarity(cat.analysis, cat.number);
  const rarity = rarityTokens[rarityId];
  const rarityLabel = catDexRarityLabel(rarityId);
  const breedLabel = cat.analysis?.breed?.trim() || 'Chat';
  const displayName =
    owned || Boolean(cat.photoUri) ? cat.name : 'Chat mystère';

  const canShowPhoto =
    Boolean(cat.photoUri) &&
    !photoFailed &&
    !cat.photoUri.startsWith('blob:') &&
    (isCatPhotoRef(cat.photoUri) ||
      cat.photoUri.startsWith('data:') ||
      cat.photoUri.startsWith('http') ||
      cat.photoUri.startsWith('file:'));

  const primaryTitle = owned ? 'Voir la fiche' : 'Photographier';
  const onPrimary = owned ? onViewCard : onCapture;

  const photoSize = spacing[80];
  const clusterBottom = getMapActionClusterBottom(insets.bottom, spacing);
  const cardBottom = clusterBottom + MAP_CAPTURE_FAB_SIZE + spacing[16];

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      />

      <View
        accessibilityViewIsModal
        style={[
          styles.card,
          {
            left: spacing[24],
            right: spacing[24],
            bottom: cardBottom,
            backgroundColor: colors.surface,
            borderRadius: radius[16],
            padding: spacing[16],
            borderWidth: 1,
            borderColor: colors.border,
            gap: spacing[16],
            flexDirection: 'column',
            alignItems: 'stretch',
          },
          shadow.floating,
        ]}
      >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[16],
              width: '100%' }}
          >
            <View
              style={{
                width: photoSize,
                height: photoSize,
                borderRadius: radius[16],
                backgroundColor: colors.surfaceSecondary,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: owned ? 1 : 0.9 }}
            >
              {canShowPhoto ? (
                <CatImage
                  uri={cat.photoUri}
                  style={{
                    width: '100%',
                    height: '100%',
                    opacity: owned ? 1 : 0.85 }}
                  resizeMode="cover"
                  accessibilityLabel={`Photo de ${cat.name}`}
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <Text variant="title" color="textMuted">
                  ?
                </Text>
              )}
            </View>

            <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing[8] }}
              >
                <Text
                  variant="title"
                  color="text"
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  {displayName}
                </Text>
                <View
                  style={{
                    flexShrink: 0,
                    paddingHorizontal: spacing[8],
                    paddingVertical: spacing[4],
                    borderRadius: radius.full,
                    backgroundColor: owned
                      ? colors.brandSoft
                      : colors.surfaceSecondary }}
                >
                  <Text
                    variant="caption" weight="semibold"
                    color={owned ? 'textBrand' : 'textSecondary'}
                  >
                    {owned ? '✓ Dans ton CatDex' : 'À découvrir'}
                  </Text>
                </View>
              </View>

              {!owned ? (
                <Text variant="bodySmall" color="textSecondary">
                  Tu ne l’as pas encore rencontré.
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: spacing[4] }}
              >
                <Text
                  variant="bodySmall"
                  color="textSecondary"
                  numberOfLines={1}
                >
                  {breedLabel} ·
                </Text>
                <View
                  style={{
                    paddingHorizontal: spacing[8],
                    paddingVertical: spacing[4],
                    borderRadius: radius.full,
                    backgroundColor: rarity.background }}
                >
                  <Text
                    variant="caption" weight="semibold"
                    style={{
                      color: rarity.foreground }}
                  >
                    {rarityLabel}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[4],
                  marginTop: spacing[4] }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z"
                    stroke={colors.textSecondary}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                    stroke={colors.textSecondary}
                    strokeWidth={iconStroke.regular}
                  />
                </Svg>
                <Text variant="bodySmall" color="textSecondary">
                  {owned
                    ? distanceLabel
                      ? `À ${distanceLabel}`
                      : 'Vu dans cette zone'
                    : distanceLabel
                      ? `Repéré près d’ici · ~${distanceLabel}`
                      : 'Repéré près d’ici'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ width: '100%', alignSelf: 'stretch' }}>
            <Button title={primaryTitle} onPress={onPrimary} fullWidth />
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  card: {
    position: 'absolute',
    flexDirection: 'column',
  },
});
