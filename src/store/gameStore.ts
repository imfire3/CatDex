import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Screen, CatCatch, Quest, ExploreSpot, Chest, RewardEvent, Zone,
} from '../types'
import { LEVEL_XP } from '../types'
import { CAT_SPECIES } from '../data/cats'
import { ACHIEVEMENTS } from '../data/achievements'
import { generateDailyQuests } from '../data/quests'
import {
  rollRarity, pickSpeciesForRarity, rollShiny, getTodayKey,
  getDaysSince, getStreakReward, getWelcomeBackBonus,
  getCatchXp, getDuplicateTreats, getChestReadyTime, getChestRewards,
} from '../utils/gameLogic'

interface GameState {
  // Navigation
  screen: Screen
  setScreen: (screen: Screen) => void
  captureTarget: ExploreSpot | null
  setCaptureTarget: (spot: ExploreSpot | null) => void

  // Player
  level: number
  xp: number
  treats: number
  streakFreezes: number

  // Streak
  streak: number
  lastPlayDate: string
  streakFreezeUsedToday: boolean
  longestStreak: number

  // Collection
  catches: CatCatch[]
  discoveredSpecies: string[]
  pityCounter: number

  // Daily
  dailyGoal: 1 | 3 | 5
  catsToday: number
  quests: Quest[]
  questsDate: string
  dailyGoalClaimed: boolean
  loginChestClaimed: boolean

  // Weekly
  weeklyProgress: number
  weeklyClaimed: boolean
  weekStart: string

  // Explore
  spots: ExploreSpot[]
  spotsGeneratedAt: number
  exploredSpotIds: string[]
  lureActiveUntil: number

  // Chests
  chests: Chest[]

  // Achievements
  unlockedAchievements: string[]

  // Bonuses
  luckyHourUntil: number
  welcomeBackClaimed: boolean

  // UI
  rewardQueue: RewardEvent[]
  showCelebration: boolean

  // Actions
  initDaily: () => void
  claimLoginChest: () => void
  claimDailyGoal: () => void
  catchCat: (spot: ExploreSpot) => void
  exploreSpot: (spotId: string) => void
  claimQuest: (questId: string) => void
  rerollQuest: (questId: string) => void
  useStreakFreeze: () => void
  openChest: (chestId: string) => void
  instantOpenChest: (chestId: string) => void
  activateLure: () => void
  setDailyGoal: (goal: 1 | 3 | 5) => void
  dismissReward: () => void
  generateSpots: () => void
  addXp: (amount: number) => void
  checkAchievements: () => void
}

const ZONES: Zone[] = ['jardin', 'rue', 'parc', 'toit', 'café']

function generateSpot(id: string, pityCounter: number, lureActive: boolean): ExploreSpot {
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)]
  let rarity = rollRarity(pityCounter)
  if (lureActive && rarity === 'common' && Math.random() < 0.4) {
    rarity = 'uncommon'
  }
  const species = pickSpeciesForRarity(rarity, zone)
  const isShiny = rollShiny()
  const isRare = ['rare', 'legendary', 'mythic'].includes(rarity)

  return {
    id,
    zone,
    speciesId: species.id,
    isShiny,
    expiresAt: Date.now() + 4 * 60 * 60 * 1000,
    isRare,
  }
}

