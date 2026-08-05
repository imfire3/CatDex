import { router } from 'expo-router';
import { Image, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CatImage } from '@/components/CatImage';
import { GlassIconButton } from '@/components/GlassIconButton';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getTabBarTotalHeight } from '@/layout/tabBarMetrics';
import { resolveRevealRarity } from '@/lib/catTheme';
import { isRareCat, playerLevel } from '@/lib/mapExplore';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

const COVER = require('../../assets/welcome-map-bg.jpg');
const XP_PER_LEVEL = 3000;

const RANK_STEPS = [
  { id: 'recrue', label: 'Recrue', minLevel: 1 },
  { id: 'curieux', label: 'Curieux', minLevel: 2 },
  { id: 'explorateur', label: 'Explorateur', minLevel: 3 },
  { id: 'chasseur', label: 'Chasseur', minLevel: 5 },
  { id: 'legende', label: 'Légende', minLevel: 8 },
] as const;

function rankTitle(level: number): string {
  if (level >= 8) return 'Légende urbaine';
  if (level >= 5) return 'Chasseur de chats';
  if (level >= 3) return 'Explorateur';
  if (level >= 2) return 'Curieux';
  return 'Explorateur novice';
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function uniquePlaces(cats: Cat[]): number {
  const keys = new Set(
    cats.map((cat) => `${cat.latitude.toFixed(3)}:${cat.longitude.toFixed(3)}`),
  );
  return keys.size;
}

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
  const { colors, spacing, iconStroke, motion } = useTheme();

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
          transform: [{ scale: pressed ? motion.pressScale : 1 }],
        })}
      >
        <View
          style={{
            width: spacing[40],
            height: spacing[40],
            borderRadius: spacing[8],
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
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
        <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing[56] }} />
      ) : null}
    </>
  );
}

function MetaStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const { spacing } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing[4] }}>
      {icon}
      <Text variant="bodySmall" color="text" style={{ textAlign: 'center' }} numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  const { fonts, spacing } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing[4] }}>
      <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
        {value}
      </Text>
      <Text variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

