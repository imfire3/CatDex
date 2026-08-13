import type { ReactNode } from 'react';
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
  const { colors, spacing, radius, iconStroke } = useTheme();

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
      style={({ pressed }) => ({
        width: spacing[40],
        height: spacing[40],
        borderRadius: radius[8],
        backgroundColor: pressed ? colors.ctaSecondaryPressed : colors.ctaSecondary,
        borderWidth: 1,
        borderColor: colors.ctaSecondaryBorder,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
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
  /** Back on its own row, large centered title below (login / signup). */
  hero = false,
  /** Right-aligned accessory on the title row (e.g. Étape 1 sur 2). */
  trailing,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  light?: boolean;
  embedded?: boolean;
  /** Back button and centered title on one row. */
  inline?: boolean;
  hero?: boolean;
  trailing?: ReactNode;
}) {
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();

  if (hero) {
    return (
      <View style={{ gap: spacing[24] }}>
        {showBack ? (
          <View style={{ alignSelf: 'flex-start' }}>
            <AuthBackButton onPress={onBack} />
          </View>
        ) : (
          <View style={{ height: spacing[40] }} />
        )}
        <View style={{ gap: spacing[8], alignItems: 'center' }}>
          <Text
            variant="headline"
            color="textBrand"
            align="center"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text variant="body" color="textSecondary" align="center">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (inline) {
    const side = spacing[40];
    return (
      <View style={{ gap: subtitle ? spacing[16] : 0, width: '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: side,
            width: '100%',
            paddingVertical: spacing[16],
          }}
        >
          <View
            style={{
              width: side,
              flexShrink: 0,
              alignItems: 'flex-start',
              zIndex: 1,
            }}
          >
            {showBack ? (
              <AuthBackButton onPress={onBack} />
            ) : (
              <View style={{ width: side, height: side }} />
            )}
          </View>

          <View
            pointerEvents="none"
            style={{
              flex: 1,
              minWidth: 0,
              paddingHorizontal: spacing[8],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              variant="title"
              color="textBrand"
              align="center"
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={{ width: '100%', maxWidth: '100%' }}
            >
              {title}
            </Text>
          </View>

          <View
            style={{
              width: side,
              flexShrink: 0,
              alignItems: 'flex-end',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            {trailing ?? <View style={{ width: side, height: side }} />}
          </View>
        </View>
        {subtitle ? (
          <Text variant="body" color="textSecondary" align="center">
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
        gap: spacing[24] }}
    >
      {showBack ? <AuthBackButton onPress={onBack} /> : null}
      <View style={{ gap: spacing[8] }}>
        <Text variant="headline" color="textBrand">
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
        gap: spacing[8] }}
    >
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
      <Text variant="caption" weight="semibold" color="textBrand">
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
  const { colors, spacing, radius, iconStroke } = useTheme();

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
            justifyContent: 'center' }}
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
          style={{ flex: 1 }}
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
