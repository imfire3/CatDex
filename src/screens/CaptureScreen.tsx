import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getSpeciesById } from '../data/cats'
import { RARITY_CONFIG } from '../types'

export function CaptureScreen() {
  const captureTarget = useGameStore(s => s.captureTarget)
  const catchCat = useGameStore(s => s.catchCat)
  const setCaptureTarget = useGameStore(s => s.setCaptureTarget)
  const discoveredSpecies = useGameStore(s => s.discoveredSpecies)

  const [phase, setPhase] = useState<'encounter' | 'timing' | 'caught'>('encounter')
  const [timingScore, setTimingScore] = useState(0)
  const [showRing, setShowRing] = useState(false)

  useEffect(() => {
    if (phase === 'timing') {
      const timer = setTimeout(() => setShowRing(true), 500)
      return () => clearTimeout(timer)
    }
  }, [phase])

  useEffect(() => {
    if (!captureTarget) {
      setPhase('encounter')
      setTimingScore(0)
      setShowRing(false)
    }
  }, [captureTarget])

  if (!captureTarget) return null

  const species = getSpeciesById(captureTarget.speciesId)!
  const rarity = RARITY_CONFIG[species.rarity]
  const isNew = !discoveredSpecies.includes(species.id)

  const handleCatch = () => {
    if (phase === 'encounter') {
      setPhase('timing')
      return
    }

    if (phase === 'timing') {
      setPhase('caught')
      setTimeout(() => {
        catchCat(captureTarget)
      }, 1500)
    }
  }

  const handleTimingTap = () => {
    if (!showRing) return
    const score = Math.floor(Math.random() * 3) + 1
    setTimingScore(score)
    setPhase('caught')
    setTimeout(() => {
      catchCat(captureTarget)
    }, 1500)
  }

  const handleFlee = () => {
    setCaptureTarget(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-lavender/30 to-cream flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={handleFlee} className="text-sm font-bold opacity-50">
          ← Fuir
        </button>
        {isNew && (
          <span className="bg-coral text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            NOUVEAU !
          </span>
        )}
      </div>

      {/* Encounter Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {phase === 'caught' ? (
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.span
              className="text-8xl block"
              animate={{ rotate: [0, -5, 5, 0], y: [0, -20, 0] }}
              transition={{ duration: 0.8 }}
            >
              {captureTarget.isShiny ? '✨' : species.emoji}
            </motion.span>
            <h2 className="font-display text-2xl font-bold mt-4">
              {isNew ? 'Attrapé !' : 'Doublon !'}
            </h2>
            <p className="text-sm opacity-60">{species.name}</p>
            {timingScore > 0 && (
              <p className="text-sunset font-bold text-sm mt-2">
                {timingScore === 3 ? '🎯 Parfait !' : timingScore === 2 ? '👍 Bien !' : '✓ Attrapé'}
              </p>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-8xl">
                {captureTarget.isShiny ? '✨' : species.emoji}
              </span>
              {captureTarget.isRare && (
                <motion.span
                  className="absolute -top-2 -right-2 text-2xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⭐
                </motion.span>
              )}
            </motion.div>

            <h2 className="font-display text-2xl font-bold mt-6">{species.name}</h2>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white mt-2"
              style={{ backgroundColor: rarity.color }}
            >
              {rarity.label}
            </span>
            <p className="text-sm opacity-60 mt-2 text-center">{species.description}</p>

            {phase === 'timing' && showRing && (
              <motion.div
                className="mt-8 relative w-32 h-32"
                onClick={handleTimingTap}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-coral"
                  animate={{ scale: [1.5, 0.8, 1.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-coral text-sm">TAP !</span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      {phase !== 'caught' && (
        <div className="p-6 space-y-3">
          {phase === 'encounter' && (
            <>
              <p className="text-center text-xs opacity-50 mb-2">
                Pas d'échec possible — chaque rencontre est une victoire !
              </p>
              <motion.button
                onClick={handleCatch}
                className="w-full bg-gradient-to-r from-coral to-sunset text-white font-bold py-4 rounded-2xl text-lg shadow-lg"
                whileTap={{ scale: 0.95 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🐾 Attraper !
              </motion.button>
            </>
          )}
          {phase === 'timing' && !showRing && (
            <p className="text-center text-sm opacity-50 animate-pulse">
              Le chat s'approche...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
