/**
 * CatDex progression — levels, quests, collections, badges.
 * Derived from the local cat collection for the MVP (no remote quest server yet).
 */
import {
  catDexRarityLabel,
  resolveRevealRarity,
  themeFromColorLabel,
} from '@/lib/catTheme';
import type { Cat } from '@/types/cat';

export const MAX_LEVEL = 50;
export const CATDEX_GOAL = 500;

export type QuestTone = 'accent' | 'success' | 'warning' | 'info' | 'danger';

export type QuestItem = {
  id: string;
  title: string;
  description?: string;
  current: number;
  target: number;
  rewardLabel: string;
  completed: boolean;
  tone?: QuestTone;
};

export type CollectionTrack = {
  id: string;
  label: string;
  current: number;
  target: number;
  rewardLabel: string;
  match: (cat: Cat) => boolean;
};

export type VisibleCollection = CollectionTrack & {
  locked: boolean;
  unlockLevel: number;
  unlockHint?: string;
};

export type LockedTeaser = {
  id: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
};

export type LevelDef = {
  level: number;
  title: string;
  goal: string;
  unlock?: string;
  reward?: string;
};

export type ActivityItem = {
  id: string;
  when: 'Aujourd’hui' | 'Hier' | 'Demain' | 'Cette semaine';
  title: string;
  subtitle: string;
};

export type SuccessItem = {
  id: string;
  title: string;
  subtitle: string;
};

export type ProfileBadge = {
  id: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
};

/** XP earned from a single capture (same weights as estimateTotalXp). */
export function xpForCat(cat: Cat): number {
  let xp = 85;
  const rarity = resolveRevealRarity(cat.analysis, cat.number);
  if (rarity === 'uncommon') xp += 25;
  if (rarity === 'rare') xp += 50;
  if (rarity === 'exceptional') xp += 100;
  xp += Math.min(40, (cat.views ?? 0) * 2);
  return xp;
}

export function estimateTotalXp(cats: Cat[]): number {
  let xp = 0;
  for (const cat of cats) {
    xp += xpForCat(cat);
  }
  return xp;
}

function dayKey(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** XP from captures discovered today. */
export function xpEarnedToday(cats: Cat[]): number {
  const today = todayKey();
  return cats
    .filter((cat) => dayKey(cat.discoveredAt) === today)
    .reduce((sum, cat) => sum + xpForCat(cat), 0);
}

/**
 * Fixed badge showcase for the profile — always show slots (locked or not).
 * 4 slots max on profile: Premier chat · 10 chats · Explorateur · Naturaliste
 */
export function buildProfileBadges(
  cats: Cat[],
  level: number,
  _streakDays: number,
): ProfileBadge[] {
  const hasFirst = cats.length >= 1;
  return [
    {
      id: 'premier-chat',
      title: 'Premier chat',
      subtitle: hasFirst ? cats[0]?.name ?? 'Débloqué' : 'Ta première découverte t’attend',
      unlocked: hasFirst,
    },
    {
      id: 'dix-chats',
      title: '10 chats',
      subtitle: cats.length >= 10 ? `${cats.length} captures` : 'Encore un peu de route…',
      unlocked: cats.length >= 10,
    },
    {
      id: 'explorateur',
      title: 'Explorateur',
      subtitle: level >= 3 || cats.length >= 3 ? 'Débloqué' : 'Le quartier t’appelle',
      unlocked: level >= 3 || cats.length >= 3,
    },
    {
      id: 'naturaliste',
      title: 'Naturaliste',
      subtitle: uniqueColors(cats) >= 5 ? '5 couleurs' : 'Les couleurs s’éveillent',
      unlocked: uniqueColors(cats) >= 5 || level >= 7,
    },
  ];
}

export function countUnlockedBadges(
  cats: Cat[],
  level: number,
  streakDays: number,
): number {
  return buildProfileBadges(cats, level, streakDays).filter((b) => b.unlocked).length;
}
export const LEVEL_DEFS: LevelDef[] = [
  {
    level: 1,
    title: 'Bienvenue',
    goal: 'Ton aventure commence avec une première découverte.',
    reward: 'Cadre débutant',
  },
  {
    level: 2,
    title: 'Découvreur',
    goal: 'Trois chats croisent déjà ton chemin.',
    unlock: 'Favoris',
  },
  {
    level: 3,
    title: 'Curieux',
    goal: 'Deux races différentes pour élargir ton regard.',
  },
  {
    level: 4,
    title: 'Promeneur',
    goal: 'Trois lieux, une carte qui s’ouvre.',
  },
  {
    level: 5,
    title: 'Photographe',
    goal: 'Dix découvertes — ton œil s’affine.',
    unlock: 'Collections rares',
  },
  {
    level: 6,
    title: 'Collectionneur',
    goal: 'Dix chats dans ton CatDex.',
  },
  {
    level: 7,
    title: 'Naturaliste',
    goal: 'Cinq couleurs pour peindre le quartier.',
  },
  {
    level: 8,
    title: 'Explorateur urbain',
    goal: 'Cinq quartiers à explorer.',
  },
  {
    level: 9,
    title: 'Premier badge',
    goal: 'Un badge pour marquer le coup.',
  },
  {
    level: 10,
    title: 'Chasseur de chats',
    goal: 'Vingt chats — la légende commence.',
    unlock: 'Animation de capture',
  },
];

const MILESTONE_REWARDS: Record<number, string> = {
  5: 'Favoris',
  10: 'Animation de capture',
  15: 'Nouvel avatar',
  20: 'Nouveau fond',
  25: 'Cadre exclusif',
  30: 'Confettis de niveau',
  35: 'Pose spéciale',
  40: 'Icône de profil',
  45: 'Badge Légende',
  50: 'Titre Maître CatDex',
};

/** XP required to clear a given level (into the next). Scales gently to ~50. */
export function xpRequiredForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, level));
  return 80 + clamped * 40 + Math.floor(clamped / 5) * 60;
}

