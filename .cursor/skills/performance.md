# Skill - Performance CatDex

## Quand l'utiliser
Map, camera, lists, animations, image loading, React Query/Zustand, geolocation.

## Hotspots
- `app/(tabs)/map.tsx`: nearby cats, zones, markers, daily bonus, goals.
- `components/map/GameMapNative.tsx`, `GameMapMapbox.tsx`.
- `app/(tabs)/chatdex.tsx`: grid.
- `app/capture/*`: camera/compression/AI/save.
- Reanimated loops: markers, cat avatar, skeleton, goals.

## Checklist
- Calculs hors render ou memo justifié.
- Stable keys, memo components si densité.
- Cleanup effects, timers, location watchers.
- Query invalidation ciblée.
- Images compressées/dimensionnées.
- Pas d'animation infinie coûteuse.

## Erreurs à éviter
Optimisation prématurée complexe, rerender carte entier sur UI mineure, watchers permanents, charger photos originales dans listes.

## Documents à charger
Toujours charger `@.cursor/CATDEX_CONTEXT.md` puis les docs/rules cités par la tâche.
