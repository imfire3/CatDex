import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';
import { resolveThemeColors } from '@/theme/colors';

const WELCOME_MAP = require('../../../assets/welcome-map-bg.jpg');

const mapWebStyle = {
  objectFit: 'cover' as const,
  objectPosition: 'center 40%',
};

export const authPrimaryNoShadow = {
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
  boxShadow: 'none',
} as ViewStyle;

type AuthShellProps = {
  children: ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
};

/** Shared auth chrome: map wallpaper + white bottom sheet. */
export function AuthShell({ children, sheetStyle, scroll = true }: AuthShellProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  const sheet = (
    <View
      style={[
        styles.sheet,
        {
          paddingHorizontal: spacing[24],
          paddingTop: spacing[8],
          paddingBottom: Math.max(insets.bottom, spacing[24]) + spacing[8],
          borderTopLeftRadius: radius.sheet,
          borderTopRightRadius: radius.sheet,
          backgroundColor: colors.surface,
          gap: spacing[24],
          borderTopWidth: 1,
          borderColor: colors.border,
        },
        shadow.floating,
        sheetStyle,
      ]}
    >
      <View
        style={{
          alignSelf: 'center',
          width: spacing[40],
          height: spacing[4],
          borderRadius: radius.full,
          backgroundColor: colors.borderDefault,
          marginTop: spacing[8],
        }}
      />
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.sky }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={WELCOME_MAP}
          resizeMode="cover"
          style={[styles.map, mapWebStyle as object]}
        />
        <LinearGradient
          colors={[colors.glassFill, 'transparent']}
          style={[styles.topVeil, { height: insets.top + spacing[64] }]}
        />
        <LinearGradient
          colors={['transparent', colors.glassFill, colors.surface]}
          style={styles.bottomVeil}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'flex-end',
              paddingTop: spacing[16],
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {sheet}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingTop: spacing[16] }}>
            {sheet}
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const lightColors = resolveThemeColors('light');

/** @deprecated Prefer useTheme().colors — soft alias during migration */
export const AUTH_LIGHT = {
  text: lightColors.text,
  textBody: lightColors.textBody,
  textSecondary: lightColors.textSecondary,
  sheet: lightColors.surface,
  field: lightColors.surfaceSecondary,
  secondaryBg: lightColors.surfaceSecondary,
  border: lightColors.border,
  skySoft: lightColors.skySoft,
  orangeSoft: lightColors.orangeSoft,
  mintSoft: lightColors.mintSoft,
} as const;

export const authSecondaryOnLight = {
  backgroundColor: lightColors.surfaceSecondary,
  borderColor: lightColors.border,
  minHeight: 56,
} as ViewStyle;

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  topVeil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomVeil: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  sheet: {
    width: '100%',
  },
});
