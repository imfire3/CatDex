import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Header } from '../components/layout/Header'
import { XpBar } from '../components/ui/ProgressBar'
import { StreakBadge } from '../components/ui/StreakBadge'
import { ACHIEVEMENTS } from '../data/achievements'
import { CAT_SPECIES } from '../data/cats'
import { STREAK_MILESTONES } from '../types'

export function ProfileScreen() {
  const level = useGameStore(s => s.level)
  const xp = useGameStore(s => s.xp)
  const streak = useGameStore(s => s.streak)
  const longestStreak = useGameStore(s => s.longestStreak)
  const streakFreezes = useGameStore(s => s.streakFreezes)
  const catches = useGameStore(s => s.catches)
  const discoveredSpecies = useGameStore(s => s.discoveredSpecies)
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements)
  const chests = useGameStore(s => s.chests)
  const openChest = useGameStore(s => s.openChest)
  const instantOpenChest = useGameStore(s => s.instantOpenChest)
  const treats = useGameStore(s => s.treats)

  const shinyCount = catches.filter(c => c.isShiny).length
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak)

  const chestEmojis: Record<string, string> = {
    wooden: '🪵',
    silver: '🥈',
    gold: '🥇',
    legendary: '👑',
  }

  const activeChests = chests.filter(c => !c.opened)

  return (
    <div className="pb-24">
      <Header title="Profil" subtitle="Ton parcours de dresseur" showStats />

      {/* Level & XP */}
      <section className="px-5 mb-5">
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-coral to-sunset rounded-2xl flex items-center justify-center text-3xl">
              🐱
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg">Dresseur Niv. {level}</h2>
              <XpBar xp={xp} level={level} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <StatBox value={discoveredSpecies.length} label="Espèces" emoji="📚" />
            <StatBox value={catches.length} label="Captures" emoji="🐾" />
            <StatBox value={shinyCount} label="Chromatiques" emoji="✨" />
          </div>
        </div>
      </section>

      {/* Streak */}
      <section className="px-5 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Série actuelle</h3>
              <StreakBadge streak={streak} size="lg" />
            </div>
            <div className="text-right text-sm">
              <p className="opacity-50">Record</p>
              <p className="font-bold text-lg">{longestStreak} 🔥</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
            <div className="flex items-center gap-2">
              <span>🧊</span>
              <span className="text-sm font-bold">{streakFreezes} gel(s) de série</span>
            </div>
            {nextMilestone && (
              <span className="text-xs opacity-50">Prochain : {nextMilestone}j</span>
            )}
          </div>
        </div>
      </section>

      {/* Chests */}
      {activeChests.length > 0 && (
        <section className="px-5 mb-5">
          <h2 className="font-display font-bold text-lg mb-3">📦 Coffres</h2>
          <div className="grid grid-cols-2 gap-3">
            {activeChests.map(chest => {
              const ready = chest.readyAt <= Date.now()
              const timeLeft = Math.max(0, chest.readyAt - Date.now())
              const hours = Math.floor(timeLeft / 3600000)
              const mins = Math.floor((timeLeft % 3600000) / 60000)

              return (
                <div key={chest.id} className="bg-white rounded-2xl p-4 shadow-md text-center">
                  <span className="text-4xl">{chestEmojis[chest.type]}</span>
                  <p className="font-bold text-sm mt-2 capitalize">{chest.type}</p>
                  {ready ? (
                    <button
                      onClick={() => openChest(chest.id)}
                      className="mt-2 w-full bg-coral text-white font-bold py-2 rounded-xl text-sm active:scale-95"
                    >
                      Ouvrir !
                    </button>
                  ) : (
                    <div className="mt-2">
                      <p className="text-xs opacity-50">{hours}h{mins.toString().padStart(2, '0')}</p>
                      <button
                        onClick={() => instantOpenChest(chest.id)}
                        disabled={treats < 15}
                        className="mt-1 text-[10px] font-bold text-coral disabled:opacity-30"
                      >
                        Ouvrir maintenant (🍖)
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Achievements */}
      <section className="px-5">
        <h2 className="font-display font-bold text-lg mb-3">
          🏆 Succès ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(achievement => {
            const unlocked = unlockedAchievements.includes(achievement.id)
            return (
              <motion.div
                key={achievement.id}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${
                  unlocked ? 'bg-white shadow-md' : 'bg-black/5'
                }`}
                title={unlocked ? achievement.title : achievement.secret ? '???' : achievement.title}
                whileTap={unlocked ? { scale: 0.95 } : undefined}
              >
                <span className={`text-2xl ${!unlocked ? 'opacity-20 grayscale' : ''}`}>
                  {unlocked ? achievement.icon : achievement.secret ? '❓' : achievement.icon}
                </span>
                {unlocked && (
                  <span className="text-[8px] font-bold mt-1 text-center leading-tight">{achievement.title}</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Collection completion */}
      <section className="px-5 mt-5">
        <div className="bg-gradient-to-r from-mint/20 to-sage/20 rounded-2xl p-4 text-center">
          <p className="font-display font-bold">
            CatDex : {Math.round((discoveredSpecies.length / CAT_SPECIES.length) * 100)}% complété
          </p>
          <p className="text-xs opacity-50 mt-1">
            {discoveredSpecies.length} sur {CAT_SPECIES.length} espèces
          </p>
        </div>
      </section>
    </div>
  )
}

function StatBox({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <div className="bg-black/5 rounded-xl p-3">
      <span className="text-lg">{emoji}</span>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-[10px] opacity-50">{label}</p>
    </div>
  )
}
