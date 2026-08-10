import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { CatImage } from '@/components/CatImage';
import { Text } from '@/components/Text';
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
 * Explorer cat sheet — compact bottom card matching the product mock.
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
  const { colors, fonts, spacing, radius, iconStroke } = useTheme();
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
      : 'Lancer l’approche';
  const onPrimary = captured
    ? onViewCard
    : inRange
      ? onCapture
      : onGoThere;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ gap: spacing[16] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[16],
          }}
        >
          <View
            style={{
              width: spacing[80],
              height: spacing[80],
              borderRadius: radius[8],
              backgroundColor: colors.surfaceSecondary,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
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
              <Text variant="h2" color="textMuted">
                ?
              </Text>
            )}
          </View>

          <View style={{ flex: 1, gap: spacing[8] }}>
            <Text
              variant="h3"
              color="textBrand"
              numberOfLines={1}
              style={{ fontFamily: fonts.display }}
            >
              {captured || canShowPhoto ? cat.name : 'Chat mystère'}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: spacing[8],
              }}
            >
              <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
                {breedLabel}
              </Text>
              <View
                style={{
                  paddingHorizontal: spacing[8],
                  paddingVertical: spacing[4],
                  borderRadius: radius.full,
                  backgroundColor: rarity.background,
                  borderWidth: 1,
                  borderColor: rarity.border,
                }}
              >
                <Text
                  variant="caption"
                  style={{ fontFamily: fonts.bodySemi, color: rarity.foreground }}
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
                }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z"
                    stroke={colors.brand}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                    stroke={colors.brand}
                    strokeWidth={iconStroke.regular}
                  />
                </Svg>
                <Text
                  variant="bodySmall"
                  color="textSecondary"
                  style={{ fontFamily: fonts.bodySemi }}
                >
                  À {distanceLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ gap: spacing[8] }}>
          <Button title={primaryTitle} onPress={onPrimary} />
          {!captured ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voir la fiche"
              onPress={onViewCard}
              style={({ pressed }) => ({
                alignItems: 'center',
                paddingVertical: spacing[8],
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                variant="bodySmall"
                color="textBrand"
                style={{ fontFamily: fonts.bodySemi }}
              >
                Voir la fiche
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              style={({ pressed }) => ({
                alignItems: 'center',
                paddingVertical: spacing[8],
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text variant="bodySmall" color="textSecondary">
                Fermer
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}
