import type { CatSpecies } from '../../types'
import { RARITY_CONFIG } from '../../types'

interface CatCardProps {
  species: CatSpecies
  discovered: boolean
  isShiny?: boolean
  count?: number
  onClick?: () => void
  compact?: boolean
}

export function CatCard({ species, discovered, isShiny, count, onClick, compact }: CatCardProps) {
  const rarity = RARITY_CONFIG[species.rarity]

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all active:scale-95 ${
          discovered ? 'bg-white shadow-md' : 'bg-black/5'
        }`}
        style={discovered ? { borderBottom: `3px solid ${rarity.color}` } : undefined}
      >
        <span className={`text-3xl ${!discovered ? 'opacity-20 grayscale' : ''}`}>
          {discovered ? (isShiny ? '✨' : species.emoji) : '❓'}
        </span>
        {discovered && (
          <span className="text-[10px] font-bold mt-1 truncate w-full text-center">{species.name}</span>
        )}
        {count && count > 1 && (
          <span className="absolute top-1 right-1 bg-coral text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98] ${
        discovered ? 'bg-white shadow-lg' : 'bg-black/5'
      }`}
      style={discovered ? { borderLeft: `4px solid ${rarity.color}` } : undefined}
    >
      <div className="flex items-center gap-3">
        <span className={`text-4xl ${!discovered ? 'opacity-20' : ''}`}>
          {discovered ? species.emoji : '❓'}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-ink">
            {discovered ? species.name : '???'}
          </h3>
          {discovered ? (
            <>
              <p className="text-xs opacity-60 truncate">{species.description}</p>
              <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 text-white"
                style={{ backgroundColor: rarity.color }}
              >
                {rarity.label}
              </span>
            </>
          ) : (
            <p className="text-xs opacity-40">Non découvert</p>
          )}
        </div>
        {count && count > 1 && (
          <span className="text-sm font-bold opacity-50">×{count}</span>
        )}
      </div>
    </button>
  )
}
