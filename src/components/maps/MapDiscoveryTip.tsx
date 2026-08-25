import { StyleSheet, View } from 'react-native';
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
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
      <View style={styles.root} pointerEvents="box-none">
        <View
          accessibilityRole="summary"
          accessibilityLabel="Conseil pour découvrir des chats"
          style={[
            styles.card,
            {
              marginTop: insets.top + spacing[64],
              marginHorizontal: spacing[16],
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
          <Text variant="body" weight="semibold" color="textBrand">
            Repère les chats à découvrir
          </Text>
          <View style={styles.legendRow}>
            <View style={[styles.ring, { borderColor: colors.brand }]} />
            <Text variant="bodySmall" color="textSecondary" style={{ flex: 1 }}>
              Les cercles pointillés sont des chats proches à photographier.
            </Text>
          </View>
          <Button title="Compris" variant="secondary" onPress={onDismiss} />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    zIndex: 30,
  },
  card: {
    alignSelf: 'stretch',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
