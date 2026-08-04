import type { ReactNode } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';

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
  /** Sticky top chrome (e.g. back button) — stays above the scroll area. */
  header?: ReactNode;
  /** Sticky bottom actions (always visible above the keyboard / home indicator). */
  footer?: ReactNode;
  /** Stretch the white sheet to fill the screen (login / form screens). */
  fullHeight?: boolean;
  /** Flat app canvas (#F9F9FB) without map wallpaper. */
  plain?: boolean;
};

/** Shared auth chrome: map wallpaper + sheet, or plain canvas for forms. */
export function AuthShell({
  children,
  sheetStyle,
  scroll = true,
  header,
  footer,
  fullHeight = false,
  plain = false,
}: AuthShellProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  const sheetPadding = {
    paddingHorizontal: spacing[24],
    paddingTop: fullHeight ? insets.top + spacing[8] : spacing[16],
    paddingBottom: footer ? spacing[16] : Math.max(insets.bottom, spacing[24]),
    borderTopLeftRadius: plain || fullHeight ? 0 : radius.sheet,
    borderTopRightRadius: plain || fullHeight ? 0 : radius.sheet,
    backgroundColor: plain ? colors.background : colors.surfaceElevated,
    borderTopWidth: plain || fullHeight ? 0 : 1,
    borderColor: colors.border,
  };

  const body = scroll ? (
    <ScrollView
      style={fullHeight || footer || header ? { flex: 1 } : undefined}
      contentContainerStyle={{
        flexGrow: fullHeight ? 1 : undefined,
        gap: spacing[24],
        paddingBottom: footer ? spacing[16] : 0,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      onScrollBeginDrag={Keyboard.dismiss}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ gap: spacing[24] }, fullHeight || footer || header ? { flex: 1 } : null]}>
      {children}
    </View>
  );

  const sheet = (
    <View
      style={[
        styles.sheet,
        sheetPadding,
        plain || fullHeight ? null : shadow.floating,
        fullHeight ? styles.sheetFill : null,
        sheetStyle,
      ]}
    >
      {header ? (
        <View
          style={{
            paddingBottom: spacing[16],
            backgroundColor: plain ? colors.background : colors.surfaceElevated,
          }}
        >
          {header}
        </View>
      ) : null}
      {body}
      {footer ? (
        <View
          style={{
            gap: spacing[8],
            paddingTop: spacing[8],
            paddingBottom: Math.max(insets.bottom, spacing[16]),
            backgroundColor: plain ? colors.background : colors.surfaceElevated,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: plain ? colors.background : colors.sky }]}>
      {plain ? null : (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image
            source={WELCOME_MAP}
            resizeMode="cover"
            style={[styles.map, mapWebStyle as object]}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'transparent']}
            style={[styles.topVeil, { height: insets.top + spacing[64] }]}
          />
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.75)', colors.surface]}
            style={styles.bottomVeil}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? undefined : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS !== 'ios'}
        keyboardVerticalOffset={0}
      >
        <View
          style={[
            styles.shellInner,
            fullHeight ? styles.shellFill : styles.shellEnd,
            { paddingTop: fullHeight || plain ? 0 : spacing[16] },
          ]}
        >
          {sheet}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/** @deprecated Use theme colors — kept for secondary CTA styles during migration */
export const AUTH_LIGHT = {
  text: '#15172B',
  textBody: 'rgba(21,23,43,0.78)',
  textSecondary: '#667085',
  sheet: '#FFFFFF',
  field: '#EEF0F2',
  secondaryBg: '#EEF0F2',
  border: '#EEF0F2',
  skySoft: 'rgba(106,105,248,0.12)',
  orangeSoft: '#FFF3EC',
  mintSoft: '#E8F8F2',
} as const;

export const authSecondaryOnLight = {
  backgroundColor: '#EEF0F2',
  borderColor: '#D8DBDF',
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
  shellInner: {
    flex: 1,
  },
  shellFill: {
    justifyContent: 'flex-start',
  },
  shellEnd: {
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
  },
  sheetFill: {
    flex: 1,
  },
});
