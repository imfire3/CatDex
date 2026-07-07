import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Heart, MapPin, MessageCircle, Share2, ThumbsUp } from "lucide-react-native";
import { CatAvatar3D } from "@/components/game/CatAvatar3D";
import { GlassCard } from "@/components/game/GlassCard";
import { StatBar } from "@/components/game/StatBar";
import { FloatingButton } from "@/components/game/FloatingButton";
import { EmptyState, LoadingView } from "@/components/feedback";
import { GameTextField } from "@/components/ui/GameTextField";
import { IconButton } from "@/components/ui/IconButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { TagChip } from "@/components/ui/TagChip";
import { GAME, RARITY_COLORS, TEXT } from "@/constants/game";
import { useCatDetail, useToggleFavorite } from "@/hooks/useGameData";
import { useAuth } from "@/providers/AuthProvider";
import { gameplayService } from "@/services/gameplay.service";
import { useAppStore } from "@/stores";

const { width } = Dimensions.get("window");

export default function CatProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile } = useAuth();
  const { data: cat, isLoading } = useCatDetail(id ?? "", session?.user.id);
  const setPendingMapFocus = useAppStore((s) => s.setPendingMapFocus);
  const toggleFavorite = useToggleFavorite(session?.user.id ?? "");
  const [favorite, setFavorite] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<{ id: string; user: string; text: string; date: string }[]>([]);
  const [commentText, setCommentText] = useState("");

  const commentAuthor =
    profile?.display_name ?? profile?.username ?? session?.user.email?.split("@")[0] ?? "Chasseur";

  useEffect(() => {
    if (cat) {
      setFavorite(cat.favorite);
      setLikeCount(cat.likeCount);
      setLiked(gameplayService.isLiked(cat.id));
      setComments(gameplayService.getComments(cat.id));
    }
  }, [cat]);

  if (isLoading) {
    return (
      <ScreenBackground>
        <LoadingView label="Chargement de la fiche…" fullScreen />
      </ScreenBackground>
    );
  }

  if (!cat) {
    return (
      <ScreenBackground>
        <EmptyState
          emoji="🐾"
          title="Chat introuvable"
          description="Cette fiche n'existe plus ou a été retirée."
          actionLabel="Retour"
          onAction={() => router.back()}
        />
      </ScreenBackground>
    );
  }

  const rarityColor = RARITY_COLORS[cat.rarity];
  const focusOnMap = () => {
    setPendingMapFocus({ catId: cat.id, latitude: cat.latitude, longitude: cat.longitude });
    router.push("/(tabs)/map");
  };

  return (
    <View style={styles.root}>
      <Image source={{ uri: cat.heroImage }} style={styles.hero} />
      <LinearGradient
        colors={["transparent", "rgba(13,27,42,0.7)", GAME.navy]}
        style={styles.heroOverlay}
      />

      <IconButton
        icon={ChevronLeft}
        onPress={() => router.back()}
        accessibilityLabel="Retour"
        variant="dark"
        style={[styles.backBtn, { top: insets.top + 8 }]}
      />

      <IconButton
        icon={Heart}
        onPress={() => {
          const next = !favorite;
          setFavorite(next);
          if (session?.user.id) {
            toggleFavorite.mutate({ catId: cat.id, favorite: next });
          }
        }}
        accessibilityLabel={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        variant="dark"
        color={favorite ? GAME.pink : GAME.text}
        style={[styles.favBtn, { top: insets.top + 8 }]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={[rarityColor, GAME.indigo, GAME.navy]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.collectibleFrame}
          >
            <View style={styles.collectibleInner}>
              <CatAvatar3D modelId={cat.modelId} emoji={cat.avatar} size={96} />
            </View>
          </LinearGradient>
        </View>

        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View style={[styles.rarityBadge, { backgroundColor: `${rarityColor}33`, borderColor: rarityColor }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>{cat.rarity}</Text>
          </View>
          <Text style={styles.name}>{cat.name}</Text>
          <View style={styles.metaRow}>
            <MapPin color={GAME.sky} size={14} />
            <Text style={styles.zone}>{cat.zone}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.mood}>{cat.mood}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <GlassCard>
            <Text style={styles.desc}>{cat.description}</Text>
            <View style={styles.tags}>
              {[cat.breed, cat.color, cat.pattern].map((t) => (
                <TagChip key={t} label={t} />
              ))}
            </View>
          </GlassCard>
        </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <GlassCard variant="elevated">
            <SectionLabel>Statistiques</SectionLabel>
            <View style={styles.stats}>
              <StatBar label="Charme" value={cat.stats.charme} color={GAME.pink} />
              <StatBar label="Agilité" value={cat.stats.agilité} color={GAME.sky} />
              <StatBar label="Mystère" value={cat.stats.mystère} color={GAME.purple} />
              <StatBar label="Câlinerie" value={cat.stats.câlinerie} color={GAME.gold} />
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard>
            <View style={styles.socialRow}>
              <Pressable
                style={styles.socialBtn}
                onPress={() => {
                  const next = gameplayService.toggleLike(cat.id);
                  setLiked(next);
                  setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
                }}
              >
                <ThumbsUp color={liked ? GAME.gold : GAME.textMuted} size={18} fill={liked ? GAME.gold : "transparent"} />
                <Text style={styles.socialCount}>{likeCount}</Text>
              </Pressable>
              <Pressable
                style={styles.socialBtn}
                onPress={() => Share.share({ message: `Découvre ${cat.name} sur CatDex !` })}
              >
                <Share2 color={GAME.sky} size={18} />
                <Text style={styles.socialLabel}>Partager</Text>
              </Pressable>
              <View style={styles.socialBtn}>
                <MessageCircle color={GAME.purple} size={18} />
                <Text style={styles.socialCount}>{comments.length}</Text>
              </View>
            </View>
            <Text style={styles.localSocialHint}>
              Likes et commentaires sont privés sur cet appareil pendant la bêta sociale.
            </Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).springify()}>
            <GlassCard>
            <SectionLabel>Commentaires</SectionLabel>
            <View style={styles.commentInputRow}>
              <GameTextField
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Ajouter un commentaire..."
                style={styles.commentField}
              />
              <Pressable
                style={styles.commentSend}
                onPress={() => {
                  if (!commentText.trim()) return;
                  const list = gameplayService.addComment(cat.id, commentAuthor, commentText.trim());
                  setComments(list);
                  setCommentText("");
                }}
              >
                <Text style={styles.commentSendText}>OK</Text>
              </Pressable>
            </View>
            {comments.slice(0, 5).map((c) => (
              <View key={c.id} style={styles.comment}>
                <Text style={styles.commentUser}>{c.user}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
                <Text style={styles.commentDate}>{c.date}</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {cat.gallery.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <SectionLabel>Galerie</SectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gallery}
            >
              {cat.gallery.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.galleryImg} />
              ))}
            </ScrollView>
          </Animated.View>
        ) : null}

        {cat.observations.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(450).springify()}>
            <SectionLabel>Historique d'observations</SectionLabel>
            <View style={styles.obsList}>
              {cat.observations.map((obs) => (
                <GlassCard key={obs.date} style={styles.obsCard}>
                  <View style={styles.obsHeader}>
                    <Text style={styles.obsDate}>{obs.date}</Text>
                    <Text style={styles.obsWeather}>{obs.weather}</Text>
                  </View>
                  <Text style={styles.obsNote}>{obs.note}</Text>
                </GlassCard>
              ))}
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + GAME.space.md }]}>
        <FloatingButton
          label={cat.discovered ? "Voir sur la carte" : "Suivre la piste"}
          variant="glass"
          icon={MapPin}
          onPress={focusOnMap}
        />
        {!cat.discovered ? (
          <FloatingButton
            label="Capturer ce chat"
            onPress={() => router.push("/capture")}
            style={styles.footerCapture}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GAME.navy },
  hero: { width, height: 340, position: "absolute", top: 0 },
  heroOverlay: { width, height: 340, position: "absolute", top: 0 },
  backBtn: {
    position: "absolute",
    left: GAME.space.md,
    zIndex: 10,
  },
  favBtn: {
    position: "absolute",
    right: GAME.space.md,
    zIndex: 10,
  },
  scroll: { flex: 1, marginTop: 260 },
  content: { paddingHorizontal: GAME.space.lg, gap: GAME.space.lg },
  avatarWrap: { alignItems: "center", marginTop: -36 },
  collectibleFrame: {
    padding: 3,
    borderRadius: GAME.radius.xl,
    ...StyleSheet.flatten({ shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }),
  },
  collectibleInner: {
    backgroundColor: GAME.navy,
    borderRadius: GAME.radius.xl - 2,
    padding: GAME.space.sm,
  },
  header: { alignItems: "center", gap: GAME.space.xs },
  rarityBadge: {
    paddingHorizontal: GAME.space.md,
    paddingVertical: 4,
    borderRadius: GAME.radius.full,
    borderWidth: 1,
  },
  rarityText: { fontWeight: "900", fontSize: GAME.type.caption, textTransform: "capitalize" },
  name: { ...TEXT.hero, textAlign: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  zone: { color: GAME.textMuted, fontWeight: "700", fontSize: GAME.type.body },
  dot: { color: GAME.textDim },
  mood: { color: GAME.sky, fontWeight: "700", fontSize: GAME.type.body, textTransform: "capitalize" },
  desc: { ...TEXT.body, lineHeight: 24 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.sm, marginTop: GAME.space.md },
  stats: { gap: GAME.space.md, marginTop: GAME.space.sm },
  socialRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  socialBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  socialCount: { color: GAME.text, fontWeight: "800" },
  socialLabel: { color: GAME.textMuted, fontWeight: "700", fontSize: GAME.type.caption },
  localSocialHint: { ...TEXT.micro, textAlign: "center", marginTop: GAME.space.md, color: GAME.textMuted },
  commentInputRow: { flexDirection: "row", gap: GAME.space.sm, marginTop: GAME.space.sm, marginBottom: GAME.space.md },
  commentField: { flex: 1, marginBottom: 0 },
  commentSend: {
    backgroundColor: GAME.sky,
    borderRadius: GAME.radius.sm,
    paddingHorizontal: GAME.space.md,
    justifyContent: "center",
  },
  commentSendText: { color: GAME.navy, fontWeight: "900" },
  comment: { marginBottom: GAME.space.sm, paddingBottom: GAME.space.sm, borderBottomWidth: 1, borderBottomColor: GAME.glassBorder },
  commentUser: { color: GAME.sky, fontWeight: "800", fontSize: GAME.type.caption },
  commentText: { color: GAME.text, marginTop: 2 },
  commentDate: { color: GAME.textDim, fontSize: 11, marginTop: 2 },
  gallery: { gap: GAME.space.sm },
  galleryImg: {
    width: 140,
    height: 140,
    borderRadius: GAME.radius.md,
    borderWidth: 2,
    borderColor: GAME.glassBorder,
  },
  obsList: { gap: GAME.space.sm },
  obsCard: { gap: GAME.space.xs },
  obsHeader: { flexDirection: "row", justifyContent: "space-between" },
  obsDate: { color: GAME.text, fontWeight: "800", fontSize: GAME.type.caption },
  obsWeather: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "600" },
  obsNote: { color: GAME.textMuted, fontSize: GAME.type.body, lineHeight: 22 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: GAME.space.lg,
    paddingTop: GAME.space.md,
    backgroundColor: "rgba(13,27,42,0.95)",
    borderTopWidth: 1,
    borderTopColor: GAME.glassBorder,
    gap: GAME.space.sm,
  },
  footerCapture: { alignSelf: "center" },
});
