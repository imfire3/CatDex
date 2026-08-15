import { useEffect } from 'react'
import { View } from 'react-native'

import {
  IconBell,
  IconPalette,
  IconSettings,
  IconShield,
  IconUser,
  SettingsRow,
} from '@/components/Settings'
import { formatTheme, useSettingsPrefsStore } from '@/store/settingsPrefs'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  onEditProfile: () => void
  onNotifications: () => void
  onPrivacy: () => void
  onAppearance: () => void
  onSettings: () => void
}

/** White settings card — icon tile, label, chevron. */
export function ProfileMenuCard({
  onEditProfile,
  onNotifications,
  onPrivacy,
  onAppearance,
  onSettings,
}: Props) {
  const { colors, radius, shadow } = useTheme()
  const themePref = useSettingsPrefsStore((state) => state.prefs.theme)
  const hydrate = useSettingsPrefsStore((state) => state.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        shadow.low,
      ]}
    >
      <SettingsRow
        icon={<IconUser />}
        title="Modifier le profil"
        onPress={onEditProfile}
      />
      <SettingsRow
        icon={<IconBell />}
        title="Notifications"
        onPress={onNotifications}
      />
      <SettingsRow
        icon={<IconShield />}
        title="Confidentialité"
        onPress={onPrivacy}
      />
      <SettingsRow
        icon={<IconPalette />}
        title="Apparence"
        kind="value"
        value={formatTheme(themePref)}
        onPress={onAppearance}
      />
      <SettingsRow
        icon={<IconSettings />}
        title="Paramètres"
        showDivider={false}
        onPress={onSettings}
      />
    </View>
  )
}
