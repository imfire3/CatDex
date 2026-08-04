import { Image, Modal as RNModal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { CatImage } from '@/components/CatImage';
import { Text } from '@/components/Text';
import { formatDistanceMeters } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

import { LOWPOLY_CAT_PIN } from '@/components/maps/CatPinVisual';

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
 * Full-screen cat preview from the map — same canvas background as the app.
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
  const { colors, fonts, spacing, radius, iconStroke, motion } = useTheme();
  const insets = useSafeAreaInsets();

  if (!cat) return null;

  const distanceLabel =
    typeof distanceM === 'number' ? formatDistanceMeters(distanceM) : null;

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={onClose}
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

          <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
            CatDex
          </Text>

          <View style={{ width: spacing[40], height: spacing[40] }} />
        </View>

        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing[24],
            paddingBottom: insets.bottom + spacing[24],
            gap: spacing[24],
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: radius[8],
              backgroundColor: colors.surfaceSecondary,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {captured && cat.photoUri ? (
              <CatImage
                uri={cat.photoUri}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel={`Photo de ${cat.name}`}
              />
            ) : (
              <Image
                source={LOWPOLY_CAT_PIN}
                style={{ width: '72%', height: '72%' }}
                resizeMode="contain"
                accessibilityLabel="Chat mystère"
              />
            )}
          </View>

          <View style={{ gap: spacing[8], width: '100%' }}>
            <Text
              variant="h2"
              color="textBrand"
              style={{ fontFamily: fonts.display }}
            >
              {captured ? cat.name : 'Chat mystère'}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {captured
                ? `${cat.analysis.breed} · ${cat.analysis.color}`
                : 'Pas encore capturé'}
              {distanceLabel ? ` · ${distanceLabel}` : ''}
            </Text>
          </View>

          {captured ? (
            <Text variant="body" color="textBody">
              {cat.analysis.description}
            </Text>
          ) : (
            <Text variant="body" color="textSecondary">
              Approche-toi et photographie-le pour l’ajouter à ton CatDex.
            </Text>
          )}

          <View style={{ marginTop: 'auto', width: '100%', gap: spacing[8] }}>
            {captured ? (
              <Button title="Voir la fiche" onPress={onViewCard} />
            ) : (
              <>
                <Button title="Le capturer" onPress={onCapture} />
                <Button title="J’y vais" variant="secondary" onPress={onGoThere} />
              </>
            )}
            {captured ? (
              <Button title="Retour" variant="secondary" onPress={onClose} />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
});
