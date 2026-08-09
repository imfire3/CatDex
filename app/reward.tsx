import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CaptureReveal,
  type CaptureRevealResult,
} from '@/components/CaptureReveal';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/motion';
import { XpTicker } from '@/components/motion/XpTicker';
import {
  RewardCardFlip,
  RewardConfetti,
  RewardStagedBeats,
  type RewardBeat,
} from '@/components/reward';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pickCatRelatedBadgeCopy } from '@/lib/catBadgeTitle';
import {
  catDexRarityLabel,
  resolveRevealRarity,
  rarityTokens,
} from '@/lib/catTheme';
import { CATDEX_TARGET, formatCatDefaultName, formatDexNumber } from '@/lib/constants';
import { playHapticSuccess } from '@/lib/gameFeedback';
import { resolvePersistentPhotoUri } from '@/lib/photoUri';
import {
  estimateTotalXp,
  progressionFromTotalXp,
} from '@/lib/progression';
import { useCatsStore } from '@/store/cats';
import { usePendingCaptureStore } from '@/store/pendingCapture';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat, CatAnalysis } from '@/types/cat';

type Phase = 'celebrate' | 'adjust' | 'badge' | 'share';

function rarityStars(id: ReturnType<typeof resolveRevealRarity>): string {
  const n =
    id === 'exceptional' ? 5 : id === 'rare' ? 4 : id === 'uncommon' ? 3 : 2;
  return Array.from({ length: n }, () => '★').join(' ');
}

/**
 * Post-capture: wow reveal first → optional adjust → badge/share.
 */
