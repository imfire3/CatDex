import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { Avatar } from '@/components/Avatar'
import { ProgressBar } from '@/components/Progress'
import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  displayName: string
  avatarUri?: string
  level: number
  xpIntoLevel: number
  xpMax: number
}

/** Compact trainer header — avatar, name, level, XP bar. */
export function ProfileHero({
  displayName,
  avatarUri,
  level,
  xpIntoLevel,
  xpMax,
}: Props) {
  const { colors, fonts, spacing, gradients } = useTheme()
  const initials = displayName.slice(0, 2).toUpperCase()
  const coverHeight = spacing[64]
  const nextLevel = level + 1

  return (
    <View>
      <View style={{ height: coverHeight }}>
        <LinearGradient
          colors={[gradients.primarySoft[0], gradients.primarySoft[1], colors.background]}
          locations={[0, 0.55, 1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: coverHeight,
          }}
        />
      </View>

      <View
        style={{
          marginTop: -spacing[32],
          paddingHorizontal: spacing[24],
          gap: spacing[16],
        }}
      >
        <Avatar
          hero
          source={avatarUri ? { uri: avatarUri } : undefined}
          initials={initials}
          gradient={!avatarUri}
          accentBorder
          accessibilityLabel={`Avatar de ${displayName}`}
        />

        <View style={{ gap: spacing.sm }}>
          <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
            {displayName}
          </Text>
          <Text variant="body" color="textSecondary">
            Niveau {level}
          </Text>
          <Text variant="caption" color="textMuted">
            En route vers le niveau {nextLevel}
          </Text>
          <ProgressBar progress={xpMax ? xpIntoLevel / xpMax : 0} height={8} />
          <Text variant="caption" color="textMuted">
            {xpIntoLevel} / {xpMax} XP
          </Text>
        </View>
      </View>
    </View>
  )
}
