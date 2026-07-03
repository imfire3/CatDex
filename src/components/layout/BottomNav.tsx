import { Home, Map, BookOpen, ListChecks, User } from 'lucide-react'
import type { Screen } from '../../types'
import { useGameStore } from '../../store/gameStore'

const NAV_ITEMS: { screen: Screen; icon: typeof Home; label: string }[] = [
  { screen: 'home', icon: Home, label: 'Accueil' },
  { screen: 'explore', icon: Map, label: 'Explorer' },
  { screen: 'dex', icon: BookOpen, label: 'CatDex' },
  { screen: 'quests', icon: ListChecks, label: 'Quêtes' },
  { screen: 'profile', icon: User, label: 'Profil' },
]

export function BottomNav() {
  const screen = useGameStore(s => s.screen)
  const setScreen = useGameStore(s => s.setScreen)
  const unclaimedQuests = useGameStore(s => s.quests.filter(q => q.completed && !q.claimed).length)

  if (screen === 'capture') return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-lg border-t border-black/5 px-2 pb-[env(safe-area-inset-bottom)] z-40">
      <div className="flex justify-around py-2">
        {NAV_ITEMS.map(({ screen: s, icon: Icon, label }) => {
          const active = screen === s
          return (
            <button
              key={s}
              onClick={() => setScreen(s)}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                active ? 'text-coral' : 'text-ink/40'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
              {s === 'quests' && unclaimedQuests > 0 && (
                <span className="absolute -top-0.5 right-1 bg-coral text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unclaimedQuests}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
