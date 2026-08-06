import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import {
  CaptureReveal,
  type CaptureRevealResult,
} from '@/components/CaptureReveal';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { CATDEX_TARGET, formatCatDefaultName, formatDexNumber } from '@/lib/constants';
import { enrichAnalysis } from '@/lib/catTraits';
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

function CameraBadgeIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 9.5V8a2 2 0 0 1 2-2h1.5l1-1.5h7L16.5 6H18a2 2 0 0 1 2 2v1.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="4"
        y="9.5"
        width="16"
        height="10.5"
        rx="2"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
      <Path
        d="M12 12.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z"
        stroke={color}
        strokeWidth={iconStroke.regular}
      />
    </Svg>
  );
}

/**
 * Post-capture: verify infos → optional first badge → share.
 */
export default function RewardScreen() {
  const { colors, fonts, spacing, radius, shadow, gradients } = useTheme();
  const insets = useSafeAreaInsets();
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

  const displayName = useMemo(() => {
    if (!pending) return '';
    return (
      pending.analysis.suggestedName?.trim() ||
      formatCatDefaultName(pending.nextNumber)
    );
  }, [pending]);

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
    const nextAnalysis = enrichAnalysis(result.analysis, pending.nextNumber);

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
        title: 'Ajouté au CatDex',
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
        <Text variant="h2" color="text" align="center">
          Récompense indisponible
        </Text>
        <Button title="Retour à la carte" onPress={finishToMap} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {phase === 'share' ? (
        <LinearGradient
          colors={[gradients.primarySoft[0], colors.background, colors.background]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing[32],
          paddingHorizontal: spacing[24],
          paddingBottom: Math.max(insets.bottom, spacing[24]),
          justifyContent: 'space-between',
        }}
      >
        {phase === 'badge' ? (
          <>
            <View style={{ alignItems: 'center', gap: spacing[24], paddingTop: spacing[32] }}>
              <Text variant="h1" color="text" align="center" style={{ fontFamily: fonts.display }}>
                Nouveau badge débloqué !
              </Text>

              <View
                style={[
                  {
                    width: 160,
                    height: 160,
                    borderRadius: radius.xl,
                    backgroundColor: colors.brand,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  shadow.glow,
                ]}
              >
                <CameraBadgeIcon color={colors.onAccent} />
              </View>

              <View style={{ alignItems: 'center', gap: spacing[8] }}>
                <Text variant="h2" color="textBrand" align="center">
                  Photographe
                </Text>
                <Text variant="bodySmall" color="textSecondary" align="center">
                  Ami des chats
                </Text>
                <Text variant="body" color="textSecondary" align="center">
                  Prends ta première photo d’un chat.
                </Text>
                <Text
                  variant="body"
                  color="textBrand"
                  align="center"
                  style={{ fontFamily: fonts.bodySemi, marginTop: spacing[8] }}
                >
                  + {xpGained} XP · Niveau {progression.level}
                </Text>
              </View>
            </View>

            <Button title="Super !" onPress={() => setPhase('share')} />
          </>
        ) : null}

        {phase === 'share' ? (
          <>
            <View
              style={{
                alignItems: 'center',
                gap: spacing[24],
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <Text
                variant="h1"
                color="textBrand"
                align="center"
                style={{ fontFamily: fonts.display }}
              >
                Capture réussie !
              </Text>

              <Image
                source={{ uri: savedCat.photoUri }}
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: radius.xl,
                }}
                resizeMode="cover"
              />

              <Text variant="h3" color="text" align="center">
                {savedCat.name} {formatDexNumber(savedCat.number)}
              </Text>

              {!firstCapture ? (
                <Text
                  variant="body"
                  color="textBrand"
                  align="center"
                  style={{ fontFamily: fonts.bodySemi }}
                >
                  + {xpGained} XP
                </Text>
              ) : null}

              <View
                style={[
                  {
                    alignSelf: 'stretch',
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.cta,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing[16],
                    gap: spacing[16],
                  },
                  shadow.low,
                ]}
              >
                <Text variant="h3" color="text" align="center">
                  Partage ta découverte
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Partager"
                  onPress={() => void handleShare()}
                  style={({ pressed }) => ({
                    alignSelf: 'center',
                    paddingVertical: spacing[8],
                    paddingHorizontal: spacing[24],
                    borderRadius: radius.full,
                    backgroundColor: colors.brandSoft,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text
                    variant="bodySmall"
                    color="textBrand"
                    style={{ fontFamily: fonts.bodySemi }}
                  >
                    Partager
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={{ gap: spacing[8] }}>
              <Button
                title="Voir dans mon CatDex"
                onPress={() =>
                  router.replace({
                    pathname: '/cat/[id]',
                    params: { id: savedCat.id },
                  })
                }
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
