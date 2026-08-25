import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  IconCamera,
  IconMap,
  IconRadar,
  IconTrophy,
  IconUser,
} from '@/components/Settings/settingsIcons';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type MainRoute = 'map' | 'missions' | 'catdex' | 'profile';

const ITEMS: {
  id: MainRoute;
  label: string;
  href: '/(tabs)/map' | '/(tabs)/missions' | '/(tabs)/catdex' | '/(tabs)/profile';
  Icon: typeof IconMap;
}[] = [
  { id: 'map', label: 'Carte', href: '/(tabs)/map', Icon: IconMap },
  { id: 'missions', label: 'Missions', href: '/(tabs)/missions', Icon: IconTrophy },
  { id: 'catdex', label: 'CatDex', href: '/(tabs)/catdex', Icon: IconRadar },
  { id: 'profile', label: 'Profil', href: '/(tabs)/profile', Icon: IconUser },
];

export function MainTabBar({ activeRoute }: { activeRoute: string }) {
  const { colors, spacing, radius, shadow, iconSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing[8],
        paddingBottom: Math.max(insets.bottom, spacing[8]),
        paddingHorizontal: spacing[8],
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing[4],
      }}
    >
      {ITEMS.slice(0, 2).map(({ id, label, href, Icon }) => {
        const selected = activeRoute === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => router.replace(href)}
            style={{ flex: 1, minHeight: spacing[48], alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            <Icon color={selected ? colors.brand : colors.textSecondary} size={iconSize.sm} />
            <Text variant="caption" weight={selected ? 'semibold' : 'regular'} color={selected ? 'textBrand' : 'textSecondary'}>
              {label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Photographier un chat"
        onPress={() => router.push('/scanner')}
        style={[
          {
            width: spacing[56],
            height: spacing[56],
            marginHorizontal: spacing[4],
            borderRadius: radius.full,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadow.medium,
        ]}
      >
        <IconCamera color={colors.onBrand} size={iconSize.md} />
      </Pressable>

      {ITEMS.slice(2).map(({ id, label, href, Icon }) => {
        const selected = activeRoute === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => router.replace(href)}
            style={{ flex: 1, minHeight: spacing[48], alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            <Icon color={selected ? colors.brand : colors.textSecondary} size={iconSize.sm} />
            <Text variant="caption" weight={selected ? 'semibold' : 'regular'} color={selected ? 'textBrand' : 'textSecondary'}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