export function progressionFromTotalXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpMax: number;
  title: string;
  nextReward: string;
} {
  let remaining = Math.max(0, totalXp);
  let level = 1;

  while (level < MAX_LEVEL) {
    const need = xpRequiredForLevel(level);
    if (remaining < need) {
      break;
    }
    remaining -= need;
    level += 1;
  }

  const xpMax = xpRequiredForLevel(level);
  const def = LEVEL_DEFS.find((item) => item.level === level);
  const title = def?.title ?? (level >= 40 ? 'Légende urbaine' : level >= 20 ? 'Chasseur' : 'Explorateur');

  const nextMilestone = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].find((n) => n > level) ?? MAX_LEVEL;
  const nextReward =
    MILESTONE_REWARDS[nextMilestone] ??
    LEVEL_DEFS.find((item) => item.level === level + 1)?.reward ??
    'Une surprise t’attend';

  return {
    level,
    xpIntoLevel: level >= MAX_LEVEL ? xpMax : remaining,
    xpMax,
    title,
    nextReward,
  };
}

function placeKey(cat: Cat): string {
  return `${cat.latitude.toFixed(3)}:${cat.longitude.toFixed(3)}`;
}

export function uniquePlaces(cats: Cat[]): number {
  return new Set(cats.map(placeKey)).size;
}

export function uniqueColors(cats: Cat[]): number {
  return new Set(
    cats.map((cat) => themeFromColorLabel(cat.analysis.color, cat.number).key),
  ).size;
}

export function uniqueBreeds(cats: Cat[]): number {
  return new Set(
    cats
      .map((cat) => (cat.analysis.breed ?? '').trim().toLowerCase())
      .filter(Boolean),
  ).size;
}

function colorMatch(needle: string) {
  return (cat: Cat) => {
    const color = (cat.analysis.color ?? '').toLowerCase();
    const coat = (cat.analysis.coat ?? '').toLowerCase();
    const breed = (cat.analysis.breed ?? '').toLowerCase();
    const theme = themeFromColorLabel(cat.analysis.color, cat.number).key;
    return (
      color.includes(needle) ||
      coat.includes(needle) ||
      breed.includes(needle) ||
      theme.includes(needle)
    );
  };
}

export const COLLECTION_TRACKS: Omit<CollectionTrack, 'current'>[] = [
  {
    id: 'black',
    label: 'Chats noirs',
    target: 8,
    rewardLabel: '+120 XP · Titre Ombre',
    match: colorMatch('noir'),
  },
  {
    id: 'white',
    label: 'Chats blancs',
    target: 8,
    rewardLabel: '+120 XP · Cadre Neige',
    match: colorMatch('blanc'),
  },
  {
    id: 'tabby',
    label: 'Tigrés',
    target: 10,
    rewardLabel: '+150 XP · Badge Tigré',
    match: (cat) => colorMatch('tigré')(cat) || colorMatch('tabby')(cat),
  },
  {
    id: 'roux',
    label: 'Chats roux',
    target: 12,
    rewardLabel: '+200 XP · Cadre exclusif',
    match: (cat) => colorMatch('roux')(cat) || colorMatch('orange')(cat),
  },
  {
    id: 'calico',
    label: 'Tricolores',
    target: 6,
    rewardLabel: '+180 XP · Badge Écaille',
    match: (cat) =>
      colorMatch('tricolore')(cat) || colorMatch('écaille')(cat) || colorMatch('calico')(cat),
  },
  {
    id: 'siamese',
    label: 'Siamois',
    target: 5,
    rewardLabel: '+160 XP · Titre Siamois',
    match: (cat) => colorMatch('siamois')(cat) || (cat.analysis.breed ?? '').toLowerCase().includes('siamois'),
  },
  {
    id: 'maine',
    label: 'Maine Coon',
    target: 4,
    rewardLabel: '+200 XP · Cadre Majestueux',
    match: (cat) => (cat.analysis.breed ?? '').toLowerCase().includes('maine'),
  },
  {
    id: 'bengal',
    label: 'Bengal',
    target: 4,
    rewardLabel: '+220 XP · Badge Sauvage',
    match: (cat) =>
      (cat.analysis.breed ?? '').toLowerCase().includes('bengal') ||
      colorMatch('bengal')(cat),
  },
];

