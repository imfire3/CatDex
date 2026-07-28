import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FloatingActionButton,
  type FloatingActionButtonProps,
} from '@/layout/FloatingActionButton';
import { useTheme } from '@/theme/ThemeProvider';

/** Compatibility wrapper — positions the DS FAB above the tab bar. */
export function ScannerFab(props: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  const { spacing } = useTheme();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { bottom: Math.max(insets.bottom, spacing[8]) + spacing[24] },
      ]}
    >
      <FloatingActionButton {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 20,
  },
});
