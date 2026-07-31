import { useState } from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type FieldProps = {
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export type AppTextInputProps = RNTextInputProps & FieldProps;

function FieldShell({
  label,
  helperText,
  error,
  disabled,
  leftIcon,
  rightIcon,
  containerStyle,
  children,
  focused,
}: FieldProps & { children: React.ReactNode; focused?: boolean }) {
  const { colors, spacing, radius } = useTheme();
  const borderColor = error ? colors.danger : focused ? colors.focusRing : colors.border;

  return (
    <View style={[{ gap: spacing[8] }, containerStyle]}>
      {label ? (
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: disabled ? colors.surfaceSecondary : colors.surface,
            borderColor,
            borderRadius: radius.md,
            paddingHorizontal: spacing[16],
            minHeight: spacing[48],
            opacity: disabled ? 0.6 : 1,
            gap: spacing[8],
          },
        ]}
      >
        {leftIcon}
        <View style={styles.inputWrap}>{children}</View>
        {rightIcon}
      </View>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="textSecondary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

export function TextInput({
  label,
  helperText,
  error,
  disabled,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: AppTextInputProps) {
  const { colors, fonts, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      disabled={disabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      containerStyle={containerStyle}
      focused={focused}
    >
      <RNTextInput
        editable={!disabled}
        placeholderTextColor={colors.placeholder}
        accessibilityState={{ disabled: !!disabled }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          {
            color: colors.text,
            fontFamily: fonts.body,
            fontSize: typography.body.fontSize,
            lineHeight: typography.body.lineHeight,
            paddingVertical: 0,
          },
          style,
        ]}
        {...rest}
      />
    </FieldShell>
  );
}

export function SearchInput(props: AppTextInputProps) {
  return (
    <TextInput
      accessibilityRole="search"
      returnKeyType="search"
      autoCorrect={false}
      {...props}
      placeholder={props.placeholder ?? 'Rechercher'}
    />
  );
}

export function Textarea(props: AppTextInputProps) {
  const { spacing } = useTheme();
  return (
    <TextInput
      multiline
      textAlignVertical="top"
      {...props}
      style={[{ minHeight: spacing[96], paddingTop: spacing[16] }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
