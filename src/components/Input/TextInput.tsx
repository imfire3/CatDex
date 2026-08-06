import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  TextInput as RNTextInput,
  StyleSheet,
  View,
  type StyleProp,
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

function EyeIcon({ open }: { open: boolean }) {
  const { colors, iconStroke } = useTheme();
  const stroke = colors.textSecondary;

  if (open) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
          stroke={stroke}
          strokeWidth={iconStroke.regular}
          strokeLinejoin="round"
        />
        <Path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke={stroke}
          strokeWidth={iconStroke.regular}
        />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18M10.5 10.6A3 3 0 0 0 13.4 13.5M9.4 5.7C10.2 5.6 11.1 5.5 12 5.5 18 5.5 21.5 12 21.5 12a19 19 0 0 1-4.1 4.6M6.2 6.4A19.4 19.4 0 0 0 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.5"
        stroke={stroke}
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
  onPressField,
}: FieldProps & {
  children: React.ReactNode;
  focused?: boolean;
  filled?: boolean;
  onPressField?: () => void;
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
      <Pressable
        accessibilityRole="none"
        disabled={disabled}
        onPress={onPressField}
        style={[
          styles.field,
          {
            backgroundColor: disabled
              ? colors.surfaceDisabled
              : colors.surface,
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
        <View style={styles.inputWrap} pointerEvents="box-none">
          {children}
        </View>
        {showValid ? <ValidCheck /> : null}
        {rightIcon}
      </Pressable>
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
  secureTextEntry,
  ...rest
}: AppTextInputProps) {
  const { colors, fonts, typography, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputRef = useRef<RNTextInputType>(null);
  const filled = Boolean(rest.value != null && String(rest.value).length > 0);
  const isPassword = Boolean(secureTextEntry);
  const hidePassword = isPassword && !passwordVisible;

  const handleFocus = (event: Parameters<NonNullable<RNTextInputProps['onFocus']>>[0]) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: Parameters<NonNullable<RNTextInputProps['onBlur']>>[0]) => {
    setFocused(false);
    onBlur?.(event);
  };

  const focusInput = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  const passwordToggle =
    isPassword && !rightIcon ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        hitSlop={8}
        disabled={disabled}
        onPress={() => setPasswordVisible((value) => !value)}
        style={({ pressed }) => ({
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
          minWidth: spacing[24],
        })}
      >
        <EyeIcon open={passwordVisible} />
      </Pressable>
    ) : (
      rightIcon
    );

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      valid={valid}
      disabled={disabled}
      leftIcon={leftIcon}
      rightIcon={passwordToggle}
      containerStyle={containerStyle}
      focused={focused}
      filled={filled}
      onPressField={focusInput}
    >
      <RNTextInput
        {...rest}
        ref={inputRef}
        editable={!disabled}
        multiline={multiline}
        secureTextEntry={hidePassword}
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
            ...(multiline
              ? { lineHeight: typography.body.lineHeight }
              : Platform.OS === 'android'
                ? { textAlignVertical: 'center' as const, includeFontPadding: false }
                : null),
            paddingVertical: multiline ? spacing[16] : Platform.OS === 'ios' ? spacing[16] : 0,
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
    minHeight: 48,
  },
});
