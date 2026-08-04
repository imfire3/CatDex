import { Image, Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatDistanceMeters } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

const POLITE_CAT_PIN = require('../../../assets/models/paws-polite-cat/pin.png');

type Props = {
  visible: boolean;
  cat: Cat | null;
  captured: boolean;
  distanceM?: number | null;
  onClose: () => void;
  onViewCard: () => void;
  onGoThere: () => void;
};

/** Centered preview when tapping a map cat pin. */
export function MapCatModal({
  visible,
  cat,
  captured,
  distanceM,
  onClose,
  onViewCard,
  onGoThere,
}: Props) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  if (!cat) return null;

  const distanceLabel =
    typeof distanceM === 'number' ? formatDistanceMeters(distanceM) : null;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        onPress={onClose}
        style={[
          styles.backdrop,
          {
            backgroundColor: colors.overlay,
            paddingTop: insets.top + spacing[24],
            paddingBottom: insets.bottom + spacing[24],
            paddingHorizontal: spacing[24],
          },
        ]}
      >
        <Pressable
          accessibilityRole="none"
          accessibilityLabel={`Fiche ${cat.name}`}
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.cta,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[24],
              gap: spacing[16],
            },
            shadow.floating,
          ]}
        >
          <View style={{ alignItems: 'center' }}>
            <Image
              source={captured && cat.photoUri ? { uri: cat.photoUri } : POLITE_CAT_PIN}
              style={{
                width: spacing[96] + spacing[16],
                height: spacing[96] + spacing[16],
                borderRadius: captured ? radius.cta : 0,
                backgroundColor: colors.surfaceSecondary,
              }}
              resizeMode={captured ? 'cover' : 'contain'}
            />
          </View>

          <View style={{ gap: spacing[4], alignItems: 'center' }}>
            <Text variant="h2" color="textBrand" align="center" style={{ fontFamily: fonts.display }}>
              {captured ? cat.name : 'Chat mystère'}
            </Text>
            <Text variant="bodySmall" color="textSecondary" align="center">
              {captured
                ? `${cat.analysis.breed} · ${cat.analysis.color}`
                : 'Pas encore capturé'}
              {distanceLabel ? ` · ${distanceLabel}` : ''}
            </Text>
          </View>

          {captured ? (
            <Text variant="body" color="textBody" align="center" numberOfLines={3}>
              {cat.analysis.description}
            </Text>
          ) : (
            <Text variant="bodySmall" color="textSecondary" align="center">
              Approche-toi et photographie-le pour l’ajouter à ton CatDex.
            </Text>
          )}

          {captured ? (
            <Button title="Voir la fiche" onPress={onViewCard} />
          ) : (
            <Button title="J’y vais" onPress={onGoThere} />
          )}

          <Button title="Fermer" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
});
