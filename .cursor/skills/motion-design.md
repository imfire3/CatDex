# Skill - Motion Design CatDex

## Quand l'utiliser
Transitions, capture feedback, reveal, XP pop, haptics, skeleton, map markers.

## Sources code
`MOTION`, `hooks/useReduceMotion.ts`, `components/game/PokeballButton.tsx`, `CatRevealStage.tsx`, `CatAvatar3D.tsx`, `DailyBonusModal.tsx`, `components/feedback/Skeleton.tsx`.

## Checklist
- Animation explique/confirme/célèbre.
- Durée 150-420ms sauf cas justifié.
- Reduced motion prévu.
- Pas de loop sur liste/markers nombreux.
- Feedback compréhensible sans mouvement/haptique.

## Erreurs à éviter
Confetti long, haptic répétitif, pulse permanent non gated, animation qui bloque navigation, layout jump.

## Exemples
- Reveal rareté: court glow + scale, alternative static.
- XP: progress bar timing, label textual.

## Documents à charger
Toujours charger `@.cursor/CATDEX_CONTEXT.md` puis les docs/rules cités par la tâche.
