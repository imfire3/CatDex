import { Pressable, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { Avatar } from '@/components/Avatar'
import { Text } from '@/components/Text'
import { AvatarEditBadge } from '@/components/profile/AvatarEditBadge'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  displayName: string
  subtitle?: string
  avatarUri?: string
  level: number
  onEdit: () => void
}

/** Centered identity — avatar, name + level chip on one row, email below. */
export function ProfileHero({
  displayName,
  subtitle,
  avatarUri,
  level,
  onEdit,
}: Props) {
  const { colors, spacing, radius, iconSize, iconStroke } = useTheme()
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <View
      style={{
        alignItems: 'center',
        paddingHorizontal: spacing[24],
        paddingTop: spacing[24],
        gap: spacing[16],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier le profil"
        onPress={onEdit}
        style={{ alignItems: 'center' }}
      >
        <View>
          <Avatar
            hero
            source={avatarUri ? { uri: avatarUri } : undefined}
            initials={initials}
            gradient={!avatarUri}
            accessibilityLabel={`Avatar de ${displayName}`}
          />
          <AvatarEditBadge />
        </View>
      </Pressable>

      <View style={{ alignItems: 'center', gap: spacing[8], width: '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: spacing[8],
            maxWidth: '100%',
            paddingHorizontal: spacing[8],
          }}
        >
          <Text
            variant="title"
            weight="bold"
            color="text"
            align="center"
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {displayName}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[8],
              paddingHorizontal: spacing[16],
              paddingVertical: spacing[8],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
              flexShrink: 0,
            }}
          >
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 7 10 17l-5-5"
                stroke={colors.brand}
                strokeWidth={iconStroke.bold}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text variant="caption" weight="semibold" color="textBrand">
              Niveau {level}
            </Text>
          </View>
        </View>
        {subtitle ? (
          <Text variant="bodySmall" color="textSecondary" align="center">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