export default function RewardScreen() {
  const { colors, fonts, spacing, radius, shadow, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const showToast = useToastStore((state) => state.show);
  const addCat = useCatsStore((state) => state.addCat);
  const cats = useCatsStore((state) => state.cats);
  const pending = usePendingCaptureStore((state) => state.pending);
  const clearPending = usePendingCaptureStore((state) => state.clearPending);

  const addingRef = useRef(false);
  const [phase, setPhase] = useState<Phase>(pending ? 'celebrate' : 'share');
  const [showBeats, setShowBeats] = useState(reduceMotion);
  const [cat, setCat] = useState<Cat | null>(null);
  const [xpGained, setXpGained] = useState(25);
  const [firstCapture, setFirstCapture] = useState(false);

  const savedCat = cat;
  const totalXp = estimateTotalXp(cats);
  const progression = progressionFromTotalXp(totalXp);
  const xpToNext = Math.max(0, progression.xpMax - progression.xpIntoLevel);

  const displayName = useMemo(() => {
    if (!pending) return '';
    return (
      pending.analysis.suggestedName?.trim() ||
      formatCatDefaultName(pending.nextNumber)
    );
  }, [pending]);

  const rarityId = useMemo(
    () =>
      pending
        ? resolveRevealRarity(pending.analysis, pending.nextNumber)
        : savedCat
          ? resolveRevealRarity(savedCat.analysis, savedCat.number)
          : 'common',
    [pending, savedCat],
  );
  const rarity = rarityTokens[rarityId];

  const badgeCopy = useMemo(
    () => (cat ? pickCatRelatedBadgeCopy(cat) : null),
    [cat],
  );
  const cardW = spacing[96] + spacing[80];
  const enter = reduceMotion ? undefined : FadeIn.duration(280);
  const enterUp = reduceMotion ? undefined : FadeInUp.delay(80).duration(320);

  useEffect(() => {
    if (phase !== 'celebrate') return;
    void playHapticSuccess();
  }, [phase]);

  const celebrateBeats: RewardBeat[] = useMemo(() => {
    const beats: RewardBeat[] = [
      { id: 'xp', label: '+XP', icon: 'xp' },
      { id: 'dex', label: 'CatDex', icon: 'book' },
    ];
    if (cats.length === 0) {
      beats.push({ id: 'companion', label: 'Premier compagnon', icon: 'paw' });
      beats.push({ id: 'badge', label: 'Badge', icon: 'badge' });
    }
    return beats;
  }, [cats.length]);

  const finishToMap = () => {
    clearPending();
    router.replace('/(tabs)/map');
  };

  const handleRetake = () => {
    clearPending();
    router.replace('/scanner');
  };

  const persistCat = async (name: string, analysis: CatAnalysis) => {
    if (!pending || addingRef.current) return;
    addingRef.current = true;

    const durablePhoto =
      resolvePersistentPhotoUri({
        uri: pending.photoBase64 ? undefined : pending.photoUri,
        base64: pending.photoBase64,
        mimeType: pending.photoMimeType ?? 'image/jpeg',
      }) ?? pending.photoUri;

    try {
      const catsBefore = useCatsStore.getState().cats;
      const created = await addCat({
        photoUri: durablePhoto,
        latitude: pending.latitude,
        longitude: pending.longitude,
        name,
        analysis,
        sourceWorldId: pending.sourceWorldId,
      });

      await playHapticSuccess();

      const remaining = Math.max(0, CATDEX_TARGET - created.number);
      showToast({
        title: 'Nouveau chat découvert !',
        description:
          remaining > 0
            ? `${created.name} · Plus que ${remaining} chat${remaining > 1 ? 's' : ''}`
            : `${created.name} · CatDex complet !`,
        tone: 'success',
      });

      const catsAfter = useCatsStore.getState().cats;
      const gained = Math.max(
        1,
        estimateTotalXp(catsAfter) - estimateTotalXp(catsBefore),
      );

      const isFirst = catsBefore.length === 0;
      clearPending();
      setCat(created);
      setXpGained(gained);
      setFirstCapture(isFirst);
      setPhase(isFirst ? 'badge' : 'share');
    } catch (error) {
      addingRef.current = false;
      showToast({
        title: 'Ajout impossible',
        description:
          error instanceof Error
            ? error.message
            : 'Stockage plein — recharge l’app puis réessaie.',
        tone: 'danger',
      });
    }
  };

  const handleQuickAdd = () => {
    if (!pending) return;
    const name =
      pending.analysis.suggestedName?.trim() ||
      formatCatDefaultName(pending.nextNumber);
    void persistCat(name, pending.analysis);
  };

  const handleConfirmAdjust = (result: CaptureRevealResult) => {
    const name =
      result.name.trim() ||
      pending?.analysis.suggestedName?.trim() ||
      formatCatDefaultName(pending?.nextNumber ?? 1);
    void persistCat(name, result.analysis);
  };

  const handleShare = async () => {
    if (!savedCat) return;
    try {
      await Share.share({
        message: `J’ai capturé ${savedCat.name} (${formatDexNumber(savedCat.number)}) sur CatDex — ton quartier, tes chats.`,
      });
    } catch {
      // user cancelled
    }
  };

  if (phase === 'adjust' && pending) {
    return (
      <CaptureReveal
        name={displayName}
        number={pending.nextNumber}
        photoUri={pending.photoUri}
        analysis={pending.analysis}
        onAdd={handleConfirmAdjust}
        onRetake={handleRetake}
      />
    );
  }

  if (phase === 'celebrate' && pending) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[gradients.primarySoft[0], colors.background, colors.background]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <RewardConfetti />

        <View
          style={{
            flex: 1,
            paddingTop: insets.top + spacing[24],
            paddingHorizontal: spacing[24],
            paddingBottom: Math.max(insets.bottom, spacing[24]),
            justifyContent: 'space-between',
            gap: spacing[16],
          }}
        >
          <Animated.View
            entering={enterUp}
            style={{ alignItems: 'center', gap: spacing[4] }}
          >
            <Text
              variant="h1"
              color="textBrand"
              align="center"
              style={{ fontFamily: fonts.display }}
            >
              Nouveau chat !
            </Text>
          </Animated.View>

          <View style={{ alignItems: 'center', gap: spacing[16], flex: 1, justifyContent: 'center' }}>
            <RewardCardFlip
              width={cardW}
              borderColor={rarity.border}
              glowColor={rarity.glow}
              onFlipComplete={() => setShowBeats(true)}
            >
              <View style={{ height: spacing[96] + spacing[48], backgroundColor: colors.surfaceSecondary }}>
                <Image
                  source={{ uri: pending.photoUri }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                  accessibilityLabel={`Photo de ${displayName}`}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(21,23,43,0.75)']}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: spacing[48],
                    justifyContent: 'flex-end',
                    padding: spacing[8],
                  }}
                >
                  <Text variant="caption" color="onAccent" style={{ fontFamily: fonts.bodySemi }}>
                    {formatDexNumber(pending.nextNumber)}
                  </Text>
                </LinearGradient>
              </View>
              <View style={{ padding: spacing[16], gap: spacing[8], alignItems: 'center' }}>
                <Text variant="h2" color="text" style={{ fontFamily: fonts.display }}>
                  {displayName}
                </Text>
                <View
                  style={{
                    paddingVertical: spacing[4],
                    paddingHorizontal: spacing[16],
                    borderRadius: radius.full,
                    backgroundColor: rarity.background,
                    borderWidth: 1,
                    borderColor: rarity.border,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{ fontFamily: fonts.bodySemi, color: rarity.foreground }}
                  >
                    {catDexRarityLabel(rarityId)}
                  </Text>
                </View>
              </View>
            </RewardCardFlip>

            <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(500).duration(320)}>
              <Text
                variant="body"
                color="textBrand"
                align="center"
                style={{ letterSpacing: 4 }}
              >
                {rarityStars(rarityId)}
              </Text>
            </Animated.View>

            <RewardStagedBeats beats={celebrateBeats} visible={showBeats} />
          </View>

          <View style={{ gap: spacing[8] }}>
            <Button title="Ajouter à mon CatDex" onPress={handleQuickAdd} />
            <Button
              variant="secondary"
              title="Ajuster les infos"
              onPress={() => setPhase('adjust')}
            />
            <Button variant="tertiary" title="Reprendre une photo" onPress={handleRetake} />
          </View>
        </View>
      </View>
    );
  }

  if (!savedCat) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing[24],
            paddingHorizontal: spacing[24],
            justifyContent: 'center',
            gap: spacing[16],
          },
        ]}
      >
        <Text variant="h2" color="text" align="center">
          Récompense indisponible
        </Text>
        <Button title="Retour à la carte" onPress={finishToMap} />
      </View>
    );
  }

  const shareBeats: RewardBeat[] = [
    { id: 'xp', label: `+${xpGained} XP`, icon: 'xp' },
    ...(firstCapture
      ? [
          {
            id: 'companion',
            label: 'Premier compagnon',
            icon: 'paw' as const,
          },
          {
            id: 'badge',
            label: badgeCopy?.title ?? 'Badge',
            icon: 'badge' as const,
          },
        ]
      : [
          {
            id: 'dex',
            label: formatDexNumber(savedCat.number),
            icon: 'book' as const,
          },
        ]),
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[gradients.primarySoft[0], colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {(phase === 'share' || phase === 'badge') && <RewardConfetti />}

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing[32],
          paddingHorizontal: spacing[24],
          paddingBottom: Math.max(insets.bottom, spacing[24]),
          justifyContent: 'space-between',
        }}
      >
        {phase === 'badge' && badgeCopy ? (
          <>
            <Animated.View
              entering={enter}
              style={{ alignItems: 'center', gap: spacing[16], paddingTop: spacing[16], flex: 1, justifyContent: 'center' }}
            >
              <Text
                variant="h1"
                color="textBrand"
                align="center"
                style={{ fontFamily: fonts.display }}
              >
                Badge débloqué !
              </Text>

              <RewardCardFlip width={cardW} borderColor={colors.brand}>
                <Image
                  source={{ uri: savedCat.photoUri }}
                  style={{ width: cardW, height: cardW }}
                  resizeMode="cover"
                  accessibilityLabel={`Photo de ${savedCat.name}`}
                />
              </RewardCardFlip>

              <View style={{ alignItems: 'center', gap: spacing[8] }}>
                <Text variant="h2" color="textBrand" align="center">
                  {badgeCopy.title}
                </Text>
                <Text variant="bodySmall" color="textBody" align="center">
                  {badgeCopy.subtitle}
                </Text>
                <XpTicker value={xpGained} />
                <Text variant="body" color="textBody" align="center">
                  Niveau {progression.level}
                </Text>
              </View>
            </Animated.View>

            <View style={{ gap: spacing[8] }}>
              <Button title="Continuer" onPress={() => setPhase('share')} />
            </View>
          </>
        ) : null}

        {phase === 'share' ? (
          <>
            <View
              style={{
                alignItems: 'center',
                gap: spacing[16],
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <Animated.View entering={enterUp}>
                <Text
                  variant="h1"
                  color="textBrand"
                  align="center"
                  style={{ fontFamily: fonts.display }}
                >
                  {savedCat.name}
                </Text>
              </Animated.View>

              <RewardCardFlip
                width={cardW}
                borderColor={rarity.border}
                glowColor={rarity.glow}
              >
                <Image
                  source={{ uri: savedCat.photoUri }}
                  style={{ width: cardW, height: cardW * 0.85 }}
                  resizeMode="cover"
                  accessibilityLabel={`Photo de ${savedCat.name}`}
                />
                <View style={{ padding: spacing[16], alignItems: 'center', gap: spacing[8] }}>
                  <View
                    style={{
                      paddingVertical: spacing[4],
                      paddingHorizontal: spacing[16],
                      borderRadius: radius.full,
                      backgroundColor: rarity.background,
                      borderWidth: 1,
                      borderColor: rarity.border,
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{ fontFamily: fonts.bodySemi, color: rarity.foreground }}
                    >
                      {catDexRarityLabel(rarityId)}
                    </Text>
                  </View>
                  <Text variant="body" color="textBrand" style={{ letterSpacing: 4 }}>
                    {rarityStars(rarityId)}
                  </Text>
                </View>
              </RewardCardFlip>

              <XpTicker value={xpGained} />
              <Text variant="caption" color="textMuted" align="center">
                Encore {xpToNext} XP avant le niveau suivant
              </Text>

              <RewardStagedBeats beats={shareBeats} visible />

              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Partager"
                onPress={() => void handleShare()}
                style={[
                  {
                    marginTop: spacing[8],
                    paddingVertical: spacing[8],
                    paddingHorizontal: spacing[24],
                    borderRadius: radius.full,
                    backgroundColor: colors.brandSoft,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                  shadow.low,
                ]}
              >
                <Text
                  variant="bodySmall"
                  color="textBrand"
                  style={{ fontFamily: fonts.bodySemi }}
                >
                  Partager
                </Text>
              </PressableScale>
            </View>

            <View style={{ gap: spacing[8] }}>
              <Button
                title="Voir dans mon CatDex"
                onPress={() => router.replace('/(tabs)/catdex')}
              />
              <Button title="Retour à la carte" variant="secondary" onPress={finishToMap} />
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
