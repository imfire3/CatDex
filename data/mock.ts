export interface Cat {
  id: string;
  name: string;
  nickname?: string;
  breed: string;
  color: string;
  personality: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  discovered: boolean;
  favorite: boolean;
  imageUrl: string;
  avatarEmoji: string;
  latitude: number;
  longitude: number;
  stats: {
    friendliness: number;
    playfulness: number;
    curiosity: number;
    fluffiness: number;
  };
  gallery: string[];
  observations: Observation[];
  discoveredAt?: string;
  location: string;
}

export interface Observation {
  id: string;
  date: string;
  time: string;
  weather: string;
  mood: string;
  note: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarEmoji: string;
  avatarColor: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalCats: number;
  totalDiscoveries: number;
  streak: number;
  joinedDate: string;
  title: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedAt?: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Friend {
  id: string;
  username: string;
  avatarEmoji: string;
  avatarColor: string;
  level: number;
  discoveries: number;
  online: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatarEmoji: string;
  avatarColor: string;
  discoveries: number;
  level: number;
  isCurrentUser?: boolean;
}

export const AVATAR_OPTIONS = [
  { emoji: '😺', color: '#FF6B4A', label: 'Ginger' },
  { emoji: '😸', color: '#FFD166', label: 'Sunny' },
  { emoji: '😻', color: '#8B5CF6', label: 'Lavender' },
  { emoji: '😼', color: '#10B981', label: 'Mint' },
  { emoji: '🙀', color: '#3B82F6', label: 'Sky' },
  { emoji: '😽', color: '#EC4899', label: 'Rose' },
];

export const MOCK_CATS: Cat[] = [
  {
    id: '1',
    name: 'Moustache',
    nickname: 'The Professor',
    breed: 'British Shorthair',
    color: 'Grey Tabby',
    personality: 'Wise & Observant',
    description:
      'A distinguished gentleman who patrols the café district every morning. Known for his impeccable whiskers and judging stare that somehow feels affectionate.',
    rarity: 'legendary',
    discovered: true,
    favorite: true,
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
    avatarEmoji: '🐱',
    latitude: 48.8566,
    longitude: 2.3522,
    stats: { friendliness: 85, playfulness: 60, curiosity: 90, fluffiness: 95 },
    gallery: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400',
    ],
    observations: [
      { id: 'o1', date: 'Jun 28, 2026', time: '8:15 AM', weather: 'Sunny', mood: 'Content', note: 'Sunbathing on the windowsill, whiskers gleaming.' },
      { id: 'o2', date: 'Jun 25, 2026', time: '6:30 PM', weather: 'Cloudy', mood: 'Playful', note: 'Chased a leaf for twenty minutes straight.' },
    ],
    discoveredAt: 'Mar 12, 2026',
    location: 'Rue des Archives, Paris',
  },
  {
    id: '2',
    name: 'Pixel',
    breed: 'Domestic Shorthair',
    color: 'Black & White',
    personality: 'Energetic Explorer',
    description:
      'A tuxedo cat who treats the neighborhood like an adventure map. Often spotted leaping between garden walls with impossible grace.',
    rarity: 'uncommon',
    discovered: true,
    favorite: false,
    imageUrl: 'https://images.unsplash.com/photo-1513245543132-31f5074b58f5?w=800',
    avatarEmoji: '🐈',
    latitude: 48.8584,
    longitude: 2.3499,
    stats: { friendliness: 70, playfulness: 95, curiosity: 88, fluffiness: 40 },
    gallery: [
      'https://images.unsplash.com/photo-1513245543132-31f5074b58f5?w=400',
      'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400',
    ],
    observations: [
      { id: 'o3', date: 'Jul 1, 2026', time: '11:00 AM', weather: 'Sunny', mood: 'Adventurous', note: 'Vaulted over a fence chasing a butterfly.' },
    ],
    discoveredAt: 'May 3, 2026',
    location: 'Place des Vosges, Paris',
  },
  {
    id: '3',
    name: 'Creampuff',
    breed: 'Persian Mix',
    color: 'Cream',
    personality: 'Gentle & Shy',
    description:
      'A fluffy cloud of a cat who prefers quiet corners. Rewards patient observers with the softest slow-blink in the city.',
    rarity: 'rare',
    discovered: true,
    favorite: true,
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
    avatarEmoji: '😺',
    latitude: 48.8534,
    longitude: 2.3488,
    stats: { friendliness: 60, playfulness: 35, curiosity: 55, fluffiness: 100 },
    gallery: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    ],
    observations: [
      { id: 'o4', date: 'Jun 30, 2026', time: '4:45 PM', weather: 'Overcast', mood: 'Sleepy', note: 'Curled up in a flower pot, barely visible.' },
    ],
    discoveredAt: 'Jun 10, 2026',
    location: 'Jardin du Luxembourg, Paris',
  },
  {
    id: '4',
    name: 'Shadow',
    breed: 'Bombay',
    color: 'Pure Black',
    personality: 'Mysterious Night Owl',
    description: 'Appears only at dusk. Moves like liquid darkness between alleyways.',
    rarity: 'rare',
    discovered: false,
    favorite: false,
    imageUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800',
    avatarEmoji: '🐈‍⬛',
    latitude: 48.8606,
    longitude: 2.3376,
    stats: { friendliness: 40, playfulness: 70, curiosity: 95, fluffiness: 30 },
    gallery: [],
    observations: [],
    location: 'Le Marais, Paris',
  },
  {
    id: '5',
    name: 'Biscuit',
    breed: 'Orange Tabby',
    color: 'Ginger',
    personality: 'Food Motivated',
    description: 'Lives near the bakery. Will pose for treats.',
    rarity: 'common',
    discovered: false,
    favorite: false,
    imageUrl: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800',
    avatarEmoji: '😸',
    latitude: 48.8556,
    longitude: 2.3544,
    stats: { friendliness: 90, playfulness: 75, curiosity: 80, fluffiness: 55 },
    gallery: [],
    observations: [],
    location: 'Rue de Rivoli, Paris',
  },
  {
    id: '6',
    name: 'Luna',
    breed: 'Siamese',
    color: 'Seal Point',
    personality: 'Vocal & Demanding',
    description: 'The queen of the park bench. Expect a full conversation.',
    rarity: 'uncommon',
    discovered: false,
    favorite: false,
    imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800',
    avatarEmoji: '😻',
    latitude: 48.8529,
    longitude: 2.3501,
    stats: { friendliness: 75, playfulness: 80, curiosity: 85, fluffiness: 45 },
    gallery: [],
    observations: [],
    location: 'Île de la Cité, Paris',
  },
];