function createChest(type: Chest['type']): Chest {
  return {
    id: `chest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    readyAt: getChestReadyTime(type),
    opened: false,
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'home',
      setScreen: (screen) => set({ screen }),
      captureTarget: null,
      setCaptureTarget: (spot) => set({ captureTarget: spot, screen: spot ? 'capture' : get().screen }),

      level: 1,
      xp: 0,
      treats: 20,
      streakFreezes: 1,

      streak: 0,
      lastPlayDate: '',
      streakFreezeUsedToday: false,
      longestStreak: 0,

      catches: [],
      discoveredSpecies: [],
      pityCounter: 0,

      dailyGoal: 3,
      catsToday: 0,
      quests: generateDailyQuests(),
      questsDate: '',
      dailyGoalClaimed: false,
      loginChestClaimed: false,

      weeklyProgress: 0,
      weeklyClaimed: false,
      weekStart: '',

      spots: [],
      spotsGeneratedAt: 0,
      exploredSpotIds: [],
      lureActiveUntil: 0,

      chests: [],
      unlockedAchievements: [],

      luckyHourUntil: 0,
      welcomeBackClaimed: false,

      rewardQueue: [],
      showCelebration: false,

      initDaily: () => {
        const state = get()
        const today = getTodayKey()

        if (state.lastPlayDate === today) return

        const daysSince = state.lastPlayDate ? getDaysSince(state.lastPlayDate) : 0
        let newStreak = state.streak
        let newFreezes = state.streakFreezes
        const rewards: RewardEvent[] = []

        if (state.lastPlayDate === '') {
          newStreak = 1
        } else if (daysSince === 1) {
          newStreak = state.streak + 1
          const streakReward = getStreakReward(newStreak)
          rewards.push({
            id: `streak_${today}`,
            type: 'streak',
            title: `Série de ${newStreak} jours !`,
            amount: streakReward.xp,
            emoji: '🔥',
          })
        } else if (daysSince > 1) {
          if (newFreezes > 0 && daysSince === 2) {
            newFreezes -= 1
            rewards.push({
              id: `freeze_${today}`,
              type: 'streak',
              title: 'Gel de série utilisé !',
              emoji: '🧊',
            })
          } else {
            newStreak = 1
          }
        }

        let luckyHour = state.luckyHourUntil
        let welcomeBack = state.welcomeBackClaimed

        if (daysSince >= 2 && !state.welcomeBackClaimed) {
          const bonus = getWelcomeBackBonus(daysSince)
          if (bonus.luckyHour) {
            luckyHour = Date.now() + 60 * 60 * 1000
          }
          rewards.push({
            id: `welcome_${today}`,
            type: 'xp',
            title: 'Bon retour !',
            amount: bonus.xp,
            emoji: '🎉',
          })
          welcomeBack = true
        }

        const weekStart = state.weekStart || today
        const weekElapsed = getDaysSince(weekStart)
        let weeklyProgress = state.weeklyProgress
        let weeklyClaimed = state.weeklyClaimed
        if (weekElapsed >= 7) {
          weeklyProgress = 0
          weeklyClaimed = false
        }

        set({
          lastPlayDate: today,
          streak: newStreak,
          streakFreezes: newFreezes,
          longestStreak: Math.max(state.longestStreak, newStreak),
          catsToday: 0,
          quests: generateDailyQuests(),
          questsDate: today,
          dailyGoalClaimed: false,
          loginChestClaimed: false,
          exploredSpotIds: [],
          streakFreezeUsedToday: false,
          welcomeBackClaimed: welcomeBack,
          luckyHourUntil: luckyHour,
          weeklyProgress: weekElapsed >= 7 ? 0 : weeklyProgress,
          weeklyClaimed: weekElapsed >= 7 ? false : weeklyClaimed,
          weekStart: weekElapsed >= 7 ? today : weekStart,
          rewardQueue: [...state.rewardQueue, ...rewards],
        })

        get().generateSpots()
      },

      claimLoginChest: () => {
        const state = get()
        if (state.loginChestClaimed) return

        const streakBonus = Math.min(state.streak, 30)
        const treats = 10 + streakBonus
        const xp = 25 + streakBonus * 2

        const chestType: Chest['type'] =
          state.streak >= 30 ? 'gold' :
          state.streak >= 7 ? 'silver' : 'wooden'

        set({
          loginChestClaimed: true,
          treats: state.treats + treats,
          chests: [...state.chests.filter(c => !c.opened).slice(-3), createChest(chestType)],
          rewardQueue: [...state.rewardQueue, {
            id: `login_${getTodayKey()}`,
            type: 'chest',
            title: 'Coffre quotidien !',
            amount: treats,
            emoji: '🎁',
          }],
        })
        get().addXp(xp)
      },

      claimDailyGoal: () => {
        const state = get()
        if (state.dailyGoalClaimed || state.catsToday < state.dailyGoal) return

        const bonus = state.dailyGoal * 15
        set({
          dailyGoalClaimed: true,
          treats: state.treats + bonus,
          rewardQueue: [...state.rewardQueue, {
            id: `goal_${getTodayKey()}`,
            type: 'treats',
            title: 'Objectif quotidien !',
            amount: bonus,
            emoji: '🎯',
          }],
        })
        get().addXp(state.dailyGoal * 25)
      },

      catchCat: (spot) => {
        const state = get()
        const species = CAT_SPECIES.find(c => c.id === spot.speciesId)!
        const isNew = !state.discoveredSpecies.includes(spot.speciesId)
        const luckyHour = state.luckyHourUntil > Date.now()
        const xp = getCatchXp(species.rarity, spot.isShiny, isNew, luckyHour)

        const catchEntry: CatCatch = {
          speciesId: spot.speciesId,
          caughtAt: Date.now(),
          isShiny: spot.isShiny,
          isFirstOfDay: state.catsToday === 0,
        }

        const isRare = ['rare', 'legendary', 'mythic'].includes(species.rarity)
        const newPity = isRare ? 0 : state.pityCounter + 1

        let treats = state.treats
        if (!isNew) {
          treats += getDuplicateTreats(species.rarity)
        }

        const newQuests = state.quests.map(q => {
          const updated = { ...q }
          if (q.type === 'catch' && !q.completed) {
            updated.progress = Math.min(q.progress + 1, q.target)
            updated.completed = updated.progress >= q.target
          }
          if (q.type === 'rare' && !q.completed && isRare) {
            updated.progress = 1
            updated.completed = true
          }
          return updated
        })

        const rewards: RewardEvent[] = [{
          id: `catch_${Date.now()}`,
          type: isNew ? 'xp' : 'treats',
          title: isNew ? `Nouveau : ${species.name} !` : `${species.name} (doublon)`,
          amount: isNew ? xp : getDuplicateTreats(species.rarity),
          emoji: spot.isShiny ? '✨' : species.emoji,
        }]

        if (spot.isShiny) {
          rewards.push({
            id: `shiny_${Date.now()}`,
            type: 'shiny',
            title: 'Chat chromatique !',
            emoji: '✨',
          })
        }

        const newDiscovered = isNew
          ? [...state.discoveredSpecies, spot.speciesId]
          : state.discoveredSpecies

        set({
          catches: [...state.catches, catchEntry],
          discoveredSpecies: newDiscovered,
          catsToday: state.catsToday + 1,
          weeklyProgress: state.weeklyProgress + 1,
          pityCounter: newPity,
          treats,
          quests: newQuests,
          spots: state.spots.filter(s => s.id !== spot.id),
          captureTarget: null,
          screen: 'dex',
          showCelebration: true,
          rewardQueue: [...state.rewardQueue, ...rewards],
        })

        get().addXp(xp)

        if (state.chests.filter(c => !c.opened).length < 4 && Math.random() < 0.15) {
          const chestType: Chest['type'] =
            species.rarity === 'mythic' ? 'legendary' :
            species.rarity === 'legendary' ? 'gold' :
            isNew ? 'silver' : 'wooden'
          set({ chests: [...get().chests, createChest(chestType)] })
        }

        get().checkAchievements()
      },

      exploreSpot: (spotId) => {
        const state = get()
        if (state.exploredSpotIds.includes(spotId)) return

        const newQuests = state.quests.map(q => {
          if (q.type === 'explore' && !q.completed) {
            const progress = Math.min(q.progress + 1, q.target)
            return { ...q, progress, completed: progress >= q.target }
          }
          return q
        })

        set({
          exploredSpotIds: [...state.exploredSpotIds, spotId],
          quests: newQuests,
        })
      },

      claimQuest: (questId) => {
        const state = get()
        const quest = state.quests.find(q => q.id === questId)
        if (!quest || !quest.completed || quest.claimed) return

        set({
          quests: state.quests.map(q =>
            q.id === questId ? { ...q, claimed: true } : q
          ),
          treats: state.treats + quest.reward.treats,
          rewardQueue: [...state.rewardQueue, {
            id: `quest_${questId}`,
            type: 'xp',
            title: quest.title,
            amount: quest.reward.xp,
            emoji: quest.icon,
          }],
        })
        get().addXp(quest.reward.xp)
        get().checkAchievements()
      },

      rerollQuest: (questId) => {
        const state = get()
        const quest = state.quests.find(q => q.id === questId)
        if (!quest || quest.completed) return

        const alternatives = generateDailyQuests().filter(q => q.id !== questId)
        const replacement = alternatives[Math.floor(Math.random() * alternatives.length)]

        set({
          quests: state.quests.map(q => q.id === questId ? { ...replacement, id: questId } : q),
          treats: Math.max(0, state.treats - 5),
        })
      },

      useStreakFreeze: () => {
        const state = get()
        if (state.streakFreezes <= 0) return
        set({ streakFreezes: state.streakFreezes - 1 })
      },

      openChest: (chestId) => {
        const state = get()
        const chest = state.chests.find(c => c.id === chestId)
        if (!chest || chest.opened || chest.readyAt > Date.now()) return

        const rewards = getChestRewards(chest.type)
        set({
          chests: state.chests.map(c =>
            c.id === chestId ? { ...c, opened: true } : c
          ),
          treats: state.treats + rewards.treats,
          rewardQueue: [...state.rewardQueue, {
            id: `chest_${chestId}`,
            type: 'chest',
            title: `Coffre ${chest.type} ouvert !`,
            amount: rewards.treats,
            emoji: '📦',
          }],
        })
        get().addXp(rewards.xp)
      },

      instantOpenChest: (chestId) => {
        const state = get()
        const chest = state.chests.find(c => c.id === chestId)
        if (!chest || chest.opened) return

        const cost = chest.type === 'legendary' ? 50 :
          chest.type === 'gold' ? 30 :
          chest.type === 'silver' ? 15 : 5

        if (state.treats < cost) return

        set({ treats: state.treats - cost })
        set({
          chests: state.chests.map(c =>
            c.id === chestId ? { ...c, readyAt: Date.now() } : c
          ),
        })
        get().openChest(chestId)
      },

      activateLure: () => {
        const state = get()
        if (state.treats < 20 || state.lureActiveUntil > Date.now()) return
        set({
          treats: state.treats - 20,
          lureActiveUntil: Date.now() + 30 * 60 * 1000,
        })
        get().generateSpots()
      },

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      dismissReward: () => {
        const [, ...rest] = get().rewardQueue
        set({
          rewardQueue: rest,
          showCelebration: rest.length > 0,
        })
      },

      generateSpots: () => {
        const state = get()
        const lureActive = state.lureActiveUntil > Date.now()
        const spots: ExploreSpot[] = []
        for (let i = 0; i < 6; i++) {
          spots.push(generateSpot(`spot_${Date.now()}_${i}`, state.pityCounter + i, lureActive))
        }
        set({ spots, spotsGeneratedAt: Date.now() })
      },

      addXp: (amount) => {
        const state = get()
        let newXp = state.xp + amount
        let newLevel = state.level
        const rewards: RewardEvent[] = []

        while (newXp >= LEVEL_XP(newLevel)) {
          newXp -= LEVEL_XP(newLevel)
          newLevel += 1
          rewards.push({
            id: `level_${newLevel}`,
            type: 'levelup',
            title: `Niveau ${newLevel} !`,
            emoji: '⬆️',
          })
        }

        set({
          xp: newXp,
          level: newLevel,
          rewardQueue: [...get().rewardQueue, ...rewards],
        })
      },

      checkAchievements: () => {
        const state = get()
        const newUnlocks: string[] = []

        const checks: Record<string, () => boolean> = {
          first_catch: () => state.catches.length >= 1,
          catch_5: () => state.discoveredSpecies.length >= 5,
          catch_10: () => state.discoveredSpecies.length >= 10,
          catch_all: () => state.discoveredSpecies.length >= CAT_SPECIES.length,
          streak_3: () => state.streak >= 3,
          streak_7: () => state.streak >= 7,
          streak_30: () => state.streak >= 30,
          shiny_first: () => state.catches.some(c => c.isShiny),
          shiny_3: () => state.catches.filter(c => c.isShiny).length >= 3,
          rare_catch: () => state.discoveredSpecies.some(id => {
            const s = CAT_SPECIES.find(c => c.id === id)
            return s && ['rare', 'legendary', 'mythic'].includes(s.rarity)
          }),
          legendary: () => state.discoveredSpecies.some(id =>
            CAT_SPECIES.find(c => c.id === id)?.rarity === 'legendary'
          ),
          mythic: () => state.discoveredSpecies.some(id =>
            CAT_SPECIES.find(c => c.id === id)?.rarity === 'mythic'
          ),
          daily_goal: () => state.dailyGoalClaimed,
          quest_master: () => state.quests.every(q => q.claimed),
          explorer: () => state.exploredSpotIds.length >= 20,
          treats_100: () => state.treats >= 100,
          level_10: () => state.level >= 10,
          comeback: () => state.welcomeBackClaimed,
        }

        for (const achievement of ACHIEVEMENTS) {
          if (state.unlockedAchievements.includes(achievement.id)) continue
          if (checks[achievement.id]?.()) {
            newUnlocks.push(achievement.id)
          }
        }

        if (newUnlocks.length > 0) {
          const achievementRewards = newUnlocks.map(id => {
            const a = ACHIEVEMENTS.find(ach => ach.id === id)!
            return {
              id: `ach_${id}`,
              type: 'achievement' as const,
              title: a.title,
              emoji: a.icon,
            }
          })
          set({
            unlockedAchievements: [...state.unlockedAchievements, ...newUnlocks],
            treats: state.treats + newUnlocks.length * 10,
            rewardQueue: [...get().rewardQueue, ...achievementRewards],
          })
        }
      },
    }),
    {
      name: 'catdex-save',
      partialize: (state) => ({
        level: state.level,
        xp: state.xp,
        treats: state.treats,
        streakFreezes: state.streakFreezes,
        streak: state.streak,
        lastPlayDate: state.lastPlayDate,
        longestStreak: state.longestStreak,
        catches: state.catches,
        discoveredSpecies: state.discoveredSpecies,
        pityCounter: state.pityCounter,
        dailyGoal: state.dailyGoal,
        catsToday: state.catsToday,
        quests: state.quests,
        questsDate: state.questsDate,
        dailyGoalClaimed: state.dailyGoalClaimed,
        loginChestClaimed: state.loginChestClaimed,
        weeklyProgress: state.weeklyProgress,
        weeklyClaimed: state.weeklyClaimed,
        weekStart: state.weekStart,
        chests: state.chests,
        unlockedAchievements: state.unlockedAchievements,
        lureActiveUntil: state.lureActiveUntil,
      }),
    }
  )
)
