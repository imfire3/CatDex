import { router } from 'expo-router';
import { Image, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { CatImage } from '@/components/CatImage';
import { CatSprite } from '@/components/CatSprite';
import { EmptyState } from '@/components/EmptyState';
import { GlassIconButton } from '@/components/GlassIconButton';
import { ProgressBar } from '@/components/Progress';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TabStackHeader } from '@/layout/TabStackHeader';
import { formatDexNumber } from '@/lib/constants';
import {
  catDexRarityLabel,
  rarityTokens,
  resolveRevealRarity,
  themeFromColorLabel,
} from '@/lib/catTheme';
import { enrichAnalysis } from '@/lib/catTraits';
import { isCatPhotoRef } from '@/lib/photoStorage';
import {
  buildRecentActivity,
  buildRecentSuccesses,
  CATDEX_GOAL,
  estimateTotalXp,
  favoriteCat,
  formatShortDate,
  locationLabel,
  progressionFromTotalXp,
  uniquePlaces,
} from '@/lib/progression';
import { useAuthStore } from '@/store/auth';
import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

const COVER = require('../../assets/welcome-map-bg.jpg');

function SuccessChip({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  return (
    <View
      style={[
        {
          minWidth: 160,
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[16],
          gap: spacing[4],
        },
        shadow.low,
      ]}
    >
      <View
        style={{
          width: spacing[32],
          height: spacing[32],
          borderRadius: radius.full,
          backgroundColor: colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing[8],
        }}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
            fill={colors.accent}
          />
        </Svg>
      </View>
      <Text variant="bodySmall" color="text" style={{ fontFamily: fonts.bodySemi }} numberOfLines={2}>
        {title}
      </Text>
      <Text variant="caption" color="textMuted" numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

function FavoriteHeroCard({ cat, onPress }: { cat: Cat; onPress: () => void }) {
  const { colors, fonts, spacing, radius, shadow, motion, iconSize, gradients } = useTheme();
  const analysis = enrichAnalysis(cat.analysis, cat.number);
  const theme = themeFromColorLabel(analysis.color, cat.number);
  const rarityId = resolveRevealRarity(analysis, cat.number);
  const rarity = rarityTokens[rarityId];
  const likes = cat.views ?? 0;
  const canShowPhoto =
    Boolean(cat.photoUri) &&
    !cat.photoUri.startsWith('blob:') &&
    (isCatPhotoRef(cat.photoUri) ||
      cat.photoUri.startsWith('data:') ||
      cat.photoUri.startsWith('http') ||
      cat.photoUri.startsWith('file:'));

  const rows = [
    { label: 'Espèce', value: analysis.breed || analysis.color || 'Chat du quartier' },
    { label: 'Rareté', value: catDexRarityLabel(rarityId) },
    { label: 'Likes', value: String(likes) },
    { label: 'Découvert', value: formatShortDate(cat.discoveredAt) },
    { label: 'Lieu', value: locationLabel(cat) },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat préféré ${cat.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: radius.cta,
          overflow: 'hidden',
          backgroundColor: colors.surfaceElevated,
          borderWidth: 2,
          borderColor: rarity.border,
          transform: [{ scale: pressed ? motion.cardPressScale : 1 }],
        },
        shadow.medium,
      ]}
    >
      <View style={{ height: 220, backgroundColor: theme.soft }}>
        {canShowPhoto ? (
          <CatImage uri={cat.photoUri} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <CatSprite colorLabel={analysis.color} seed={cat.number} size={140} />
          </View>
        )}
        <LinearGradient
          colors={[gradients.hero[0], gradients.hero[2]]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 96 }}
        />
        <View
          style={{
            position: 'absolute',
            top: spacing[16],
            left: spacing[16],
            right: spacing[16],
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Badge
            label={formatDexNumber(cat.number)}
            color={colors.text}
            backgroundColor={colors.surfaceElevated}
          />
          <View
            style={{
              width: spacing[40],
              height: spacing[40],
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
        </View>
        <View
          style={{
            position: 'absolute',
            left: spacing[16],
            right: spacing[16],
            bottom: spacing[16],
            backgroundColor: colors.glassFill,
            borderRadius: radius.md,
            paddingHorizontal: spacing[16],
            paddingVertical: spacing[8],
          }}
        >
          <Text variant="h2" color="textBrand" style={{ fontFamily: fonts.display }}>
            {cat.name}
          </Text>
        </View>
      </View>

      <View style={{ padding: spacing[16], gap: spacing[16] }}>
        <Badge
          label={catDexRarityLabel(rarityId)}
          color={rarity.foreground}
          backgroundColor={rarity.background}
        />
        <View style={{ gap: spacing[8] }}>
          {rows.map((row) => (
            <View
              key={row.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: spacing[16],
                paddingVertical: spacing[4],
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text variant="caption" color="textMuted">
                {row.label}
              </Text>
              <Text
                variant="bodySmall"
                color="text"
                style={{ fontFamily: fonts.bodySemi, flex: 1, textAlign: 'right' }}
                numberOfLines={1}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colors, fonts, spacing, radius, shadow, gradients, iconStroke, iconSize, motion } =
    useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const cats = useCatsStore((state) => state.cats);
  const streakDays = useMissionsStore((state) => state.streakDays);
  const showToast = useToastStore((state) => state.show);

  const displayName = user?.displayName ?? 'Explorateur';
  const initials = displayName.slice(0, 2).toUpperCase();
  const fav = favoriteCat(cats);
  const avatarUri =
    user?.avatarUrl ||
    (fav?.photoUri &&
    !fav.photoUri.startsWith('blob:') &&
    !fav.photoUri.startsWith('catphoto:')
      ? fav.photoUri
      : undefined);

  const totalXp = estimateTotalXp(cats);
  const { level, xpIntoLevel, xpMax, title } = progressionFromTotalXp(totalXp);
  const successes = buildRecentSuccesses(cats, level);
  const activity = buildRecentActivity(cats, level);
  const places = uniquePlaces(cats);
  const streak = Math.max(streakDays, cats.length > 0 ? 1 : 0);

  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24];
  const coverHeight = spacing[80];
  const iconColor = colors.textSecondary;

  const enterHero = reduceMotion ? undefined : FadeIn.duration(motion.duration.slow);
  const enterBody = reduceMotion
    ? undefined
    : FadeInUp.delay(80).duration(motion.duration.normal);
  const enterSections = reduceMotion
    ? undefined
    : FadeInDown.delay(140).duration(motion.duration.slow);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabStackHeader
        title="Profil"
        right={
          <GlassIconButton
            accessibilityLabel="Partager le profil"
            onPress={() =>
              showToast({
                title: 'Partager',
                description: 'Bientôt disponible.',
                tone: 'default',
              })
            }
          >
            <Svg width={iconSize.md} height={iconSize.md} viewBox="0 0 24 24" fill="none">
              <Circle cx="18" cy="5" r="2.5" stroke={colors.brand} strokeWidth={iconStroke.regular} />
              <Circle cx="6" cy="12" r="2.5" stroke={colors.brand} strokeWidth={iconStroke.regular} />
              <Circle cx="18" cy="19" r="2.5" stroke={colors.brand} strokeWidth={iconStroke.regular} />
              <Path
                d="M8.4 13.2 15.6 17.3M15.6 6.7 8.4 10.8"
                stroke={colors.brand}
                strokeWidth={iconStroke.regular}
                strokeLinecap="round"
              />
            </Svg>
          </GlassIconButton>
        }
      />
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: listBottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enterHero}>
          <View style={{ height: coverHeight }}>
            <Image
              source={COVER}
              resizeMode="cover"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: coverHeight,
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
                height: coverHeight,
              }}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={enterBody}
          style={{
            marginTop: -spacing[40],
            paddingHorizontal: spacing[24],
            gap: spacing[24],
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
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] }}>
                <Badge label={`${title} · Nv. ${level}`} variant="accent" />
                <Badge
                  label={`Série ${streak} j`}
                  color={colors.warning}
                  backgroundColor={colors.warningSoft}
                />
              </View>
              <View style={{ gap: spacing[8], marginTop: spacing[8] }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.bodySemi }}>
                    Progression
                  </Text>
                  <Text variant="caption" color="textMuted" style={{ fontFamily: fonts.bodySemi }}>
                    {xpIntoLevel.toLocaleString('fr-FR')} / {xpMax.toLocaleString('fr-FR')} XP
                  </Text>
                </View>
                <ProgressBar progress={xpMax ? xpIntoLevel / xpMax : 0} height={8} />
                <Text variant="caption" color="textMuted">
                  CatDex {cats.length}/{CATDEX_GOAL} · {places} lieu{places > 1 ? 'x' : ''} exploré
                  {places > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
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
          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Derniers succès
            </Text>
            {successes.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing[16], paddingRight: spacing[8] }}
              >
                {successes.map((item) => (
                  <SuccessChip key={item.id} title={item.title} subtitle={item.subtitle} />
                ))}
              </ScrollView>
            ) : (
              <Text variant="bodySmall" color="textBody">
                Capture un chat pour débloquer tes premiers trophées.
              </Text>
            )}
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Chat préféré
            </Text>
            {fav ? (
              <FavoriteHeroCard
                cat={fav}
                onPress={() => router.push({ pathname: '/cat/[id]', params: { id: fav.id } })}
              />
            ) : (
              <EmptyState
                title="Pas encore de favori"
                description="Ta carte signature apparaîtra ici après ta première capture."
                actionLabel="Découvrir la carte"
                onAction={() => router.push('/(tabs)/map')}
                illustration={
                  <View
                    style={{
                      width: spacing[64],
                      height: spacing[64],
                      borderRadius: radius.full,
                      backgroundColor: colors.accentSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Svg width={iconSize.lg} height={iconSize.lg} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 21s-7-4.2-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.8-7 10-7 10Z"
                        fill={colors.accent}
                      />
                    </Svg>
                  </View>
                }
              />
            )}
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Activité récente
            </Text>
            <View
              style={[
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: 'hidden',
                },
                shadow.low,
              ]}
            >
              {activity.map((item, index) => (
                <View
                  key={item.id}
                  style={{
                    padding: spacing[16],
                    gap: spacing[4],
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text variant="caption" color="textMuted" style={{ fontFamily: fonts.bodySemi }}>
                    {item.when}
                  </Text>
                  <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" color="textBody">
                    {item.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: spacing[16] }}>
            <Text variant="h3" color="textBrand">
              Paramètres
            </Text>
            <View
              style={[
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: 'hidden',
                },
                shadow.low,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ouvrir les paramètres"
                onPress={() => router.push('/settings')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[16],
                  paddingVertical: spacing[16],
                  paddingHorizontal: spacing[16],
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
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke={iconColor}
                      strokeWidth={iconStroke.regular}
                    />
                    <Path
                      d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.5M17.5 16l1.6 1.5M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.5M17.5 8l1.6-1.5"
                      stroke={iconColor}
                      strokeWidth={iconStroke.regular}
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <View style={{ flex: 1, gap: spacing[4] }}>
                  <Text variant="body" color="text" style={{ fontFamily: fonts.bodySemi }}>
                    Tous les réglages
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Compte, notifications, carte, confidentialité…
                  </Text>
                </View>
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
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