export function buildCollections(cats: Cat[]): CollectionTrack[] {
  return COLLECTION_TRACKS.map((track) => {
    const current = cats.filter(track.match).length;
    return { ...track, current: Math.min(current, track.target) };
  });
}

/** Preview tracks for Missions hub: Roux always open; Noirs L2+; Tigrés L3+. */
const PREVIEW_COLLECTION_IDS = ['roux', 'black', 'tabby'] as const;

export function buildVisibleCollections(
  cats: Cat[],
  level: number,
): VisibleCollection[] {
  const byId = new Map(buildCollections(cats).map((t) => [t.id, t]));
  const rules: Record<(typeof PREVIEW_COLLECTION_IDS)[number], { minLevel: number; hint: string }> =
    {
      roux: { minLevel: 1, hint: '' },
      black: {
        minLevel: 2,
        hint: 'Continue ton aventure pour révéler cette collection.',
      },
      tabby: {
        minLevel: 3,
        hint: 'Continue ton aventure pour révéler cette collection.',
      },
    };

  return PREVIEW_COLLECTION_IDS.map((id) => {
    const track = byId.get(id);
    const rule = rules[id];
    const locked = level < rule.minLevel;
    return {
      id,
      label: track?.label ?? id,
      current: locked ? 0 : (track?.current ?? 0),
      target: track?.target ?? 8,
      rewardLabel: track?.rewardLabel ?? '',
      match: track?.match ?? (() => false),
      locked,
      unlockLevel: rule.minLevel,
      unlockHint: locked ? rule.hint : undefined,
    };
  });
}

export function buildLockedTeasers(
  level: number,
  catsCount: number,
): LockedTeaser[] {
  // Max 4 teasers — blur creates desire; reveal one by one as the player grows.
  return [
    {
      id: 'teaser-rares',
      title: 'Collections rares',
      subtitle:
        level >= 5
          ? 'Bientôt à portée de main…'
          : 'Continue ton aventure pour révéler cette collection.',
      unlocked: level >= 5,
    },
    {
      id: 'teaser-legendaires',
      title: 'Chats légendaires',
      subtitle:
        catsCount >= 100
          ? 'Bientôt à portée de main…'
          : 'Continue ton aventure pour révéler cette collection.',
      unlocked: catsCount >= 100,
    },
    {
      id: 'teaser-europeens',
      title: 'Collection Européens',
      subtitle:
        catsCount >= 20
          ? 'Bientôt à portée de main…'
          : 'Continue ton aventure pour révéler cette collection.',
      unlocked: catsCount >= 20,
    },
    {
      id: 'teaser-events',
      title: 'Événements',
      subtitle: 'Continue ton aventure — quelque chose se prépare.',
      unlocked: false,
    },
  ];
}

export function nextLevelReward(level: number): {
  nextLevel: number;
  label: string;
  goal?: string;
} {
  const nextLevel = Math.min(MAX_LEVEL, level + 1);
  const def = LEVEL_DEFS.find((item) => item.level === nextLevel);
  const milestone = MILESTONE_REWARDS[nextLevel];
  const label =
    def?.unlock ??
    def?.reward ??
    milestone ??
    def?.goal ??
    'Une surprise t’attend';
  return {
    nextLevel,
    label,
    goal: def?.goal,
  };
}

export function buildDailyQuests(cats: Cat[]): QuestItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCats = cats.filter((cat) => new Date(cat.discoveredAt) >= today);
  const placesToday = uniquePlaces(todayCats);
  const likesToday = todayCats.reduce((sum, cat) => sum + (cat.views ?? 0), 0);

  // Max 3 daily quests — dopamine, not a checklist.
  return [
    {
      id: 'daily-scan',
      title: 'Capture un chat',
      current: Math.min(1, todayCats.length),
      target: 1,
      rewardLabel: '+20 XP',
      completed: todayCats.length >= 1,
      tone: 'accent',
    },
    {
      id: 'daily-place',
      title: 'Découvre un nouvel endroit',
      current: Math.min(1, placesToday),
      target: 1,
      rewardLabel: '+30 XP',
      completed: placesToday >= 1,
      tone: 'info',
    },
    {
      id: 'daily-likes',
      title: 'Aime un chat',
      current: Math.min(1, likesToday > 0 ? 1 : 0),
      target: 1,
      rewardLabel: '+15 XP',
      completed: likesToday > 0,
      tone: 'danger',
    },
  ];
}

