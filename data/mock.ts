export type CatRarity = "commun" | "rare" | "légendaire";
export type CatMood = "curieux" | "dormeur" | "joueur" | "timide" | "majestueux";

import type { CatModelId, EstimatedAge, FurLength } from "@/gameplay/types";

export type MockCat = {
  id: string;
  name: string;
  breed: string;
  color: string;
  pattern: string;
  rarity: CatRarity;
  mood: CatMood;
  zone: string;
  discovered: boolean;
  favorite: boolean;
  avatar: string;
  modelId: CatModelId;
  estimatedAge?: EstimatedAge;
  furLength?: FurLength;
  isPopular: boolean;
  recentlyObserved: boolean;
  likeCount: number;
  commentCount: number;
  heroImage: string;
  description: string;
  stats: { charme: number; agilité: number; mystère: number; câlinerie: number };
  latitude: number;
  longitude: number;
  sightings: number;
  firstSeen: string;
  gallery: string[];
  observations: { date: string; note: string; weather: string }[];
};

export type MockBadge = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress?: number;
};

export type MockFriend = {
  id: string;
  username: string;
  level: number;
  avatar: string;
  captures: number;
  online: boolean;
};

export type MockLeaderboardEntry = {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  captures: number;
  xp: number;
  isMe?: boolean;
};

export const MOCK_USER = {
  username: "ChasseurFélin",
  avatar: "🧢",
  level: 12,
  xp: 2840,
  xpToNext: 3200,
  totalCaptures: 47,
  uniqueCats: 23,
  zonesExplored: 8,
  streak: 5,
};

export const AVATAR_OPTIONS = ["🧢", "🎩", "🧣", "😺", "🐾", "⭐", "🌙", "🔥", "💎", "🎒", "🕶️", "🌸"];

const MOCK_GAMEPLAY: Record<string, Partial<MockCat>> = {
  "1": { modelId: "tabby_short", estimatedAge: "adulte", furLength: "court", isPopular: true, recentlyObserved: true, likeCount: 42, commentCount: 8 },
  "2": { modelId: "gray_long", estimatedAge: "senior", furLength: "long", isPopular: true, recentlyObserved: false, likeCount: 18, commentCount: 3 },
  "3": { modelId: "siamese_short", estimatedAge: "jeune", furLength: "court", isPopular: false, recentlyObserved: false, likeCount: 0, commentCount: 0 },
  "4": { modelId: "white_short", estimatedAge: "adulte", furLength: "mi-long", isPopular: false, recentlyObserved: false, likeCount: 0, commentCount: 0 },
  "5": { modelId: "black_short", estimatedAge: "jeune", furLength: "court", isPopular: false, recentlyObserved: true, likeCount: 12, commentCount: 2 },
};

function enrichMockCat(cat: Omit<MockCat, "modelId" | "isPopular" | "recentlyObserved" | "likeCount" | "commentCount"> & Partial<MockCat>): MockCat {
  const extra = MOCK_GAMEPLAY[cat.id] ?? {};
  return {
    modelId: "tabby_short",
    isPopular: (cat.sightings ?? 0) >= 20,
    recentlyObserved: false,
    likeCount: 0,
    commentCount: 0,
    ...cat,
    ...extra,
  };
}