function PathStep({
  label,
  state,
  isLast,
}: {
  label: string;
  state: 'done' | 'current' | 'locked';
  isLast: boolean;
}) {
  const { colors, fonts, spacing, radius, iconStroke, iconSize } = useTheme();
  const fill =
    state === 'done' ? colors.accent : state === 'current' ? colors.accentSoft : colors.surfaceSecondary;
  const ring = state === 'locked' ? colors.borderDefault : colors.accent;
  const labelColor = state === 'locked' ? 'textMuted' : state === 'current' ? 'textBrand' : 'text';

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing[8] }}>
      <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {!isLast ? (
          <View
            style={{
              position: 'absolute',
              left: '50%',
              right: -spacing[8],
              height: 2,
              top: spacing[16] - 1,
              backgroundColor: state === 'done' ? colors.accent : colors.border,
            }}
          />
        ) : null}
        <View
          style={{
            width: spacing[32],
            height: spacing[32],
            borderRadius: radius.full,
            backgroundColor: fill,
            borderWidth: 2,
            borderColor: ring,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {state === 'locked' ? (
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M8 11V8a4 4 0 1 1 8 0v3"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
              <Rect
                x="6"
                y="11"
                width="12"
                height="9"
                rx="2"
                stroke={colors.textMuted}
                strokeWidth={iconStroke.regular}
              />
            </Svg>
          ) : state === 'done' ? (
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 12.5 10 16.5 18 8"
                stroke={colors.onAccent}
                strokeWidth={iconStroke.bold}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : (
            <View
              style={{
                width: spacing[8],
                height: spacing[8],
                borderRadius: radius.full,
                backgroundColor: colors.accent,
              }}
            />
          )}
        </View>
      </View>
      <Text
        variant="caption"
        color={labelColor}
        numberOfLines={1}
        style={{
          fontFamily: state === 'current' ? fonts.bodySemi : fonts.body,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ObjectiveRow({
  title,
  progressLabel,
  progress,
  tone,
  icon,
}: {
  title: string;
  progressLabel: string;
  progress: number;
  tone: 'info' | 'warning' | 'danger';
  icon: React.ReactNode;
}) {
  const { colors, fonts, spacing, radius } = useTheme();
  const soft =
    tone === 'warning' ? colors.warningSoft : tone === 'danger' ? colors.dangerSoft : colors.infoSoft;
  const ink = tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.info;

  return (
    <View style={{ flexDirection: 'row', gap: spacing[16], alignItems: 'center' }}>
      <View
        style={{
          width: spacing[40],
          height: spacing[40],
          borderRadius: radius.full,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: spacing[8] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[8] }}>
          <Text variant="bodySmall" color="text" style={{ flex: 1, fontFamily: fonts.bodySemi }}>
            {title}
          </Text>
          <Text variant="caption" style={{ color: ink, fontFamily: fonts.bodySemi }}>
            {progressLabel}
          </Text>
        </View>
        <ProgressBar progress={progress} height={8} />
      </View>
    </View>
  );
}

function MomentRow({
  title,
  subtitle,
  date,
  accentSoft,
  accent,
  icon,
  trailing,
  isLast,
}: {
  title: string;
  subtitle: string;
  date: string;
  accentSoft: string;
  accent: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  isLast: boolean;
}) {
  const { colors, fonts, spacing, radius } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: spacing[16] }}>
      <View style={{ alignItems: 'center', width: spacing[40] }}>
        <View
          style={{
            width: spacing[40],
            height: spacing[40],
            borderRadius: radius.full,
            backgroundColor: accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {icon}
        </View>
        {!isLast ? (
          <View
            style={{
              flex: 1,
              width: 2,
              backgroundColor: colors.border,
              marginTop: spacing[4],
              minHeight: spacing[24],
            }}
          />
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.lg,
          padding: spacing[16],
          marginBottom: isLast ? 0 : spacing[16],
        }}
      >
        <View style={{ flex: 1, gap: spacing[4] }}>
          <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
            {title}
          </Text>
          <Text variant="bodySmall" color="textBody">
            {subtitle}
          </Text>
          <Text variant="caption" color="textMuted">
            {date}
          </Text>
        </View>
        {trailing ?? (
          <View
            style={{
              width: spacing[40],
              height: spacing[40],
              borderRadius: radius.full,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: spacing[16],
                height: spacing[16],
                borderRadius: radius.full,
                backgroundColor: accent,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, fonts, spacing, radius, shadow, gradients, iconStroke, iconSize, motion } =
    useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const cats = useCatsStore((state) => state.cats);
  const missions = useMissionsStore((state) => state.missions);
  const showToast = useToastStore((state) => state.show);

  const catsCount = cats.length;
  const level = playerLevel(catsCount);
  const xpIntoLevel = Math.min(XP_PER_LEVEL - 1, catsCount * 85 + (catsCount > 0 ? 245 : 0));
  const xpProgress = xpIntoLevel / XP_PER_LEVEL;
  const displayName = user?.displayName ?? 'Explorateur';
  const initials = displayName.slice(0, 2).toUpperCase();
  const favoriteCat =
    [...cats].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0] ?? cats[0] ?? null;
  const avatarUri =
    user?.avatarUrl ||
    (favoriteCat?.photoUri &&
    !favoriteCat.photoUri.startsWith('blob:') &&
    !favoriteCat.photoUri.startsWith('catphoto:')
      ? favoriteCat.photoUri
      : undefined);
  const placesExplored = uniquePlaces(cats);
  const legendaryCount = cats.filter(
    (cat) => resolveRevealRarity(cat.analysis, cat.number) === 'exceptional',
  ).length;
  const rareCount = cats.filter((cat) => isRareCat(cat)).length;
  const districts = catsCount > 0 ? Math.max(1, Math.round(catsCount * 0.4) + 1) : 0;
  const questsDone = missions.filter((m) => m.completed).length;
  const questsTotal = Math.max(missions.length, 1);
  const questsPct = Math.round((questsDone / questsTotal) * 100);
  const memberSince = cats[0]?.discoveredAt
    ? formatShortDate(
        [...cats].sort(
          (a, b) => new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime(),
        )[0].discoveredAt,
      )
    : 'Aujourd’hui';
  const firstCat = [...cats].sort(
    (a, b) => new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime(),
  )[0];

  const comingSoon = (feature: string) => {
    showToast({ title: feature, description: 'Bientôt disponible.', tone: 'default' });
  };

  const listBottom = getTabBarTotalHeight(insets.bottom, spacing) + spacing[24];
  const iconColor = colors.textSecondary;
  const coverHeight = spacing[96] + spacing[40];

  const enterHero = reduceMotion ? undefined : FadeIn.duration(motion.duration.slow);
  const enterBody = reduceMotion
    ? undefined
    : FadeInUp.delay(80).duration(motion.duration.normal);
  const enterSections = reduceMotion
    ? undefined
    : FadeInDown.delay(140).duration(motion.duration.slow);

  const districtGoal = 50;
  const rareGoal = 3;
  const streakCurrent = Math.min(10, Math.max(0, catsCount > 0 ? Math.min(catsCount + 2, 10) : 0));
  const streakGoal = 10;

  const moments = [
    firstCat
      ? {
          id: 'first',
          title: 'Première capture',
          subtitle: firstCat.name,
          date: formatShortDate(firstCat.discoveredAt),
          soft: colors.successSoft,
          accent: colors.success,
          trailing: (
            <View
              style={{
                width: spacing[48],
                height: spacing[48],
                borderRadius: radius.md,
                overflow: 'hidden',
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <CatImage uri={firstCat.photoUri} style={{ width: '100%', height: '100%' }} />
            </View>
          ),
          icon: (
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
                fill={colors.success}
              />
            </Svg>
          ),
        }
      : null,
    placesExplored > 0
      ? {
          id: 'explorer',
          title: 'Explorateur local',
          subtitle: `${placesExplored} lieu${placesExplored > 1 ? 'x' : ''} foulé${placesExplored > 1 ? 's' : ''}`,
          date: memberSince,
          soft: colors.infoSoft,
          accent: colors.info,
          icon: (
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
                stroke={colors.info}
                strokeWidth={iconStroke.regular}
              />
              <Circle cx="12" cy="11" r="2" fill={colors.info} />
            </Svg>
          ),
        }
      : null,
    catsCount >= 3
      ? {
          id: 'streak',
          title: 'Série en cours',
          subtitle: `${streakCurrent} jours d’exploration`,
          date: 'Cette semaine',
          soft: colors.warningSoft,
          accent: colors.warning,
          icon: (
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3c2 3 1 5-1 7 3 0 6 2 6 6a5 5 0 1 1-10 0c0-4 3-7 5-13Z"
                fill={colors.warning}
              />
            </Svg>
          ),
        }
      : null,
    catsCount >= 5
      ? {
          id: 'collector',
          title: 'Collectionneur',
          subtitle: `${catsCount} chats au CatDex`,
          date: formatShortDate(cats[cats.length - 1]?.discoveredAt ?? new Date().toISOString()),
          soft: colors.accentSoft,
          accent: colors.accent,
          icon: (
            <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 21s-7-4.2-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.8-7 10-7 10Z"
                fill={colors.accent}
              />
            </Svg>
          ),
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    soft: string;
    accent: string;
    icon: React.ReactNode;
    trailing?: React.ReactNode;
  }[];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: listBottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enterHero}>
          <View style={{ height: coverHeight + insets.top }}>
            <Image
              source={COVER}
              resizeMode="cover"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: coverHeight + insets.top,
              }}
            />
            <LinearGradient
              colors={[gradients.primarySoft[0], gradients.primarySoft[1], colors.background]}
              locations={[0, 0.55, 1]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: coverHeight + insets.top,
              }}
            />
            <View
              style={{
                paddingTop: insets.top + spacing[16],
                paddingHorizontal: spacing[24],
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: spacing[8],
              }}
            >
              <GlassIconButton
                accessibilityLabel="Partager le profil"
                onPress={() => comingSoon('Partager')}
              >
                <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                  <Circle cx="18" cy="5" r="2.5" stroke={colors.text} strokeWidth={iconStroke.regular} />
                  <Circle cx="6" cy="12" r="2.5" stroke={colors.text} strokeWidth={iconStroke.regular} />
                  <Circle cx="18" cy="19" r="2.5" stroke={colors.text} strokeWidth={iconStroke.regular} />
                  <Path
                    d="M8.4 13.2 15.6 17.3M15.6 6.7 8.4 10.8"
                    stroke={colors.text}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                </Svg>
              </GlassIconButton>
              <GlassIconButton
                accessibilityLabel="Paramètres"
                onPress={() => comingSoon('Paramètres')}
              >
                <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="2.5" stroke={colors.text} strokeWidth={iconStroke.regular} />
                  <Path
                    d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
                    stroke={colors.text}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                </Svg>
              </GlassIconButton>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={enterBody}
          style={{
            marginTop: -spacing[48],
            paddingHorizontal: spacing[24],
            gap: spacing[32],
          }}
        >
          <View style={{ gap: spacing[16] }}>
            <Avatar
              hero
              source={avatarUri ? { uri: avatarUri } : undefined}
              initials={initials}
              gradient={!avatarUri}
              accentBorder
              accessibilityLabel={`Avatar de ${displayName}`}
            />

            <View style={{ gap: spacing[8] }}>
              <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
                {displayName}
              </Text>
              <Badge label={rankTitle(level)} variant="accent" />
              <View style={{ gap: spacing[8], marginTop: spacing[8] }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.bodySemi }}>
                    Niveau {level}
                  </Text>
                  <Text variant="caption" color="textMuted" style={{ fontFamily: fonts.bodySemi }}>
                    {xpIntoLevel.toLocaleString('fr-FR')} / {XP_PER_LEVEL.toLocaleString('fr-FR')} XP
                  </Text>
                </View>
                <ProgressBar progress={xpProgress} height={8} />
              </View>
            </View>
          </View>

          <View
            style={[
              {
                flexDirection: 'row',
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: spacing[16],
                paddingHorizontal: spacing[8],
              },
              shadow.low,
            ]}
          >
            <MetaStat
              label="Membre depuis"
              value={memberSince}
              icon={
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Rect
                    x="4"
                    y="5"
                    width="16"
                    height="15"
                    rx="2"
                    stroke={iconColor}
                    strokeWidth={iconStroke.regular}
                  />
                  <Path
                    d="M8 3v4M16 3v4M4 10h16"
                    stroke={iconColor}
                    strokeWidth={iconStroke.regular}
                    strokeLinecap="round"
                  />
                </Svg>
              }
            />
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing[8] }} />
            <MetaStat
              label="Ville"
              value="Marseille"
              icon={
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
                    stroke={iconColor}
                    strokeWidth={iconStroke.regular}
                  />
                  <Circle cx="12" cy="11" r="2" stroke={iconColor} strokeWidth={iconStroke.regular} />
                </Svg>
              }
            />
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing[8] }} />
            <MetaStat
              label="Quêtes"
              value={`${questsPct}%`}
              icon={
                <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                  <Rect x="5" y="12" width="3" height="7" rx="1" fill={iconColor} />
                  <Rect x="10.5" y="8" width="3" height="11" rx="1" fill={iconColor} />
                  <Rect x="16" y="5" width="3" height="14" rx="1" fill={iconColor} />
                </Svg>
              }
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={enterSections}
          style={{
            paddingHorizontal: spacing[24],
            paddingTop: spacing[32],
            gap: spacing[32],
          }}
        >
          <View
            style={[
              {
                flexDirection: 'row',
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: spacing[16],
                paddingHorizontal: spacing[8],
              },
              shadow.low,
            ]}
          >
            <StatPill value={String(catsCount)} label="chats capturés" />
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing[8] }} />
            <StatPill value={String(placesExplored)} label="rues" />
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing[8] }} />
            <StatPill value={String(legendaryCount)} label="légendaires" />
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing[8] }} />
            <StatPill value={String(districts)} label="quartiers" />
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Ton chemin d’exploration
            </Text>
            <Card padded>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {RANK_STEPS.map((step, index) => {
                  let resolved: 'done' | 'current' | 'locked' = 'locked';
                  if (level >= step.minLevel) {
                    const nextMin = RANK_STEPS[index + 1]?.minLevel;
                    resolved = nextMin != null && level >= nextMin ? 'done' : 'current';
                  }

                  return (
                    <PathStep
                      key={step.id}
                      label={step.label}
                      state={resolved}
                      isLast={index === RANK_STEPS.length - 1}
                    />
                  );
                })}
              </View>
            </Card>
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Chat préféré
            </Text>
            {favoriteCat ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Chat préféré ${favoriteCat.name}`}
                onPress={() =>
                  router.push({ pathname: '/cat/[id]', params: { id: favoriteCat.id } })
                }
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    gap: spacing[16],
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing[16],
                    alignItems: 'center',
                    transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
                  },
                  shadow.low,
                ]}
              >
                <View
                  style={{
                    width: spacing[80],
                    height: spacing[80],
                    borderRadius: radius.md,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceSecondary,
                  }}
                >
                  <CatImage uri={favoriteCat.photoUri} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ flex: 1, gap: spacing[4] }}>
                  <Text variant="h3" color="text" style={{ fontFamily: fonts.bodySemi }}>
                    {favoriteCat.name}
                  </Text>
                  <Text variant="bodySmall" color="textBody" numberOfLines={2}>
                    {favoriteCat.analysis.breed || favoriteCat.analysis.color || 'Chat du quartier'}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {formatShortDate(favoriteCat.discoveredAt)}
                  </Text>
                </View>
                <View
                  style={{
                    width: spacing[32],
                    height: spacing[32],
                    borderRadius: radius.full,
                    backgroundColor: colors.dangerSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 21s-7-4.2-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.8-7 10-7 10Z"
                      fill={colors.danger}
                    />
                  </Svg>
                </View>
              </Pressable>
            ) : (
              <Card>
                <View style={{ gap: spacing[8] }}>
                  <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
                    Pas encore de favori
                  </Text>
                  <Text variant="bodySmall" color="textBody">
                    Capture ton premier chat pour commencer ton histoire.
                  </Text>
                </View>
              </Card>
            )}
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Objectifs en cours
            </Text>
            <Card>
              <View style={{ gap: spacing[24] }}>
                <ObjectiveRow
                  title="Visiter 50 quartiers"
                  progressLabel={`${Math.min(districts, districtGoal)}/${districtGoal}`}
                  progress={Math.min(1, districts / districtGoal)}
                  tone="info"
                  icon={
                    <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M4 20V9l8-5 8 5v11"
                        stroke={colors.info}
                        strokeWidth={iconStroke.regular}
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M9 20v-6h6v6"
                        stroke={colors.info}
                        strokeWidth={iconStroke.regular}
                        strokeLinejoin="round"
                      />
                    </Svg>
                  }
                />
                <ObjectiveRow
                  title="Explorer un chat rare"
                  progressLabel={`${Math.min(rareCount, rareGoal)}/${rareGoal}`}
                  progress={Math.min(1, rareCount / rareGoal)}
                  tone="warning"
                  icon={
                    <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
                        fill={colors.warning}
                      />
                    </Svg>
                  }
                />
                <ObjectiveRow
                  title="Série de 10 jours"
                  progressLabel={`${streakCurrent}/${streakGoal}`}
                  progress={Math.min(1, streakCurrent / streakGoal)}
                  tone="danger"
                  icon={
                    <Svg width={iconSize.sm} height={iconSize.sm} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 3c2 3 1 5-1 7 3 0 6 2 6 6a5 5 0 1 1-10 0c0-4 3-7 5-13Z"
                        fill={colors.danger}
                      />
                    </Svg>
                  }
                />
              </View>
            </Card>
          </View>

          {moments.length > 0 ? (
            <View style={{ gap: spacing[16] }}>
              <Text variant="h3" color="textBrand">
                Moments clés
              </Text>
              <View>
                {moments.map((moment, index) => (
                  <MomentRow
                    key={moment.id}
                    title={moment.title}
                    subtitle={moment.subtitle}
                    date={moment.date}
                    accentSoft={moment.soft}
                    accent={moment.accent}
                    icon={moment.icon}
                    trailing={moment.trailing}
                    isLast={index === moments.length - 1}
                  />
                ))}
              </View>
              <Button
                title="Voir toute mon aventure"
                variant="secondary"
                onPress={() => comingSoon('Toute mon aventure')}
              />
            </View>
          ) : null}

          <View
            style={[
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
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
        </Animated.View>
      </ScrollView>
    </View>
  );
}
