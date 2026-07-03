export type BadgeDefinition = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  metric: BadgeMetric;
  target: number;
};

export type BadgeMetric =
  | "total_discoveries"
  | "total_photos"
  | "total_zones"
  | "night_discoveries"
  | "streak_days"
  | "cats_100"
  | "cats_500"
  | "cats_1000";

export const GAME_BADGES: BadgeDefinition[] = [
  { id: "explorer", title: "Explorateur", description: "Visite 5 quartiers différents", emoji: "🗺️", metric: "total_zones", target: 5 },
  { id: "photographer", title: "Photographe", description: "Prends 25 photos de chats", emoji: "📸", metric: "total_photos", target: 25 },
  { id: "collector", title: "Collectionneur", description: "Découvre 20 chats uniques", emoji: "📚", metric: "total_discoveries", target: 20 },
  { id: "night_explorer", title: "Night Explorer", description: "Observe un chat après minuit", emoji: "🌙", metric: "night_discoveries", target: 1 },
  { id: "cats_100", title: "100 Chats", description: "Documente 100 chats", emoji: "💯", metric: "cats_100", target: 100 },
  { id: "cats_500", title: "500 Chats", description: "Documente 500 chats", emoji: "🏆", metric: "cats_500", target: 500 },
  { id: "cats_1000", title: "1000 Chats", description: "Documente 1000 chats", emoji: "👑", metric: "cats_1000", target: 1000 },
  { id: "streak_7", title: "Série de feu", description: "7 jours d'affilée", emoji: "🔥", metric: "streak_days", target: 7 },
];

export const LEVEL_UNLOCKS: Record<number, { frames: string[]; backgrounds: string[] }> = {
  3: { frames: ["bronze"], backgrounds: [] },
  5: { frames: ["silver"], backgrounds: ["sunset"] },
  8: { frames: ["gold"], backgrounds: ["neon"] },
  12: { frames: ["legendary"], backgrounds: ["aurora"] },
  15: { frames: ["mythic"], backgrounds: ["cosmic"] },
};