export function buildWeeklyQuest(cats: Cat[]): QuestItem {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekCats = cats.filter((cat) => new Date(cat.discoveredAt).getTime() >= weekAgo);
  const places = uniquePlaces(weekCats);
  const target = 5;
  return {
    id: 'weekly-places',
    title: 'Explorer 5 nouveaux lieux',
    description: 'Un objectif plus ambitieux. Tu as toute la semaine.',
    current: Math.min(places, target),
    target,
    rewardLabel: '250 XP',
    completed: places >= target,
    tone: 'accent',
  };
}

export function buildMonthlyQuest(cats: Cat[]): QuestItem {
  const target = 12;
  const current = cats.filter(
    (cat) => colorMatch('roux')(cat) || colorMatch('orange')(cat),
  ).length;
  return {
    id: 'monthly-roux',
    title: 'Compléter la collection Roux',
    description: 'Défi mensuel · Tous les chats roux',
    current: Math.min(current, target),
    target,
    rewardLabel: 'Badge + Cadre exclusif',
    completed: current >= target,
    tone: 'warning',
  };
}

export function buildSpecialMission(cats: Cat[]): QuestItem {
  const hasRoux = cats.some((cat) => colorMatch('roux')(cat) || colorMatch('orange')(cat));
  return {
    id: 'special-summer',
    title: 'Événement été',
    description: 'Découvre un chat roux',
    current: hasRoux ? 1 : 0,
    target: 1,
    rewardLabel: 'Badge exclusif',
    completed: hasRoux,
    tone: 'danger',
  };
}

export function buildRecentSuccesses(cats: Cat[], level: number): SuccessItem[] {
  const items: SuccessItem[] = [];
  const black = cats.find((cat) => colorMatch('noir')(cat));
  if (black) {
    items.push({
      id: 'success-black',
      title: 'Premier chat noir',
      subtitle: black.name,
    });
  }
  if (level >= 3 || cats.length >= 3) {
    items.push({
      id: 'success-explorer',
      title: 'Badge Explorateur',
      subtitle: 'Débloqué',
    });
  }
  if (level >= 10) {
    items.push({
      id: 'success-level-10',
      title: 'Niveau 10 atteint',
      subtitle: 'Chasseur de chats',
    });
  } else if (cats.length > 0) {
    items.push({
      id: 'success-first',
      title: 'Première capture',
      subtitle: cats[0]?.name ?? 'CatDex',
    });
  }
  return items.slice(0, 3);
}

export function buildRecentActivity(cats: Cat[], level: number): ActivityItem[] {
  // Profile: 2 lines max — short & inviting.
  if (cats.length === 0) {
    return [
      {
        id: 'act-welcome',
        when: 'Aujourd’hui',
        title: 'Aucune découverte pour le moment.',
        subtitle: 'Va capturer ton premier chat.',
      },
      {
        id: 'act-tomorrow',
        when: 'Demain',
        title: 'Ton premier chat ?',
        subtitle: 'L’aventure n’attend que toi.',
      },
    ];
  }

  const sorted = [...cats].sort(
    (a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime(),
  );
  const latest = sorted[0]!;
  return [
    {
      id: `act-${latest.id}`,
      when: 'Aujourd’hui',
      title: `Découverte · ${latest.name}`,
      subtitle: `+${xpForCat(latest)} XP`,
    },
    {
      id: 'act-next',
      when: 'Demain',
      title: level < MAX_LEVEL ? `En route vers le niveau ${level + 1}` : 'Légende du quartier',
      subtitle: 'La suite t’attend dehors.',
    },
  ];
}

export function streakEstimate(cats: Cat[]): number {
  if (cats.length === 0) return 0;
  const days = new Set(
    cats.map((cat) => new Date(cat.discoveredAt).toISOString().slice(0, 10)),
  );
  return Math.min(30, Math.max(1, days.size));
}

export function formatShortDate(iso: string): string {
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

export function locationLabel(cat: Cat): string {
  // MVP — no reverse geocode yet
  return 'Marseille';
}

export function favoriteCat(cats: Cat[]): Cat | null {
  if (cats.length === 0) return null;
  return [...cats].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0] ?? cats[0];
}
