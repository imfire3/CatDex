import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { Text } from '@/components/Text';
import { getTabBarTotalHeight } from '@/layout/tabBarMetrics';
import { playerLevel } from '@/lib/mapExplore';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';

const XP_MAX = 250;

function ProfileMenuRow({
  label,
  icon,
  onPress,
  showDivider = true,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  showDivider?: boolean;
}) {
  const { colors, spacing, iconStroke } = useTheme();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          paddingVertical: spacing[16],
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <View style={{ width: spacing[24], alignItems: 'center' }}>{icon}</View>
        <Text variant="body" color="text" style={{ flex: 1 }}>
          {label}
        </Text>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 6l6 6-6 6"
            stroke={colors.textMuted}
            strokeWidth={iconStroke.regular}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
      {showDivider ? (
        <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing[40] }} />
      ) : null}
    </>
  );
}

function StatColumn({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  const { fonts, spacing } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing[4] }}>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
        {value}
      </Text>
      <Text variant="caption" color="textSecondary">
        {caption}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, fonts, spacing, radius, shadow, gradients, iconStroke } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const cats = useCatsStore((state) => state.cats);
  const showToast = useToastStore((state) => state.show);

  const catsCount = cats.length;
  const level = playerLevel(catsCount);
  const xp = Math.min(XP_MAX, catsCount * 3 + (catsCount > 0 ? 17 : 0));
  const xpProgress = xp / XP_MAX;
  const displayName = user?.displayName ?? 'Explorateur';
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUri =
    cats[0]?.photoUri &&
    !cats[0].photoUri.startsWith('blob:') &&
    !cats[0].photoUri.startsWith('catphoto:')
      ? cats[0].photoUri
      : undefined;
  const placesExplored = catsCount > 0 ? Math.max(1, Math.round(catsCount * 0.58)) : 0;
  const badgesCount = catsCount > 0 ? Math.max(1, Math.floor(catsCount / 3) + 2) : 0;

  const comingSoon = (feature: string) => {
    showToast({ title: feature, description: 'Bientôt disponible.', tone: 'default' });
  };

  const listBottom = getTabBarTotalHeight(insets.bottom, spacing) + spacing[16];
  const iconColor = colors.textSecondary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: listBottom }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[gradients.primary[0], gradients.primary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + spacing[16],
            paddingHorizontal: spacing[24],
            paddingBottom: spacing[32],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[16] }}>
            <View>
              <Avatar
                size="XL"
                source={avatarUri ? { uri: avatarUri } : undefined}
                initials={initials}
                gradient={!avatarUri}
                accentBorder={false}
              />
              <View
                style={{
                  position: 'absolute',
                  right: spacing[4],
                  bottom: spacing[4],
                  width: spacing[24],
                  height: spacing[24],
                  borderRadius: radius.full,
                  backgroundColor: colors.mapPlayer,
                  borderWidth: 2,
                  borderColor: colors.onAccent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
                    fill={colors.onAccent}
                  />
                </Svg>
              </View>
            </View>

            <View style={{ flex: 1, gap: spacing[4] }}>
              <Text variant="h2" color="onAccent" style={{ fontFamily: fonts.display }}>
                {displayName}
              </Text>
              <Text variant="bodySmall" color="onAccent" style={{ opacity: 0.9 }}>
                Explorateur niveau {level}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[8],
              marginTop: spacing[24],
            }}
          >
            <View
              style={{
                flex: 1,
                height: spacing[8],
                borderRadius: radius.full,
                backgroundColor: 'rgba(255,255,255,0.28)',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${Math.round(xpProgress * 100)}%`,
                  height: '100%',
                  borderRadius: radius.full,
                  backgroundColor: colors.onAccent,
                }}
              />
            </View>
            <Text variant="caption" color="onAccent" style={{ fontFamily: fonts.bodySemi }}>
              {xp} / {XP_MAX} XP
            </Text>
          </View>
        </LinearGradient>

        <View
          style={{
            marginTop: -spacing[16],
            borderTopLeftRadius: spacing[24],
            borderTopRightRadius: spacing[24],
            backgroundColor: colors.background,
            paddingTop: spacing[24],
            paddingHorizontal: spacing[24],
            gap: spacing[24],
          }}
        >
          <View
            style={[
              {
                flexDirection: 'row',
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.cta,
                paddingVertical: spacing[16],
              },
              shadow.low,
            ]}
          >
            <StatColumn label="Chats" value={String(catsCount)} caption="découverts" />
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing[8] }} />
            <StatColumn label="Lieux" value={String(placesExplored)} caption="explorés" />
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing[8] }} />
            <StatColumn label="Badges" value={String(badgesCount)} caption="obtenus" />
          </View>

          <View
            style={[
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.cta,
                paddingHorizontal: spacing[16],
              },
              shadow.low,
            ]}
          >
            <ProfileMenuRow
              label="Modifier le profil"
              onPress={() => comingSoon('Modifier le profil')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="8" r="3.5" stroke={iconColor} strokeWidth={iconStroke.regular} />
                  <Path
                    d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
                    stroke={iconColor}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                </Svg>
              }
            />
            <ProfileMenuRow
              label="Paramètres"
              onPress={() => router.push('/settings')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="2.5" stroke={iconColor} strokeWidth={iconStroke.regular} />
                  <Path
                    d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
                    stroke={iconColor}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                </Svg>
              }
            />
            <ProfileMenuRow
              label="Succès"
              onPress={() => router.push('/achievements')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
                    stroke={iconColor}
                    strokeWidth={iconStroke.regular}
                    strokeLinejoin="round"
                  />
                </Svg>
              }
            />
            <ProfileMenuRow
              label="Aide & support"
              showDivider={false}
              onPress={() => comingSoon('Aide & support')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="8" stroke={iconColor} strokeWidth={iconStroke.regular} />
                  <Path
                    d="M9.5 9.5a2.5 2.5 0 1 1 4.2 1.8c-.8.7-1.7 1.4-1.7 2.7"
                    stroke={iconColor}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                  <Circle cx="12" cy="17.2" r="0.9" fill={iconColor} />
                </Svg>
              }
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
            onPress={() => {
              signOut();
              router.replace('/(auth)/welcome');
            }}
            style={({ pressed }) => ({
              alignItems: 'center',
              paddingVertical: spacing[16],
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text variant="bodySmall" color="danger" style={{ fontFamily: fonts.bodySemi }}>
              Se déconnecter
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
