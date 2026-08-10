import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
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
import {
  catDexRarityLabel,
  rarityTokens,
  resolveRevealRarity,
} from '@/lib/catTheme';
import { isCatPhotoRef } from '@/lib/photoStorage';
import { PROXIMITY_ALERT_M } from '@/lib/mapExplore';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  visible: boolean;
  cat: Cat | null;
  captured: boolean;
  distanceM?: number | null;
  onClose: () => void;
  onViewCard: () => void;
  onGoThere: () => void;
  /** Primary action for uncaptured world cats — open the scanner. */
  onCapture: () => void;
};

/**
 * Explorer pin popup — horizontal card matching the product mock
 * (photo · name/breed/distance · compact CTA).
 */
export function MapCatModal({
  visible,
  cat,
  captured,
  distanceM,
  onClose,
  onViewCard,
  onGoThere,
  onCapture,
}: Props) {
  const { colors, fonts, spacing, radius, shadow, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [cat?.id, cat?.photoUri]);

  if (!cat) return null;

  const distanceLabel =
    typeof distanceM === 'number' ? formatDistanceMeters(distanceM) : null;
  const inRange =
    typeof distanceM === 'number' && distanceM <= PROXIMITY_ALERT_M;
  const rarityId = resolveRevealRarity(cat.analysis, cat.number);
  const rarity = rarityTokens[rarityId];
  const rarityLabel = catDexRarityLabel(rarityId);
  const breedLabel = cat.analysis?.breed?.trim() || 'Chat';
  const displayName =
    captured || Boolean(cat.photoUri) ? cat.name : 'Chat mystère';

  const canShowPhoto =
    Boolean(cat.photoUri) &&
    !photoFailed &&
    !cat.photoUri.startsWith('blob:') &&
    (isCatPhotoRef(cat.photoUri) ||
      cat.photoUri.startsWith('data:') ||
      cat.photoUri.startsWith('http') ||
      cat.photoUri.startsWith('file:'));

  const primaryTitle = captured
    ? 'Voir la fiche'
    : inRange
      ? 'Photographier'
      : 'S’approcher';
  const onPrimary = captured
    ? onViewCard
    : inRange
      ? onCapture
      : onGoThere;

  const photoSize = spacing[80];
  const clusterBottom = getMapActionClusterBottom(insets.bottom, spacing);
  const cardBottom = clusterBottom + MAP_CAPTURE_FAB_SIZE + spacing[16];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
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
              left: spacing[16],
              right: spacing[16],
              bottom: cardBottom,
              backgroundColor: colors.surface,
              borderRadius: radius[16],
              padding: spacing[16],
              borderWidth: 1,
              borderColor: colors.border,
              gap: spacing[16],
            },
            shadow.floating,
          ]}
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
            }}
          >
            {canShowPhoto ? (
              <CatImage
                uri={cat.photoUri}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel={`Photo de ${cat.name}`}
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <Text variant="h3" color="textMuted">
                ?
              </Text>
            )}
          </View>

          <View style={{ flex: 1, gap: spacing[4], minWidth: 0 }}>
            <Text
              variant="h3"
              color="text"
              numberOfLines={1}
              style={{ fontFamily: fonts.display }}
            >
              {displayName}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: spacing[4],
              }}
            >
              <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
                {breedLabel} ·
              </Text>
              <View
                style={{
                  paddingHorizontal: spacing[8],
                  paddingVertical: spacing[4],
                  borderRadius: radius.full,
                  backgroundColor: rarity.background,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    fontFamily: fonts.bodySemi,
                    color: rarity.foreground,
                  }}
                >
                  {rarityLabel}
                </Text>
              </View>
            </View>

            {distanceLabel ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[4],
                  marginTop: spacing[4],
                }}
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
                  À {distanceLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <Button
            title={primaryTitle}
            onPress={onPrimary}
            fullWidth={false}
            style={{
              alignSelf: 'center',
              paddingHorizontal: spacing[16],
              minHeight: spacing[48],
              height: spacing[48],
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
