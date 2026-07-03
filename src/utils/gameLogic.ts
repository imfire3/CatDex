import type { Rarity } from '../types'
import { RARITY_CONFIG } from '../types'
import { CAT_SPECIES } from '../data/cats'

const SHINY_CHANCE = 0.05
const PITY_THRESHOLD = 8

export function rollRarity(pityCounter: number): Rarity {
  if (pityCounter >= PITY_THRESHOLD) {
    const rarePlus = ['rare', 'legendary', 'mythic'] as Rarity[]
    const weights = [0.6, 0.3, 0.1]
    const roll = Math.random()
    let cumulative = 0
    for (let i = 0; i < rarePlus.length; i++) {
      cumulative += weights[i]
      if (roll < cumulative) return rarePlus[i]
    }
    return 'rare'
  }

  const roll = Math.random()
  let cumulative = 0
  const rarities = Object.keys(RARITY_CONFIG) as Rarity[]
  for (const rarity of rarities) {
    cumulative += RARITY_CONFIG[rarity].chance
    if (roll < cumulative) return rarity
  }
  return 'common'
}

export function pickSpeciesForRarity(rarity: Rarity, zone?: string) {
  let pool = CAT_SPECIES.filter(c => c.rarity === rarity)
  if (zone) {
    const zonePool = pool.filter(c => c.zone === zone)
    if (zonePool.length > 0) pool = zonePool
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export function rollShiny(): boolean {
  return Math.random() < SHINY_CHANCE
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function isYesterday(dateKey: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateKey === yesterday.toISOString().split('T')[0]
}

export function isConsecutiveDay(lastDate: string): boolean {
  return isYesterday(lastDate) || lastDate === getTodayKey()
}

export function getDaysSince(dateKey: string): number {
  const last = new Date(dateKey)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  last.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
}

export function getStreakReward(streak: number): { xp: number; treats: number } {
  if (streak >= 100) return { xp: 500, treats: 100 }
  if (streak >= 30) return { xp: 200, treats: 50 }
  if (streak >= 7) return { xp: 100, treats: 25 }
  if (streak >= 3) return { xp: 50, treats: 10 }
  return { xp: 25, treats: 5 }
}

export function getWelcomeBackBonus(daysAway: number): { xp: number; treats: number; luckyHour: boolean } {
  if (daysAway >= 7) return { xp: 300, treats: 50, luckyHour: true }
  if (daysAway >= 3) return { xp: 150, treats: 25, luckyHour: true }
  if (daysAway >= 2) return { xp: 75, treats: 15, luckyHour: false }
  return { xp: 0, treats: 0, luckyHour: false }
}

export function getCatchXp(rarity: Rarity, isShiny: boolean, isNew: boolean, luckyHour: boolean): number {
  let xp = RARITY_CONFIG[rarity].xp
  if (isShiny) xp *= 2
  if (isNew) xp = Math.floor(xp * 1.5)
  if (luckyHour) xp *= 2
  return xp
}

export function getDuplicateTreats(rarity: Rarity): number {
  const base: Record<Rarity, number> = {
    common: 2,
    uncommon: 5,
    rare: 10,
    legendary: 25,
    mythic: 50,
  }
  return base[rarity]
}

export function getChestReadyTime(type: string): number {
  const hours: Record<string, number> = {
    wooden: 0,
    silver: 1,
    gold: 3,
    legendary: 6,
  }
  return Date.now() + (hours[type] ?? 0) * 60 * 60 * 1000
}

export function getChestRewards(type: string): { xp: number; treats: number } {
  const rewards: Record<string, { xp: number; treats: number }> = {
    wooden: { xp: 50, treats: 15 },
    silver: { xp: 100, treats: 30 },
    gold: { xp: 250, treats: 60 },
    legendary: { xp: 500, treats: 100 },
  }
  return rewards[type] ?? rewards.wooden
}
