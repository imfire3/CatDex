import { useCallback, useMemo, useState } from "react";
import { gameplayService } from "@/services/gameplay.service";
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from "@/gameplay/missions/mission-definitions";
import { getCurrentSeason } from "@/gameplay/seasons/season-config";

export function useMissions() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return useMemo(() => {
    const store = gameplayService.getMissions();
    const season = getCurrentSeason();
    const seasonProgress = gameplayService.getSeasonProgress();

    const mapMissions = (defs: typeof DAILY_MISSIONS, progress: typeof store.daily) =>
      defs.map((def) => {
        const p = progress.find((m) => m.missionId === def.id);
        return {
          ...def,
          current: p?.current ?? 0,
          completed: p?.completed ?? false,
          claimed: p?.claimed ?? false,
        };
      });

    return {
      daily: mapMissions(DAILY_MISSIONS, store.daily),
      weekly: mapMissions(WEEKLY_MISSIONS, store.weekly),
      season: {
        ...season,
        current: seasonProgress.current,
        completed: seasonProgress.completed,
      },
      unclaimedCount: gameplayService.getUnclaimedMissions(),
      refresh,
    };
  }, [tick, refresh]);
}
