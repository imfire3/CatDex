import { useEffect } from 'react';

import { useCatsStore } from '@/store/cats';
import { useMissionsStore } from '@/store/missions';

export function useMissionSync() {
  const catsCount = useCatsStore((state) => state.cats.length);
  const syncFromCatsCount = useMissionsStore((state) => state.syncFromCatsCount);

  useEffect(() => {
    syncFromCatsCount(catsCount);
  }, [catsCount, syncFromCatsCount]);
}
