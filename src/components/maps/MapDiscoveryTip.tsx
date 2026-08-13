import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

/**
 * Light first-visit coach tip when the map shows community cats
 * but the player's CatDex is still empty. Not a full onboarding screen.
 */
export function MapDiscoveryTip({ visible, onDismiss }: Props) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          onPress={onDismiss}
          style={StyleSheet.absoluteFill}
        />

        <View
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              marginTop: insets.top + spacing[80],
              marginHorizontal: spacing[24],
              backgroundColor: colors.surface,
              borderRadius: radius[16],
              padding: spacing[24],
              borderWidth: 1,
              borderColor: colors.border,
              gap: spacing[16],
            },
            shadow.floating,
          ]}
        >
          <Text
            variant="h3"
            color="textBrand"
            style={{ fontFamily: fonts.display }}
          >
            Des chats ont été repérés près de toi ✨
          </Text>

          <View style={{ gap: spacing[8] }}>
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.brand },
                ]}
              />
              <Text variant="bodySmall" color="text">
                Dans ton CatDex
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.ring,
                  { borderColor: colors.brand },
                ]}
              />
              <Text variant="bodySmall" color="text">
                À découvrir
              </Text>
            </View>
          </View>

          <Text variant="bodySmall" color="textSecondary">
            Les chats au cercle pointillé ont été repérés par d’autres joueurs.
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            Photographie-les pour les ajouter à ton CatDex.
          </Text>

          <Button title="Compris" onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  card: {
    alignSelf: 'stretch',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ring: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
});
