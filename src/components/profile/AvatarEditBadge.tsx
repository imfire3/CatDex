import { View } from 'react-native'

import { IconPencil } from '@/components/Settings/settingsIcons'
import { useTheme } from '@/theme/ThemeProvider'

/** Brand pencil chip on the avatar corner. */
export function AvatarEditBadge() {
  const { colors, spacing, radius, iconSize, shadow } = useTheme()

  return (
    <View
      style={[
        {
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: spacing[32],
          height: spacing[32],
          borderRadius: radius.full,
          backgroundColor: colors.brand,
          borderWidth: 2,
          borderColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadow.low,
      ]}
    >
      <IconPencil color={colors.onAccent} size={iconSize.sm} />
    </View>
  )
}
