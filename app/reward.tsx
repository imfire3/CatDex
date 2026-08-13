import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CaptureReveal,
  type CaptureRevealResult,
} from '@/components/CaptureReveal';
import { Button } from '@/components/Button';
import { CatImage } from '@/components/CatImage';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pickCatRelatedBadgeCopy } from '@/lib/catBadgeTitle';
import { CATDEX_TARGET, formatCatDefaultName, formatDexNumber } from '@/lib/constants';
import { resolvePersistentPhotoUri } from '@/lib/photoUri';
import {
  estimateTotalXp,
  progressionFromTotalXp,
} from '@/lib/progression';
import { useCatsStore } from '@/store/cats';
import { usePendingCaptureStore } from '@/store/pendingCapture';
import { useToastStore } from '@/store/toast';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Phase = 'verify' | 'badge' | 'share';

function ConfettiBurst() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 17) % 84),
        delay: (i % 7) * 40,
        color: [colors.brand, colors.orange, colors.success, colors.rose, colors.yellow][
          i % 5
        ]!,
        size: 6 + (i % 4) * 2,
      })),
    [colors.brand, colors.orange, colors.rose, colors.success, colors.yellow],
  );

  if (reduceMotion) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  left,
  delay,
  color,
  size,
}: {
  left: number;
  delay: number;
  color: string;
  size: number;
}) {
  const y = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    y.value = withTiming(520, { duration: 1600 + delay * 2 });
    opacity.value = withTiming(0, { duration: 1600 + delay * 2 });
    rotate.value = withTiming(180 + delay, { duration: 1600 });
  }, [delay, opacity, rotate, y]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 40,
          left: `${left}%`,
          width: size,
          height: size * 1.4,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function PulsingBadge({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(0.7);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
    if (reduceMotion) return;
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.65, { duration: 700 })),
      -1,
      false,
    );
  }, [glow, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * (0.96 + glow.value * 0.06) }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

/**
 * Post-capture: verify infos → optional first badge → share.
 */
