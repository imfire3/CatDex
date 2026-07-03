import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Header } from '../components/layout/Header'
import { CAT_SPECIES, getSpeciesById } from '../data/cats'
import { ZONE_CONFIG, RARITY_CONFIG } from '../types'
import type { Zone } from '../types'

export function ExploreScreen() {
  const spots = useGameStore(s => s.spots)
  const lureActiveUntil = useGameStore(s => s.lureActiveUntil)
  const treats = useGameStore(s => s.treats)
  const pityCounter = useGameStore(s => s.pityCounter)
  const setCaptureTarget = useGameStore(s => s.setCaptureTarget)
  const exploreSpot = useGameStore(s => s.exploreSpot)
  const activateLure = useGameStore(s => s.activateLure)
  const generateSpots = useGameStore(s => s.generateSpots)

  const lureActive = lureActiveUntil > Date.now()
  const lureMinutesLeft = lureActive ? Math.ceil((lureActiveUntil - Date.now()) / 60000) : 0

  const handleSpotTap = (spotId: string) => {
    const spot = spots.find(s => s.id === spotId)
    if (!spot) return
    exploreSpot(spotId)
    setCaptureTarget(spot)
  }

  const zones = Object.keys(ZONE_CONFIG) as Zone[]
  const discovered = useGameStore(s => s.discoveredSpecies)

  return (
    <div className="pb-24">
      <Header title="Explorer" subtitle="Des chats rôdent par ici..." showStats />

      {/* Lure & Refresh */}
      <div className="px-5 mb-4 flex gap-2">
        <button
          onClick={activateLure}
          disabled={lureActive || treats < 20}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
            lureActive
              ? 'bg-sunset/20 text-sunset'
              : treats >= 20
                ? 'bg-sunset text-white active:scale-95'
                : 'bg-black/5 text-ink/30'
          }`}
        >
          {lureActive ? `🧲 Leurre actif (${lureMinutesLeft}min)` : '🧲 Leurre (20 🍖)'}
        </button>
        <button
          onClick={generateSpots}
          className="py-2.5 px-4 rounded-xl font-bold text-sm bg-white shadow-md active:scale-95"
        >
          🔄
        </button>
      </div>

      {/* Pity indicator (subtle, non-frustrating) */}
      {pityCounter >= 5 && (
        <div className="mx-5 mb-4 bg-lavender/20 rounded-xl p-3 text-center text-sm">
          <span className="font-bold">🍀 Chance augmentée !</span>
          <span className="opacity-60 ml-1">Un chat rare approche...</span>
        </div>
      )}

      {/* Zone Map */}
      <section className="px-5 mb-5">
        <h2 className="font-display font-bold text-lg mb-3">🗺️ Carte du quartier</h2>
        <div className="grid grid-cols-2 gap-3">
          {zones.map(zone => {
            const config = ZONE_CONFIG[zone]
            const zoneSpots = spots.filter(s => s.zone === zone)
            const zoneCats = CAT_SPECIES.filter(c => c.zone === zone)
            const zoneProgress = zoneCats.filter(c => discovered.includes(c.id)).length

            return (
              <div
                key={zone}
                className="bg-white rounded-2xl p-4 shadow-md"
                style={{ borderTop: `3px solid ${config.color}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{config.emoji}</span>
                  <span className="font-bold text-sm">{config.label}</span>
                </div>
                <p className="text-[10px] opacity-50 mb-2">{zoneProgress}/{zoneCats.length} découverts</p>
                {zoneSpots.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {zoneSpots.map(spot => {
                      const species = getSpeciesById(spot.speciesId)!
                      const rarity = RARITY_CONFIG[species.rarity]
                      return (
                        <motion.button
                          key={spot.id}
                          onClick={() => handleSpotTap(spot.id)}
                          className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            spot.isRare ? 'animate-pulse-glow' : 'bg-black/5'
                          }`}
                          style={spot.isRare ? { backgroundColor: `${rarity.color}30` } : undefined}
                          whileTap={{ scale: 0.9 }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {spot.isShiny ? '✨' : species.emoji}
                          {spot.isRare && (
                            <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] opacity-30 italic">Aucun chat repéré</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* All Spots List */}
      <section className="px-5">
        <h2 className="font-display font-bold text-lg mb-3">📍 Spots actifs ({spots.length})</h2>
        {spots.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-md">
            <span className="text-4xl">😿</span>
            <p className="font-bold mt-2">Plus de chats dans le coin</p>
            <p className="text-sm opacity-50 mt-1">Reviens dans quelques heures ou utilise un leurre</p>
            <button
              onClick={generateSpots}
              className="mt-4 bg-coral text-white font-bold py-2.5 px-6 rounded-xl active:scale-95"
            >
              🔄 Rafraîchir
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {spots.map(spot => {
              const species = getSpeciesById(spot.speciesId)!
              const rarity = RARITY_CONFIG[species.rarity]
              const zone = ZONE_CONFIG[spot.zone]
              return (
                <motion.button
                  key={spot.id}
                  onClick={() => handleSpotTap(spot.id)}
                  className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 active:scale-[0.98] transition-transform"
                  layout
                >
                  <span className="text-3xl">{spot.isShiny ? '✨' : species.emoji}</span>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-sm">{species.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] opacity-50">{zone.emoji} {zone.label}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: rarity.color }}
                      >
                        {rarity.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-coral font-bold text-sm">Attraper →</span>
                </motion.button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
