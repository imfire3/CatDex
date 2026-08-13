import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type AppModalProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
};

export function Modal({ visible, title, onClose, children, accessibilityLabel }: AppModalProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

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
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      >
        <Pressable
          accessibilityRole="none"
          accessibilityLabel={accessibilityLabel ?? title}
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              marginHorizontal: spacing[24],
              marginBottom: insets.bottom + spacing[24],
              marginTop: 'auto' as const,
              backgroundColor: colors.surface,
              borderRadius: radius['2xl'],
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[24],
              gap: spacing[16],
            },
            shadow.large,
          ]}
        >
          {title ? (
            <Text variant="title" weight="bold">
              {title}
            </Text>
          ) : null}
          <View>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
