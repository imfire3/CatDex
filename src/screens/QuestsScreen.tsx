import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Header } from '../components/layout/Header'
import { ProgressBar } from '../components/ui/ProgressBar'
import { WEEKLY_CHALLENGE } from '../data/quests'

export function QuestsScreen() {
  const quests = useGameStore(s => s.quests)
  const weeklyProgress = useGameStore(s => s.weeklyProgress)
  const weeklyClaimed = useGameStore(s => s.weeklyClaimed)
  const treats = useGameStore(s => s.treats)
  const claimQuest = useGameStore(s => s.claimQuest)
  const rerollQuest = useGameStore(s => s.rerollQuest)

  const allCompleted = quests.every(q => q.completed)
  const allClaimed = quests.every(q => q.claimed)

  return (
    <div className="pb-24">
      <Header title="Quêtes" subtitle="Missions quotidiennes" showStats />

      {/* Weekly Challenge */}
      <section className="px-5 mb-5">
        <div className="bg-gradient-to-br from-lavender/30 to-coral/20 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏅</span>
            <div>
              <h2 className="font-display font-bold">{WEEKLY_CHALLENGE.title}</h2>
              <p className="text-xs opacity-60">{WEEKLY_CHALLENGE.description}</p>
            </div>
          </div>
          <ProgressBar
            value={weeklyProgress}
            max={WEEKLY_CHALLENGE.target}
            color="#B8A9C9"
            showLabel
            label={`${weeklyProgress}/${WEEKLY_CHALLENGE.target} cette semaine`}
          />
          {weeklyProgress >= WEEKLY_CHALLENGE.target && !weeklyClaimed && (
            <motion.button
              className="w-full mt-3 bg-lavender text-white font-bold py-2.5 rounded-xl"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🎁 Réclamer le défi hebdo !
            </motion.button>
          )}
          <p className="text-[10px] opacity-40 mt-2 text-center">
            Récompense : {WEEKLY_CHALLENGE.reward.xp} XP + {WEEKLY_CHALLENGE.reward.treats} 🍖 + Coffre Or
          </p>
        </div>
      </section>

      {/* Daily Quests */}
      <section className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">📋 Aujourd'hui</h2>
          {allCompleted && allClaimed && (
            <span className="text-xs font-bold text-mint">✅ Tout complété !</span>
          )}
        </div>

        <div className="space-y-3">
          {quests.map((quest, i) => (
            <motion.div
              key={quest.id}
              className={`bg-white rounded-2xl p-4 shadow-md ${
                quest.completed && !quest.claimed ? 'ring-2 ring-mint' : ''
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{quest.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{quest.title}</h3>
                  <p className="text-xs opacity-50">{quest.description}</p>
                  <div className="mt-2">
                    <ProgressBar
                      value={quest.progress}
                      max={quest.target}
                      color={quest.completed ? '#95D5B2' : '#4ECDC4'}
                      height="6px"
                    />
                  </div>
                  <p className="text-[10px] opacity-40 mt-1">
                    🎁 {quest.reward.xp} XP + {quest.reward.treats} 🍖
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {quest.completed && !quest.claimed && (
                  <button
                    onClick={() => claimQuest(quest.id)}
                    className="flex-1 bg-mint text-white font-bold py-2 rounded-xl text-sm active:scale-95 transition-transform"
                  >
                    Réclamer
                  </button>
                )}
                {quest.claimed && (
                  <span className="flex-1 text-center text-sm font-bold text-mint py-2">✅ Réclamé</span>
                )}
                {!quest.completed && (
                  <button
                    onClick={() => rerollQuest(quest.id)}
                    disabled={treats < 5}
                    className="text-xs font-bold px-3 py-2 rounded-xl bg-black/5 opacity-60 active:scale-95 disabled:opacity-30"
                  >
                    🔄 Changer (5 🍖)
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bonus for completing all */}
      {allCompleted && !allClaimed && (
        <div className="mx-5 bg-gradient-to-r from-sunset to-coral rounded-2xl p-4 text-white text-center">
          <p className="font-bold">🌟 Bonus combo !</p>
          <p className="text-xs opacity-80 mt-1">Réclame toutes les quêtes pour un bonus surprise</p>
        </div>
      )}
    </div>
  )
}