export const MOCK_CATS: MockCat[] = [
  enrichMockCat({
    id: "1",
    name: "Moustache",
    breed: "Européen",
    color: "Gris tigré",
    pattern: "Rayures",
    rarity: "légendaire",
    mood: "majestueux",
    zone: "Le Marais",
    discovered: true,
    favorite: true,
    avatar: "😺",
    heroImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    description:
      "Le gardien du quartier. Moustache observe chaque passant depuis sa fenêtre préférée depuis des années.",
    stats: { charme: 95, agilité: 72, mystère: 88, câlinerie: 60 },
    latitude: 48.8568,
    longitude: 2.3622,
    sightings: 142,
    firstSeen: "12 mars 2025",
    gallery: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
    ],
    observations: [
      { date: "2 juil. 2026", note: "Était au soleil sur le rebord de fenêtre.", weather: "Ensoleillé" },
      { date: "28 juin 2026", note: "A salué discrètement les passants.", weather: "Nuageux" },
    ],
  }),
  enrichMockCat({
    id: "2",
    name: "Pistache",
    breed: "Chartreux",
    color: "Bleu-gris",
    pattern: "Uni",
    rarity: "rare",
    mood: "dormeur",
    zone: "Bastille",
    discovered: true,
    favorite: false,
    avatar: "😸",
    heroImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
    description: "Expert en siestes publiques. Pistache connaît tous les bancs les plus confortables.",
    stats: { charme: 78, agilité: 45, mystère: 55, câlinerie: 82 },
    latitude: 48.8532,
    longitude: 2.3698,
    sightings: 67,
    firstSeen: "5 avr. 2025",
    gallery: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    ],
    observations: [
      { date: "1 juil. 2026", note: "Dormait sur un coussin de terrasse.", weather: "Chaud" },
    ],
  }),
  enrichMockCat({
    id: "3",
    name: "Croquette",
    breed: "Siamois",
    color: "Crème",
    pattern: "Masque foncé",
    rarity: "rare",
    mood: "curieux",
    zone: "République",
    discovered: false,
    favorite: false,
    avatar: "🐱",
    heroImage: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800",
    description: "Toujours en mission d'exploration. Croquette inspecte chaque recoin du quartier.",
    stats: { charme: 70, agilité: 90, mystère: 65, câlinerie: 40 },
    latitude: 48.8675,
    longitude: 2.3635,
    sightings: 0,
    firstSeen: "",
    gallery: [],
    observations: [],
  }),
  enrichMockCat({
    id: "4",
    name: "Nuage",
    breed: "Persan",
    color: "Blanc",
    pattern: "Fluffy",
    rarity: "commun",
    mood: "timide",
    zone: "Oberkampf",
    discovered: false,
    favorite: false,
    avatar: "😽",
    heroImage: "https://images.unsplash.com/photo-1529770533924-95a859633ad6?w=800",
    description: "Discret et élégant. Nuage apparaît rarement mais laisse une impression durable.",
    stats: { charme: 85, agilité: 30, mystère: 75, câlinerie: 55 },
    latitude: 48.865,
    longitude: 2.378,
    sightings: 0,
    firstSeen: "",
    gallery: [],
    observations: [],
  }),
  enrichMockCat({
    id: "5",
    name: "Zigzag",
    breed: "Européen",
    color: "Noir",
    pattern: "Taches blanches",
    rarity: "commun",
    mood: "joueur",
    zone: "Belleville",
    discovered: true,
    favorite: false,
    avatar: "😼",
    heroImage: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800",
    description: "Le clown du trottoir. Zigzag adore jouer avec les feuilles et surprendre les joggeurs.",
    stats: { charme: 68, agilité: 88, mystère: 42, câlinerie: 70 },
    latitude: 48.872,
    longitude: 2.385,
    sightings: 34,
    firstSeen: "18 mai 2025",
    gallery: ["https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400"],
    observations: [
      { date: "30 juin 2026", note: "Courait après une feuille au vent.", weather: "Venteux" },
    ],
  }),
];

export const MOCK_BADGES: MockBadge[] = [
  { id: "1", title: "Premier Pas", description: "Découvre ton premier chat", emoji: "🐾", unlocked: true },
  { id: "2", title: "Explorateur", description: "Visite 5 zones différentes", emoji: "🗺️", unlocked: true, progress: 100 },
  { id: "3", title: "Collectionneur", description: "Capture 20 chats uniques", emoji: "📚", unlocked: true, progress: 100 },
  { id: "4", title: "Nuit Blanche", description: "Observe un chat après minuit", emoji: "🌙", unlocked: false, progress: 0 },
  { id: "5", title: "Légende Urbaine", description: "Trouve un chat légendaire", emoji: "👑", unlocked: true },
  { id: "6", title: "Ami des Chats", description: "Ajoute 10 chats en favoris", emoji: "💖", unlocked: false, progress: 30 },
  { id: "7", title: "Météo", description: "Observe sous la pluie", emoji: "🌧️", unlocked: false, progress: 0 },
  { id: "8", title: "Social", description: "Ajoute 5 amis", emoji: "🤝", unlocked: false, progress: 60 },
];

export const MOCK_FRIENDS: MockFriend[] = [
  { id: "1", username: "LunaChats", level: 15, avatar: "🌙", captures: 62, online: true },
  { id: "2", username: "FelixHunter", level: 9, avatar: "🔥", captures: 31, online: true },
  { id: "3", username: "MiaouMaster", level: 22, avatar: "⭐", captures: 98, online: false },
  { id: "4", username: "PatteDouce", level: 7, avatar: "🌸", captures: 18, online: false },
  { id: "5", username: "WhiskersPro", level: 18, avatar: "💎", captures: 74, online: true },
];

export const MOCK_LEADERBOARD: MockLeaderboardEntry[] = [
  { rank: 1, username: "MiaouMaster", avatar: "⭐", level: 22, captures: 98, xp: 5200 },
  { rank: 2, username: "WhiskersPro", avatar: "💎", level: 18, captures: 74, xp: 4100 },
  { rank: 3, username: "LunaChats", avatar: "🌙", level: 15, captures: 62, xp: 3500 },
  { rank: 4, username: "ChasseurFélin", avatar: "🧢", level: 12, captures: 47, xp: 2840, isMe: true },
  { rank: 5, username: "FelixHunter", avatar: "🔥", level: 9, captures: 31, xp: 1900 },
  { rank: 6, username: "PatteDouce", avatar: "🌸", level: 7, captures: 18, xp: 1200 },
  { rank: 7, username: "ChatRouge", avatar: "😺", level: 6, captures: 14, xp: 980 },
  { rank: 8, username: "NekoFan", avatar: "🎩", level: 5, captures: 11, xp: 750 },
];

export const ANALYSIS_RESULT = {
  breed: "Européen",
  color: "Gris tigré",
  pattern: "Rayures",
  confidence: 94,
  mood: "curieux" as CatMood,
  traits: ["Oreilles dressées", "Queue touffue", "Regard perçant"],
};

export const MAP_REGION = {
  latitude: 48.8606,
  longitude: 2.368,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};
