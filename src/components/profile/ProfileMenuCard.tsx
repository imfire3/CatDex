import { View } from 'react-native'

import {
  IconBell,
  IconSettings,
  IconShield,
  IconUser,
  SettingsRow,
} from '@/components/Settings'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  onEditProfile: () => void
  onNotifications: () => void
  onPrivacy: () => void
  onSettings: () => void
}

/** White settings card — icon tile, label, chevron. */
export function ProfileMenuCard({
  onEditProfile,
  onNotifications,
  onPrivacy,
  onSettings,
}: Props) {
  const { colors, radius, shadow } = useTheme()

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
        icon={<IconSettings />}
        title="Paramètres"
        showDivider={false}
        onPress={onSettings}
      />
    </View>
  )
}
