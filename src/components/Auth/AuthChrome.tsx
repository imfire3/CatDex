import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export function AuthBackButton({
  onPress,
}: {
  onPress?: () => void;
  /** @deprecated Theme is light-first */
  light?: boolean;
}) {
  const { colors, spacing, radius, iconStroke, shadow } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Retour"
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        if (router.canGoBack()) router.back();
        else router.replace('/(auth)/welcome');
      }}
      style={({ pressed }) => [
        {
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius[8],
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        shadow.low,
      ]}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 18 9 12l6-6"
          stroke={colors.brand}
          strokeWidth={iconStroke.regular}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

export function AuthHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  inline = false,
  embedded = false,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  light?: boolean;
  embedded?: boolean;
  /** Back button and centered title on one row. */
  inline?: boolean;
}) {
  const { fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  if (inline) {
    const side = spacing[40];
    return (
      <View style={{ gap: spacing[16] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: side,
          }}
        >
          {showBack ? (
            <AuthBackButton onPress={onBack} />
          ) : (
            <View style={{ width: side, height: side }} />
          )}
          <Text
            variant="h2"
            color="textBrand"
            align="center"
            style={{ flex: 1, fontFamily: fonts.display }}
          >
            {title}
          </Text>
          <View style={{ width: side, height: side }} accessibilityElementsHidden />
        </View>
        {subtitle ? (
          <Text variant="body" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={{
        paddingTop: embedded ? 0 : insets.top + spacing[16],
        gap: spacing[24],
      }}
    >
      {showBack ? <AuthBackButton onPress={onBack} /> : null}
      <View style={{ gap: spacing[8] }}>
        <Text variant="h1" color="textBrand" style={{ fontFamily: fonts.display }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function AuthDivider({
  label = 'Ou continuer avec',
}: {
  label?: string;
  light?: boolean;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[8],
      }}
    >
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
    </View>
  );
}

export function TermsCheckbox({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string | null;
  light?: boolean;
}) {
  const { colors, spacing, radius, fonts, iconStroke } = useTheme();

  return (
    <View style={{ gap: spacing[8] }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[8] }}
      >
        <View
          style={{
            width: spacing[24],
            height: spacing[24],
            borderRadius: radius[8],
            borderWidth: 1.5,
            borderColor: error ? colors.danger : checked ? colors.accent : colors.border,
            backgroundColor: checked ? colors.accent : colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked ? (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12.5 10 17.5 19 7"
                stroke={colors.onAccent}
                strokeWidth={iconStroke.bold}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : null}
        </View>
        <Text
          variant="bodySmall"
          color="textBody"
          style={{ flex: 1, fontFamily: fonts.body }}
        >
          J’accepte les conditions d’utilisation
        </Text>
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
