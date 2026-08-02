import { useRef, useState } from 'react';
import {
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputFocusEventData,
  type TextInputProps as RNTextInputProps,
  type TextInput as RNTextInputType,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type FieldProps = {
  label?: string;
  helperText?: string;
  error?: string;
  /** Show a green check when the field is valid (e.g. password). */
  valid?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** @deprecated Theme is light-first; kept for API compatibility */
  light?: boolean;
};

export type AppTextInputProps = RNTextInputProps & FieldProps;

function ValidCheck() {
  const { colors, iconStroke } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessibilityLabel="Valide">
      <Path
        d="M20 6 9 17l-5-5"
        stroke={colors.success}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FieldShell({
  label,
  helperText,
  error,
  valid,
  disabled,
  leftIcon,
  rightIcon,
  containerStyle,
  children,
  focused,
  filled,
}: FieldProps & {
  children: React.ReactNode;
  focused?: boolean;
  filled?: boolean;
}) {
  const { colors, spacing, radius, shadow } = useTheme();
  const showValid = Boolean(valid) && !error;
  const borderColor = error
    ? colors.borderError
    : focused
      ? colors.focusRing
      : showValid
        ? colors.success
        : colors.border;
  const borderWidth = focused || error || showValid ? 2 : 1;
  const elevated = focused || (filled && !disabled);

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
            backgroundColor: disabled
              ? colors.surfaceDisabled
              : focused || filled
                ? colors.surface
                : colors.surfaceSecondary,
            borderColor,
            borderWidth,
            borderRadius: radius.xs,
            paddingHorizontal: spacing[16],
            minHeight: spacing[56],
            opacity: disabled ? 0.7 : 1,
            gap: spacing[8],
          },
          elevated ? shadow.low : null,
        ]}
      >
        {leftIcon}
        <View style={styles.inputWrap}>{children}</View>
        {showValid ? <ValidCheck /> : rightIcon}
      </View>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="textMuted">
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
  valid,
  disabled,
  leftIcon,
  rightIcon,
  containerStyle,
  light: _light,
  style,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: AppTextInputProps) {
  const { colors, fonts, typography, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<RNTextInputType>(null);
  const filled = Boolean(rest.value != null && String(rest.value).length > 0);

  const handleFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      valid={valid}
      disabled={disabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      containerStyle={containerStyle}
      focused={focused}
      filled={filled}
    >
      <RNTextInput
        {...rest}
        ref={inputRef}
        editable={!disabled}
        multiline={multiline}
        showSoftInputOnFocus
        placeholderTextColor={colors.placeholder}
        accessibilityState={{ disabled: !!disabled }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          {
            flex: 1,
            width: '100%',
            alignSelf: 'stretch',
            minHeight: multiline ? spacing[96] : spacing[48],
            color: colors.text,
            fontFamily: fonts.body,
            fontSize: typography.body.fontSize,
            // lineHeight on single-line TextInput breaks iOS caret / focus metrics
            ...(multiline
              ? { lineHeight: typography.body.lineHeight }
              : Platform.OS === 'android'
                ? { textAlignVertical: 'center' as const, includeFontPadding: false }
                : null),
            paddingVertical: multiline ? spacing[16] : 0,
            margin: 0,
            textAlign: 'left',
          },
          style,
        ]}
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
  return <TextInput multiline textAlignVertical="top" {...props} />;
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
});