export default function RewardScreen() {
  const { colors, spacing, radius, shadow, gradients } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const showToast = useToastStore((state) => state.show);
  const addCat = useCatsStore((state) => state.addCat);
  const cats = useCatsStore((state) => state.cats);
  const pending = usePendingCaptureStore((state) => state.pending);
  const clearPending = usePendingCaptureStore((state) => state.clearPending);

  const addingRef = useRef(false);
  const [phase, setPhase] = useState<Phase>(pending ? 'verify' : 'share');
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

  const badgeCopy = useMemo(
    () => (cat ? pickCatRelatedBadgeCopy(cat) : null),
    [cat],
  );
  const badgePhotoSize = spacing[96] + spacing[64];
  const enter = reduceMotion ? undefined : FadeIn.duration(280);
  const enterUp = reduceMotion ? undefined : FadeInUp.delay(80).duration(320);
  const enterDown = reduceMotion ? undefined : FadeInDown.delay(120).duration(320);

  const finishToMap = () => {
    clearPending();
    router.replace('/(tabs)/map');
  };

  const handleRetake = () => {
    clearPending();
    router.replace('/scanner');
  };

  const handleConfirm = async (result: CaptureRevealResult) => {
    if (!pending || addingRef.current) return;
    addingRef.current = true;

    const durablePhoto =
      resolvePersistentPhotoUri({
        uri: pending.photoBase64 ? undefined : pending.photoUri,
        base64: pending.photoBase64,
        mimeType: pending.photoMimeType ?? 'image/jpeg',
      }) ?? pending.photoUri;

    const name =
      result.name.trim() ||
      pending.analysis.suggestedName?.trim() ||
      formatCatDefaultName(pending.nextNumber);
    const nextAnalysis = result.analysis;

    try {
      const catsBefore = useCatsStore.getState().cats;
      const created = await addCat({
        photoUri: durablePhoto,
        latitude: pending.latitude,
        longitude: pending.longitude,
        name,
        analysis: nextAnalysis,
        sourceWorldId: pending.sourceWorldId,
      });

      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // ignore
        }
      }

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
      setCat({
        ...created,
        // Prefer persisted ref; keep durable data:/http URI so the frame never goes blank.
        photoUri: created.photoUri || durablePhoto,
      });
      setXpGained(gained);
      setFirstCapture(isFirst);
      // Badge celebration screen paused for now — go straight to share.
      setPhase('share');
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

  if (phase === 'verify' && pending) {
    return (
      <CaptureReveal
        name={displayName}
        number={pending.nextNumber}
        photoUri={pending.photoUri}
        analysis={pending.analysis}
        onAdd={(result) => {
          void handleConfirm(result);
        }}
        onRetake={handleRetake}
      />
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
        <Text variant="title" color="text" align="center">
          Récompense indisponible
        </Text>
        <Button title="Retour à la carte" onPress={finishToMap} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[gradients.primarySoft[0], colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {phase === 'share' ? <ConfettiBurst /> : null}

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing[32],
          paddingHorizontal: spacing[24],
          paddingBottom: Math.max(insets.bottom, spacing[24]),
          justifyContent: 'space-between' }}
      >
        {phase === 'badge' && badgeCopy && savedCat ? (
          <>
            <Animated.View
              entering={enter}
              style={{ alignItems: 'center', gap: spacing[24], paddingTop: spacing[32] }}
            >
              <Text
                variant="headline"
                color="textBrand"
                align="center"
              >
                Nouveau badge obtenu !
              </Text>

              <PulsingBadge>
                <View
                  style={[
                    {
                      width: badgePhotoSize,
                      height: badgePhotoSize,
                      borderRadius: radius.xl,
                      backgroundColor: colors.surfaceSecondary,
                      borderWidth: 3,
                      borderColor: colors.brand,
                      overflow: 'hidden',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    shadow.glow,
                  ]}
                >
                  <CatImage
                    uri={savedCat.photoUri}
                    style={{ width: badgePhotoSize, height: badgePhotoSize }}
                    resizeMode="cover"
                    accessibilityLabel={`Photo de ${savedCat.name}`}
                  />
                </View>
              </PulsingBadge>

              <View style={{ alignItems: 'center', gap: spacing[8] }}>
                <Text variant="title" color="textBrand" align="center">
                  {badgeCopy.title}
                </Text>
                <Text variant="bodySmall" color="textBody" align="center">
                  {badgeCopy.subtitle}
                </Text>
                <Text
                  variant="title"
                  color="textBrand"
                  align="center"
                  style={{ marginTop: spacing[8] }}
                >
                  +{xpGained} XP
                </Text>
                <Text variant="body" color="textBody" align="center">
                  Niveau {progression.level} atteint
                </Text>
                <Text variant="caption" color="textMuted" align="center">
                  Encore {xpToNext} XP avant le niveau suivant
                </Text>
              </View>
            </Animated.View>

            <View style={{ gap: spacing[8] }}>
              <Button title="Continuer" onPress={() => setPhase('share')} />
              <Button
                variant="tertiary"
                title="Voir tous mes badges"
                onPress={() => setPhase('share')}
              />
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
                justifyContent: 'center' }}
            >
              <Animated.View entering={enterUp}>
                <Text
                  variant="headline"
                  color="textBrand"
                  align="center"
                >
                  {savedCat.name} rejoint ton CatDex !
                </Text>
              </Animated.View>

              <Animated.View entering={enterDown}>
                <View
                  style={{
                    width: badgePhotoSize,
                    height: badgePhotoSize,
                    borderRadius: radius.cta,
                    borderWidth: 3,
                    borderColor: colors.brand,
                    backgroundColor: colors.surfaceSecondary,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center' }}
                >
                  <CatImage
                    uri={savedCat.photoUri}
                    style={{
                      width: badgePhotoSize,
                      height: badgePhotoSize }}
                    resizeMode="cover"
                    accessibilityLabel={`Photo de ${savedCat.name}`}
                  />
                </View>
              </Animated.View>

              <View style={{ alignItems: 'center', gap: spacing[8] }}>
                <Text
                  variant="title"
                  color="textBrand"
                  align="center"
                >
                  +{xpGained} XP
                </Text>
                {firstCapture ? (
                  <Text variant="bodySmall" color="textBody" align="center">
                    Premier chat · Nouvelle série
                  </Text>
                ) : (
                  <Text variant="bodySmall" color="textBody" align="center">
                    {formatDexNumber(savedCat.number)} · CatDex enrichi
                  </Text>
                )}
              </View>

              <View
                style={[
                  {
                    alignSelf: 'stretch',
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.cta,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing[16],
                    gap: spacing[8],
                    alignItems: 'center',
                  },
                  shadow.low,
                ]}
              >
                <Text variant="bodySmall" color="textBody" align="center">
                  Partage ta découverte
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Partager"
                  onPress={() => void handleShare()}
                  style={({ pressed }) => ({
                    paddingVertical: spacing[8],
                    paddingHorizontal: spacing[24],
                    borderRadius: radius.full,
                    backgroundColor: colors.brandSoft,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text
                    variant="bodySmall" weight="semibold"
                    color="textBrand"
                  >
                    Partager
                  </Text>
                </Pressable>
              </View>
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
