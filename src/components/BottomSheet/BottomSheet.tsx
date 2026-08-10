import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function BottomSheet({ visible, onClose, children, style }: BottomSheetProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      />
      <View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          {
            left: spacing[16],
            right: spacing[16],
            bottom: Math.max(insets.bottom, spacing[16]),
            backgroundColor: colors.surface,
            borderRadius: radius.sheet,
            paddingHorizontal: spacing[24],
            paddingTop: spacing[8],
            paddingBottom: spacing[24],
            borderWidth: 1,
            borderColor: colors.border,
          },
          shadow.floating,
          style,
        ]}
      >
        <View
          style={[
            styles.handle,
            {
              width: spacing[40],
              height: spacing[4],
              backgroundColor: colors.border,
              marginBottom: spacing[16],
              borderRadius: radius.full,
            },
          ]}
        />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
  },
  handle: {
    alignSelf: 'center',
  },
});
