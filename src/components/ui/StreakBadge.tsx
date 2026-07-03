import { motion } from 'framer-motion'
import { STREAK_MILESTONES } from '../../types'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'lg'
}

export function StreakBadge({ streak, size = 'sm' }: StreakBadgeProps) {
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak)
  const isLarge = size === 'lg'

  return (
    <div className={`flex items-center gap-2 ${isLarge ? 'flex-col' : ''}`}>
      <motion.div
        className={`flex items-center gap-1.5 bg-gradient-to-r from-coral to-sunset rounded-full font-bold text-white ${
          isLarge ? 'px-6 py-3 text-2xl' : 'px-3 py-1.5 text-sm'
        }`}
        animate={streak > 0 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className={isLarge ? 'text-3xl' : 'text-lg'}>🔥</span>
        <span>{streak}</span>
      </motion.div>
      {isLarge && nextMilestone && (
        <p className="text-xs opacity-60 mt-1">
          Prochain palier : {nextMilestone} jours
        </p>
      )}
    </div>
  )
}
