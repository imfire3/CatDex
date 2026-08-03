import type { ReactNode } from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
};

/**
 * Scroll area that dismisses the keyboard when tapping outside inputs.
 * Uses keyboardShouldPersistTaps="handled" — does not block TextInput focus.
 */
export function KeyboardDismissScrollView({
  children,
  style,
  contentContainerStyle,
}: Props) {
  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

/** @deprecated Use ScrollView with keyboardShouldPersistTaps="handled" instead. */
export function KeyboardDismissView({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      style={[{ flex: 1 }, style]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {children}
    </ScrollView>
  );
}