export const MOCK_USER: UserProfile = {
  id: 'user-1',
  username: 'CatExplorer',
  avatarEmoji: '😺',
  avatarColor: '#FF6B4A',
  level: 12,
  xp: 2840,
  xpToNext: 3500,
  totalCats: 3,
  totalDiscoveries: 47,
  streak: 7,
  joinedDate: 'March 2026',
  title: 'Neighborhood Scout',
};

export const MOCK_BADGES: Badge[] = [
  { id: 'b1', name: 'First Discovery', description: 'Document your very first street cat', emoji: '🎯', earned: true, earnedAt: 'Mar 12, 2026', rarity: 'bronze' },
  { id: 'b2', name: 'Early Bird', description: 'Spot a cat before 7 AM', emoji: '🌅', earned: true, earnedAt: 'Mar 15, 2026', rarity: 'silver' },
  { id: 'b3', name: 'Whisker Whisperer', description: 'Earn trust from 5 different cats', emoji: '🤝', earned: true, earnedAt: 'Apr 2, 2026', rarity: 'gold' },
  { id: 'b4', name: 'Night Prowler', description: 'Discover a cat after midnight', emoji: '🌙', earned: true, earnedAt: 'May 18, 2026', rarity: 'silver' },
  { id: 'b5', name: 'Catographer', description: 'Map 25 unique cat locations', emoji: '🗺️', earned: true, earnedAt: 'Jun 1, 2026', rarity: 'gold' },
  { id: 'b6', name: 'Legend Hunter', description: 'Find a legendary rarity cat', emoji: '👑', earned: true, earnedAt: 'Mar 12, 2026', rarity: 'platinum' },
  { id: 'b7', name: 'Social Butterfly', description: 'Add 10 friends to your network', emoji: '🦋', earned: false, rarity: 'silver' },
  { id: 'b8', name: 'Marathon Walker', description: 'Walk 50km while exploring', emoji: '🏃', earned: false, rarity: 'gold' },
  { id: 'b9', name: 'Perfect Week', description: 'Discover a cat every day for 7 days', emoji: '🔥', earned: true, earnedAt: 'Jul 1, 2026', rarity: 'platinum' },
];

