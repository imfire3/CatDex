import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Header } from '../components/layout/Header'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StreakBadge } from '../components/ui/StreakBadge'
import { CAT_SPECIES } from '../data/cats'
import { DAILY_GOALS } from '../types'

export function HomeScreen() {
  const streak = useGameStore(s => s.streak)
  const catsToday = useGameStore(s => s.catsToday)
  const dailyGoal = useGameStore(s => s.dailyGoal)
  const dailyGoalClaimed = useGameStore(s => s.dailyGoalClaimed)
  const loginChestClaimed = useGameStore(s => s.loginChestClaimed)
  const discoveredSpecies = useGameStore(s => s.discoveredSpecies)
  const luckyHourUntil = useGameStore(s => s.luckyHourUntil)
  const claimLoginChest = useGameStore(s => s.claimLoginChest)
  const claimDailyGoal = useGameStore(s => s.claimDailyGoal)
  const setScreen = useGameStore(s => s.setScreen)
  const setDailyGoal = useGameStore(s => s.setDailyGoal)

  const luckyHour = luckyHourUntil > Date.now()
  const totalCats = CAT_SPECIES.length
  const discovered = discoveredSpecies.length
  const completion = Math.round((discovered / totalCats) * 100)

  const catOfTheDay = CAT_SPECIES[new Date().getDate() % CAT_SPECIES.length]
  const isCatOfDayDiscovered = discoveredSpecies.includes(catOfTheDay.id)

  return (
    <div className="pb-24">
      <Header title="CatDex" subtitle="Bienvenue, Dresseur !" showStats />

      {luckyHour && (
        <motion.div
          className="mx-5 mb-4 bg-gradient-to-r from-sunset to-coral rounded-2xl p-3 text-white text-center font-bold text-sm"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨ Heure Chanceuse — XP doublé pendant 1h !
        </motion.div>
      )}

      {/* Streak & Daily Login */}
      <section className="px-5 mb-5">
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <StreakBadge streak={streak} size="lg" />
            {!loginChestClaimed && (
              <motion.button
                onClick={claimLoginChest}
                className="bg-gradient-to-r from-coral to-sunset text-white font-bold py-3 px-5 rounded-2xl shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                whileTap={{ scale: 0.95 }}
              >
                🎁 Coffre du jour
              </motion.button>
            )}
            {loginChestClaimed && (
              <span className="text-sm opacity-50 font-semibold">✅ Coffre récupéré</span>
            )}
          </div>

          {/* Daily Goal */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Objectif du jour</span>
              <div className="flex gap-1">
                {DAILY_GOALS.map(g => (
                  <button
                    key={g.target}
                    onClick={() => setDailyGoal(g.target)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                      dailyGoal === g.target
                        ? 'bg-coral text-white'
                        : 'bg-black/5 text-ink/50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <ProgressBar
              value={catsToday}
              max={dailyGoal}
              color="#4ECDC4"
              showLabel
              label={`${catsToday}/${dailyGoal} chats`}
            />
            {catsToday >= dailyGoal && !dailyGoalClaimed && (
              <motion.button
                onClick={claimDailyGoal}
                className="w-full mt-3 bg-mint text-white font-bold py-2.5 rounded-xl"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🎯 Réclamer la récompense !
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Cat of the Day */}
      <section className="px-5 mb-5">
        <h2 className="font-display font-bold text-lg mb-3">🌟 Chat du jour</h2>
        <button
          onClick={() => setScreen('explore')}
          className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          <span className="text-5xl animate-float">{catOfTheDay.emoji}</span>
          <div className="text-left flex-1">
            <h3 className="font-display font-bold">{catOfTheDay.name}</h3>
            <p className="text-xs opacity-60">{catOfTheDay.description}</p>
            {isCatOfDayDiscovered ? (
              <span className="text-xs text-mint font-bold">✅ Déjà dans ta collection</span>
            ) : (
              <span className="text-xs text-coral font-bold">Va l'explorer ! →</span>
            )}
          </div>
        </button>
      </section>

      {/* Collection Progress */}
      <section className="px-5 mb-5">
        <h2 className="font-display font-bold text-lg mb-3">📖 Progression</h2>
        <button
          onClick={() => setScreen('dex')}
          className="w-full bg-white rounded-2xl p-4 shadow-md active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">CatDex</span>
            <span className="text-sm font-bold text-coral">{completion}%</span>
          </div>
          <ProgressBar value={discovered} max={totalCats} color="#FF6B6B" height="10px" />
          <p className="text-xs opacity-50 mt-2">{discovered}/{totalCats} espèces découvertes</p>
        </button>
      </section>

      {/* Quick Actions */}
      <section className="px-5">
        <h2 className="font-display font-bold text-lg mb-3">⚡ Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { screen: 'explore' as const, emoji: '🗺️', label: 'Explorer', desc: 'Trouve des chats' },
            { screen: 'quests' as const, emoji: '📋', label: 'Quêtes', desc: 'Missions du jour' },
            { screen: 'dex' as const, emoji: '📚', label: 'Collection', desc: 'Voir ton CatDex' },
            { screen: 'profile' as const, emoji: '🏆', label: 'Profil', desc: 'Stats & succès' },
          ].map(action => (
            <button
              key={action.screen}
              onClick={() => setScreen(action.screen)}
              className="bg-white rounded-2xl p-4 shadow-md text-left active:scale-95 transition-transform"
            >
              <span className="text-2xl">{action.emoji}</span>
              <h3 className="font-bold text-sm mt-2">{action.label}</h3>
              <p className="text-[10px] opacity-50">{action.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
