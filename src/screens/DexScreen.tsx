import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Header } from '../components/layout/Header'
import { CatCard } from '../components/ui/CatCard'
import { CAT_SPECIES } from '../data/cats'
import { RARITY_CONFIG, ZONE_CONFIG } from '../types'
import type { Rarity, Zone } from '../types'

type Filter = 'all' | Rarity | Zone

export function DexScreen() {
  const discoveredSpecies = useGameStore(s => s.discoveredSpecies)
  const catches = useGameStore(s => s.catches)
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const getCatchCount = (id: string) => catches.filter(c => c.speciesId === id).length
  const hasShiny = (id: string) => catches.some(c => c.speciesId === id && c.isShiny)

  const filtered = CAT_SPECIES.filter(cat => {
    if (filter === 'all') return true
    if (cat.rarity === filter || cat.zone === filter) return true
    return false
  })

  const selected = selectedId ? CAT_SPECIES.find(c => c.id === selectedId) : null
  const discovered = selected ? discoveredSpecies.includes(selected.id) : false

  return (
    <div className="pb-24">
      <Header
        title="CatDex"
        subtitle={`${discoveredSpecies.length}/${CAT_SPECIES.length} espèces`}
        showStats
      />

      {/* Filters */}
      <div className="px-5 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Tous" />
          {(Object.keys(RARITY_CONFIG) as Rarity[]).map(r => (
            <FilterChip
              key={r}
              active={filter === r}
              onClick={() => setFilter(r)}
              label={RARITY_CONFIG[r].label}
              color={RARITY_CONFIG[r].color}
            />
          ))}
        </div>
      </div>

      {/* Detail View */}
      {selected && discovered ? (
        <div className="px-5 mb-4">
          <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
            <button onClick={() => setSelectedId(null)} className="text-sm opacity-50 mb-4">← Retour</button>
            <span className="text-7xl block mb-3">{hasShiny(selected.id) ? '✨' : selected.emoji}</span>
            <h2 className="font-display text-2xl font-bold">{selected.name}</h2>
            <span
              className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white mt-2"
              style={{ backgroundColor: RARITY_CONFIG[selected.rarity].color }}
            >
              {RARITY_CONFIG[selected.rarity].label}
            </span>
            <p className="text-sm opacity-60 mt-3">{selected.description}</p>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div><span className="opacity-50">Zone</span><br /><strong>{ZONE_CONFIG[selected.zone].emoji} {ZONE_CONFIG[selected.zone].label}</strong></div>
              <div><span className="opacity-50">Trait</span><br /><strong>{selected.trait}</strong></div>
              <div><span className="opacity-50">Capturés</span><br /><strong>×{getCatchCount(selected.id)}</strong></div>
            </div>
            {hasShiny(selected.id) && (
              <p className="mt-3 text-sunset font-bold text-sm">✨ Version chromatique obtenue !</p>
            )}
          </div>
        </div>
      ) : (
        <div className="px-5">
          <div className="grid grid-cols-3 gap-2">
            {filtered.map(cat => (
              <CatCard
                key={cat.id}
                species={cat}
                discovered={discoveredSpecies.includes(cat.id)}
                isShiny={hasShiny(cat.id)}
                count={getCatchCount(cat.id)}
                onClick={() => discoveredSpecies.includes(cat.id) && setSelectedId(cat.id)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Near completion hint */}
      {discoveredSpecies.length >= CAT_SPECIES.length - 3 && discoveredSpecies.length < CAT_SPECIES.length && (
        <div className="mx-5 mt-4 bg-gradient-to-r from-sunset/20 to-coral/20 rounded-2xl p-4 text-center">
          <p className="font-bold text-sm">🏁 Presque fini !</p>
          <p className="text-xs opacity-60 mt-1">
            Plus que {CAT_SPECIES.length - discoveredSpecies.length} chats à découvrir
          </p>
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, label, color }: {
  active: boolean; onClick: () => void; label: string; color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
        active ? 'text-white' : 'bg-white text-ink/50 shadow-sm'
      }`}
      style={active && color ? { backgroundColor: color } : active ? { backgroundColor: '#FF6B6B' } : undefined}
    >
      {label}
    </button>
  )
}
