import { useCallback, useMemo, useState } from "react";
import { gameplayService } from "@/services/gameplay.service";
import { retentionStore } from "@/gameplay/retention/retention-store";

export function useRetention() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return useMemo(
    () => ({
      canClaimDailyBonus: gameplayService.canClaimDailyBonus(),
      shouldShowDailyBonusPrompt: retentionStore.shouldShowDailyBonusPrompt(),
      isFirstDiscoveryToday: gameplayService.isFirstDiscoveryToday(),
      unclaimedMissions: gameplayService.getUnclaimedMissions(),
      hasStreakFreeze: retentionStore.canUseStreakFreeze(),
      refresh,
    }),
    [tick, refresh]
  );
}
