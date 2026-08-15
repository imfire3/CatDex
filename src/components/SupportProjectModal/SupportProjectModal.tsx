import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { SUPPORT_CTA_LABEL, SUPPORT_REVOLUT_URL } from '@/lib/supportLinks';
import { useTheme } from '@/theme/ThemeProvider';

export type SupportProjectModalProps = {
  visible: boolean;
  onContinue: () => void;
};

/**
 * Post-onboarding note: CatDex is free; optional Revolut tip.
 * In-tree overlay (stays inside the phone frame on web).
 */
export function SupportProjectModal({ visible, onContinue }: SupportProjectModalProps) {
  const { colors, spacing, radius, shadow } = useTheme();

  if (!visible) return null;

  const openRevolut = () => {
    void Linking.openURL(SUPPORT_REVOLUT_URL);
  };

  return (
    <View
      accessibilityViewIsModal
      accessibilityRole="summary"
      accessibilityLabel="CatDex est gratuit"
      style={[StyleSheet.absoluteFill, styles.layer]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        onPress={onContinue}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
      />
      <View
        style={[
          {
            marginHorizontal: spacing[24],
            alignSelf: 'stretch',
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing[24],
            gap: spacing[16],
          },
          shadow.floating,
        ]}
      >
        <Text variant="h3" color="textBrand" align="center">
          CatDex est gratuit
        </Text>
        <Text variant="body" color="textBody" align="center">
          Ce projet est totalement gratuit. Je n’ai pas l’intention de le monétiser —
          c’est un outil pour explorer ton quartier et collectionner ses chats.
        </Text>
        <Text variant="bodySmall" color="textSecondary" align="center">
          Si tu veux m’aider à le faire vivre (hébergement, IA…), tu peux m’offrir un
          coup de pouce via Revolut. Aucune obligation.
        </Text>
        <View style={{ gap: spacing[8], paddingTop: spacing[8] }}>
          <Button title={SUPPORT_CTA_LABEL} onPress={openRevolut} />
          <Button title="Continuer" variant="ghost" onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 30,
    justifyContent: 'center',
  },
});
