---
description: Mobile performance for map, camera, lists, animations, data.
globs: app/**/*.tsx,components/**/*.tsx,hooks/**/*.ts,services/**/*.ts,gameplay/**/*.ts
---
# 05 - Performance

## Obligatoire
- Protéger FPS sur map, camera, ChatDex grid, animations et capture flow.
- Éviter calculs lourds dans render; utiliser memo seulement si utile.
- Nettoyer watchers geolocation, timers, subscriptions, intervals.
- Listes longues: FlatList/virtualisation, key stable, composants memo si besoin.
- Markers: éviter re-render massif; `tracksViewChanges={false}` côté native déjà en place.
- Images: dimensions connues, compression via cameraService, lazy/progressive si liste.
- Animations décoratives: reduced motion + pas de loops coûteuses.

## Zones à haut risque
`app/(tabs)/map.tsx`, `components/map/*`, `app/capture/*`, `components/game/CatAvatar3D.tsx`, `CatRevealStage.tsx`, `Skeleton.tsx`.

## Sources à charger
`@.cursor/ANIMATION_GUIDELINES.md`, `@.cursor/skills/performance.md`, `@.cursor/skills/motion-design.md`.
