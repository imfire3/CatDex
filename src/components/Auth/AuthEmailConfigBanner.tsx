import { useEffect, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import Constants from 'expo-constants';

import { Text } from '@/components/Text';
import {
  fetchSupabaseAuthSettings,
  isEmailConfirmRequired,
  type SupabaseAuthPublicSettings,
} from '@/lib/supabaseAuthConfig';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';

const FALLBACK_DASHBOARD = 'https://supabase.com/dashboard';

/**
 * Build Auth → Providers dashboard URL from the configured project URL.
 * Never hardcode a production project ref in this public repo.
 */
function getAuthProvidersDashboardUrl(): string {
  const raw =
    Constants.expoConfig?.extra?.supabaseUrl ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    '';
  const trimmed = String(raw).trim().replace(/\/$/, '');
  const match = trimmed.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co$/i);
  if (match?.[1]) {
    return `https://supabase.com/dashboard/project/${match[1]}/auth/providers`;
  }
  return FALLBACK_DASHBOARD;
}

/**
 * Warns when Supabase still requires email confirmation — the usual cause of
 * "invalid credentials" right after signup (account never created / unconfirmed
 * + confirmation e-mails rate-limited).
 */
export function AuthEmailConfigBanner() {
  const { colors, spacing, radius } = useTheme();
  const [settings, setSettings] = useState<SupabaseAuthPublicSettings | null>(
    null,
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    void fetchSupabaseAuthSettings().then((next) => {
      if (!cancelled) setSettings(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured || !isEmailConfirmRequired(settings)) {
    return null;
  }

  return (
    <View
      style={{
        gap: spacing[8],
        padding: spacing[16],
        borderRadius: radius.md,
        backgroundColor: colors.warningSoft,
        borderWidth: 1,
        borderColor: colors.warning,
      }}
    >
      <Text variant="bodySmall" color="text">
        Config Supabase : « Confirm email » est encore activé. Les comptes ne
        se créent / connectent souvent pas (limite d’e-mails + pas de session).
      </Text>
      <Text variant="caption" color="textSecondary">
        Dashboard → Authentication → Providers → Email → désactive Confirm
        email, puis recrée ton compte.
      </Text>
      <Pressable
        accessibilityRole="link"
        onPress={() => void Linking.openURL(getAuthProvidersDashboardUrl())}
        hitSlop={8}
      >
        <Text variant="caption" color="textBrand">
          Ouvrir les providers Auth →
        </Text>
      </Pressable>
    </View>
  );
}
