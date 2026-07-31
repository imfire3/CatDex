import { useEffect, useRef } from 'react';

import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';
import { useToastStore } from '@/store/toast';

export function useMissionSync() {
  const catsCount = useCatsStore((state) => state.cats.length);
  const syncFromCatsCount = useMissionsStore((state) => state.syncFromCatsCount);
  const showToast = useToastStore((state) => state.show);
  const knownCompleted = useRef<Set<string> | null>(null);

  useEffect(() => {
    const before = useMissionsStore.getState().missions;
    if (knownCompleted.current === null) {
      knownCompleted.current = new Set(
        before.filter((mission) => mission.completed).map((mission) => mission.id),
      );
    }

    syncFromCatsCount(catsCount);

    const after = useMissionsStore.getState().missions;
    for (const mission of after) {
      if (!mission.completed) continue;
      if (knownCompleted.current.has(mission.id)) continue;
      knownCompleted.current.add(mission.id);
      showToast({
        title: 'Mission terminée',
        description: mission.title,
        tone: 'success',
      });
    }
  }, [catsCount, showToast, syncFromCatsCount]);
}
