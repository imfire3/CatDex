import type { Quest } from '../types'

export const generateDailyQuests = (): Quest[] => [
  {
    id: 'daily_catch',
    title: 'Chasseur du jour',
    description: 'Attrape 2 chats',
    icon: '🎯',
    target: 2,
    progress: 0,
    reward: { xp: 75, treats: 10 },
    type: 'catch',
    completed: false,
    claimed: false,
  },
  {
    id: 'daily_explore',
    title: 'Explorateur',
    description: 'Visite 3 spots différents',
    icon: '🗺️',
    target: 3,
    progress: 0,
    reward: { xp: 50, treats: 8 },
    type: 'explore',
    completed: false,
    claimed: false,
  },
  {
    id: 'daily_bonus',
    title: 'Bonus du jour',
    description: 'Attrape 1 chat rare ou mieux',
    icon: '⭐',
    target: 1,
    progress: 0,
    reward: { xp: 150, treats: 25 },
    type: 'rare',
    completed: false,
    claimed: false,
  },
]

export const WEEKLY_CHALLENGE = {
  title: 'Défi de la semaine',
  description: 'Attrape 15 chats cette semaine',
  target: 15,
  reward: { xp: 500, treats: 50, chest: 'gold' as const },
}
