# ANIMATION_GUIDELINES - CatDex

## Stack
React Native Reanimated 4. Utiliser `MOTION` depuis `@/constants/game`.

## Rôle du motion
- Clarifier une transition.
- Confirmer une interaction.
- Célébrer une découverte ou un gain.
- Donner un game feel premium sans nuire aux FPS.

## Patterns existants
- `FadeInDown/FadeInRight/ZoomIn.springify()` sur entrées de listes et modales.
- `withSpring` scale press sur `FloatingButton`, capture tab, `PokeballButton`.
- Pulses continus sur capture, silhouettes, goals, skeleton.
- `CatAvatar3D` et `CatRevealStage` pour reveal/idle.

## Reduced motion
Toujours vérifier `useReduceMotion` ou prévoir alternative. Les animations décoratives doivent être désactivables. Dette connue: plusieurs pulses/reveals ne sont pas encore tous gated.

## Performance
Pas d'animation infinie sur grandes listes ou nombreux markers. Pas de séquence longue bloquante après capture. Privilégier 150-420ms et springs cohérents.
