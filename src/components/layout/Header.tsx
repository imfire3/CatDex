import { useGameStore } from '../../store/gameStore'
import { StreakBadge } from '../ui/StreakBadge'

interface HeaderProps {
  title: string
  subtitle?: string
  showStats?: boolean
}

export function Header({ title, subtitle, showStats }: HeaderProps) {
  const treats = useGameStore(s => s.treats)
  const streak = useGameStore(s => s.streak)

  return (
    <header className="px-5 pt-4 pb-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-sm opacity-60 mt-0.5">{subtitle}</p>}
        </div>
        {showStats && (
          <div className="flex items-center gap-2">
            <StreakBadge streak={streak} />
            <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm text-sm font-bold">
              <span>🍖</span>
              <span>{treats}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
