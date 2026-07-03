import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

export function RewardToast() {
  const rewardQueue = useGameStore(s => s.rewardQueue)
  const dismissReward = useGameStore(s => s.dismissReward)
  const current = rewardQueue[0]

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissReward}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl max-w-sm animate-celebrate"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              {current.emoji}
            </motion.div>
            <h3 className="font-display text-xl font-bold text-ink mb-1">{current.title}</h3>
            {current.amount && (
              <p className="text-coral font-bold text-lg">+{current.amount}</p>
            )}
            <button
              onClick={dismissReward}
              className="mt-6 bg-coral text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform"
            >
              Super !
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
