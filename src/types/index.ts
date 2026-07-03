export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'

export type Zone = 'jardin' | 'rue' | 'parc' | 'toit' | 'café'

export interface CatSpecies {
  id: string
  name: string
  emoji: string
  rarity: Rarity
  zone: Zone
  description: string
  trait: string
}

export interface CatCatch {
  speciesId: string
  caughtAt: number
  isShiny: boolean
  isFirstOfDay?: boolean
}

export interface Quest {
  id: string
  title: string
  description: string
  icon: string
  target: number
  progress: number
  reward: { xp: number; treats: number }
  type: 'catch' | 'explore' | 'streak' | 'rare' | 'zone'
  completed: boolean
  claimed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: number
  secret?: boolean
}

export interface ExploreSpot {
  id: string
  zone: Zone
  speciesId: string
  isShiny: boolean
  expiresAt: number
  isRare: boolean
}

export interface Chest {
  id: string
  type: 'wooden' | 'silver' | 'gold' | 'legendary'
  readyAt: number
  opened: boolean
}

export interface DailyGoal {
  target: 1 | 3 | 5
  label: string
}

export type Screen = 'home' | 'explore' | 'dex' | 'quests' | 'profile' | 'capture'

export interface RewardEvent {
  id: string
  type: 'xp' | 'treats' | 'chest' | 'streak' | 'achievement' | 'levelup' | 'shiny'
  title: string
  amount?: number
  emoji: string
}

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; xp: number; chance: number }> = {
  common: { label: 'Commun', color: '#95D5B2', xp: 25, chance: 0.45 },
  uncommon: { label: 'Peu commun', color: '#4ECDC4', xp: 50, chance: 0.30 },
  rare: { label: 'Rare', color: '#B8A9C9', xp: 100, chance: 0.15 },
  legendary: { label: 'Légendaire', color: '#FFB347', xp: 250, chance: 0.08 },
  mythic: { label: 'Mythique', color: '#FF6B6B', xp: 500, chance: 0.02 },
}

export const ZONE_CONFIG: Record<Zone, { label: string; emoji: string; color: string }> = {
  jardin: { label: 'Jardin', emoji: '🌿', color: '#95D5B2' },
  rue: { label: 'Rue', emoji: '🏘️', color: '#4ECDC4' },
  parc: { label: 'Parc', emoji: '🌳', color: '#7CB342' },
  toit: { label: 'Toit', emoji: '🏠', color: '#FFB347' },
  café: { label: 'Café', emoji: '☕', color: '#B8A9C9' },
}

export const DAILY_GOALS: DailyGoal[] = [
  { target: 1, label: 'Tranquille' },
  { target: 3, label: 'Régulier' },
  { target: 5, label: 'Passionné' },
]

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365]

export const LEVEL_XP = (level: number) => Math.floor(100 * Math.pow(1.15, level - 1))
