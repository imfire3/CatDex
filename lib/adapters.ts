import type { MockCat, MockBadge, MockFriend, MockLeaderboardEntry, CatRarity } from "@/data/mock";
import type {
  Badge,
  Cat,
  Capture,
  Friendship,
  Observation,
  Profile,
  UserBadge,
  Zone,
} from "@/types/database";
import { distanceInMeters, formatZoneLabel } from "@/lib/zones";
import { getModelPreset } from "@/gameplay/models/cat-model-catalog";
import { resolveModelFromAnalysis } from "@/gameplay/models/resolve-model";
import { isPopularCat, isRecentlyObserved } from "@/gameplay/discovery/discovery-rewards";
import type { CatModelId } from "@/gameplay/types";

const MOODS = ["curieux", "dormeur", "joueur", "timide", "majestueux"] as const;

function hashSeed(value: string) {
  return value.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function pickFrom<T extends string>(items: readonly T[], seed: string): T {
  return items[hashSeed(seed) % items.length];
}

function pseudoStats(seed: string) {
  const h = hashSeed(seed);
  return {
    charme: 50 + (h % 50),
    agilité: 40 + ((h * 3) % 60),
    mystère: 30 + ((h * 7) % 70),
    câlinerie: 35 + ((h * 5) % 65),
  };
}

function resolveModelId(cat: Cat): CatModelId {
  if (cat.model_id) return cat.model_id as CatModelId;
  return resolveModelFromAnalysis({
    color: cat.color ?? "gris",
    breed: cat.breed ?? "européen",
    pattern: cat.pattern ?? "uni",
    furLength: (cat.fur_length as "court" | "mi-long" | "long") ?? "court",
  });
}

function resolveRarity(cat: Cat): CatRarity {
  const r = cat.rarity as CatRarity | undefined;
  if (r === "commun" || r === "rare" || r === "légendaire") return r;
  return pickFrom(["commun", "rare", "légendaire"] as const, cat.dedup_key || cat.id);
}

export function toUICat(
  cat: Cat & { zone?: Zone | null },
  opts: {
    discovered: boolean;
    favorite?: boolean;
    gallery?: string[];
    observations?: Observation[];
    sightings?: number;
    likeCount?: number;
    commentCount?: number;
  }
): MockCat {
  const zoneName = cat.zone ? formatZoneLabel(cat.zone) : "Zone inconnue";
  const seed = cat.dedup_key || cat.id;
  const modelId = resolveModelId(cat);
  const preset = getModelPreset(modelId);
  const sightings = opts.sightings ?? cat.sighting_count ?? (opts.discovered ? 12 : 0);

  return {
    id: cat.id,
    name: cat.name,
    breed: cat.breed ?? "Européen",
    color: cat.color ?? "Inconnu",
    pattern: cat.pattern ?? "Uni",
    rarity: resolveRarity(cat),
    mood: pickFrom(MOODS, seed + "mood"),
    zone: zoneName.split(",")[0] ?? zoneName,
    discovered: opts.discovered,
    favorite: opts.favorite ?? false,
    avatar: preset.emoji,
    modelId,
    estimatedAge: (cat.estimated_age as MockCat["estimatedAge"]) ?? undefined,
    furLength: (cat.fur_length as MockCat["furLength"]) ?? undefined,
    isPopular: isPopularCat(sightings),
    recentlyObserved: isRecentlyObserved(cat.last_observed_at),
    likeCount: opts.likeCount ?? 0,
    commentCount: opts.commentCount ?? 0,
    heroImage: cat.photo_url,
    description: `${cat.name} a été repéré dans ${zoneName}. Un chat de rue documenté par la communauté CatDex.`,
    stats: pseudoStats(seed),
    latitude: cat.lat_approx,
    longitude: cat.lng_approx,
    sightings,
    firstSeen: opts.discovered
      ? new Date(cat.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
      : "",
    gallery: opts.gallery ?? (opts.discovered ? [cat.photo_url] : []),
    observations:
      opts.observations?.map((o) => ({
        date: new Date(o.observed_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        note: o.note,
        weather: o.weather ?? "—",
      })) ?? [],
  };
}

export function capturesToUICats(captures: Capture[]): MockCat[] {
  return captures
    .filter((c) => c.cat)
    .map((c) =>
      toUICat(c.cat!, {
        discovered: true,
        gallery: [c.photo_url ?? c.cat!.photo_url].filter(Boolean) as string[],
      })
    );
}

export function filterNearbyCats(
  cats: Cat[],
  lat: number,
  lng: number,
  radiusMeters = 2000
) {
  return cats.filter(
    (cat) => distanceInMeters(lat, lng, cat.lat_approx, cat.lng_approx) <= radiusMeters
  );
}

export function toUIBadge(badge: Badge, userBadge?: UserBadge | null): MockBadge {
  return {
    id: badge.id,
    title: badge.title,
    description: badge.description,
    emoji: badge.emoji,
    unlocked: Boolean(userBadge?.unlocked_at),
    progress: userBadge?.progress,
  };
}

export function toUIFriend(
  profile: Profile,
  captures: number,
  online: boolean
): MockFriend {
  return {
    id: profile.id,
    username: profile.display_name ?? profile.username,
    level: profile.level,
    avatar: profile.avatar_emoji ?? "😺",
    captures,
    online,
  };
}

export function toLeaderboardEntry(
  profile: Profile,
  rank: number,
  isMe?: boolean
): MockLeaderboardEntry {
  return {
    rank,
    username: profile.display_name ?? profile.username,
    avatar: profile.avatar_emoji ?? "😺",
    level: profile.level,
    captures: profile.total_captures,
    xp: profile.xp,
    isMe,
  };
}

export function friendshipToProfile(
  friendship: Friendship & { requester?: Profile; addressee?: Profile },
  currentUserId: string
): Profile | null {
  if (friendship.requester_id === currentUserId) return friendship.addressee ?? null;
  return friendship.requester ?? null;
}
