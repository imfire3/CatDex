import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { BottomNav } from './components/layout/BottomNav'
import { RewardToast } from './components/ui/RewardToast'
import { HomeScreen } from './screens/HomeScreen'
import { ExploreScreen } from './screens/ExploreScreen'
import { DexScreen } from './screens/DexScreen'
import { QuestsScreen } from './screens/QuestsScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { CaptureScreen } from './screens/CaptureScreen'

function App() {
  const screen = useGameStore(s => s.screen)
  const initDaily = useGameStore(s => s.initDaily)
  const generateSpots = useGameStore(s => s.generateSpots)

  useEffect(() => {
    initDaily()
    const state = useGameStore.getState()
    if (state.spots.length === 0) {
      generateSpots()
    }
  }, [initDaily, generateSpots])

  const screens = {
    home: <HomeScreen />,
    explore: <ExploreScreen />,
    dex: <DexScreen />,
    quests: <QuestsScreen />,
    profile: <ProfileScreen />,
    capture: null,
  }

  return (
    <div className="min-h-dvh bg-cream">
      {screens[screen]}
      <CaptureScreen />
      <BottomNav />
      <RewardToast />
    </div>
  )
}

export default App
