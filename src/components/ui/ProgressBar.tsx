import { motion } from 'framer-motion'
import { LEVEL_XP } from '../../types'

interface ProgressBarProps {
  value: number
  max: number
  color?: string
  height?: string
  showLabel?: boolean
  label?: string
}

export function ProgressBar({ value, max, color = '#FF6B6B', height = '8px', showLabel, label }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold mb-1 opacity-70">
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className="w-full rounded-full bg-black/10 overflow-hidden" style={{ height }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function XpBar({ xp, level }: { xp: number; level: number }) {
  const needed = LEVEL_XP(level)
  return (
    <ProgressBar
      value={xp}
      max={needed}
      color="#FFB347"
      height="6px"
      showLabel
      label={`Niv. ${level}`}
    />
  )
}