export const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', username: 'WhiskerWitch', avatarEmoji: '😼', avatarColor: '#8B5CF6', level: 15, discoveries: 62, online: true },
  { id: 'f2', username: 'PawPrintPro', avatarEmoji: '😸', avatarColor: '#FFD166', level: 11, discoveries: 38, online: true },
  { id: 'f3', username: 'MeowMaven', avatarEmoji: '😻', avatarColor: '#EC4899', level: 18, discoveries: 89, online: false },
  { id: 'f4', username: 'TabbyTracker', avatarEmoji: '🐱', avatarColor: '#10B981', level: 9, discoveries: 29, online: false },
  { id: 'f5', username: 'FelineFinder', avatarEmoji: '😽', avatarColor: '#3B82F6', level: 14, discoveries: 55, online: true },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: 'l1', username: 'CatQueen92', avatarEmoji: '👑', avatarColor: '#FFD166', discoveries: 156, level: 24 },
  { rank: 2, id: 'l2', username: 'MeowMaven', avatarEmoji: '😻', avatarColor: '#EC4899', discoveries: 89, level: 18 },
  { rank: 3, id: 'l3', username: 'WhiskerWitch', avatarEmoji: '😼', avatarColor: '#8B5CF6', discoveries: 62, level: 15 },
  { rank: 4, id: 'l4', username: 'FelineFinder', avatarEmoji: '😽', avatarColor: '#3B82F6', discoveries: 55, level: 14 },
  { rank: 5, id: 'l5', username: 'CatExplorer', avatarEmoji: '😺', avatarColor: '#FF6B4A', discoveries: 47, level: 12, isCurrentUser: true },
  { rank: 6, id: 'l6', username: 'PawPrintPro', avatarEmoji: '😸', avatarColor: '#FFD166', discoveries: 38, level: 11 },
  { rank: 7, id: 'l7', username: 'TabbyTracker', avatarEmoji: '🐱', avatarColor: '#10B981', discoveries: 29, level: 9 },
];

export const NEW_DISCOVERY_CAT: Cat = {
  id: '7',
  name: 'Marmalade',
  breed: 'Orange Tabby',
  color: 'Marmalade Orange',
  personality: 'Bold & Friendly',
  description:
    'A confident orange cat who claimed this windowsill as his throne. Approached immediately and demanded chin scratches.',
  rarity: 'uncommon',
  discovered: true,
  favorite: false,
  imageUrl: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800',
  avatarEmoji: '😸',
  latitude: 48.8570,
  longitude: 2.3510,
  stats: { friendliness: 92, playfulness: 78, curiosity: 70, fluffiness: 50 },
  gallery: [
    'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400',
  ],
  observations: [],
  discoveredAt: 'Jul 3, 2026',
  location: 'Rue de Bretagne, Paris',
};

export const RARITY_COLORS = {
  common: { bg: '#F3F4F6', text: '#6B7280', label: 'Common' },
  uncommon: { bg: '#D1FAE5', text: '#059669', label: 'Uncommon' },
  rare: { bg: '#EDE9FE', text: '#7C3AED', label: 'Rare' },
  legendary: { bg: '#FEF3C7', text: '#D97706', label: 'Legendary' },
};

export function getCatById(id: string): Cat | undefined {
  if (id === NEW_DISCOVERY_CAT.id) return NEW_DISCOVERY_CAT;
  return MOCK_CATS.find((c) => c.id === id);
}

export function getDiscoveredCats(): Cat[] {
  return MOCK_CATS.filter((c) => c.discovered);
}

export function getUndiscoveredCats(): Cat[] {
  return MOCK_CATS.filter((c) => !c.discovered);
}
