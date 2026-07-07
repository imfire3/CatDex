# Skill - Design System CatDex

## Quand l'utiliser
Toute UI, review visuelle, nouveau composant, harmonisation, suppression duplication.

## Sources code
`constants/design-system.ts`, `constants/game.ts`, `components/ui`, `components/game`, `components/map`, `components/feedback`, `components/auth`.

## Checklist
- Import depuis `@/constants/game`.
- DS/TEXT/MOTION/ELEVATION/GRADIENTS/RARITY_COLORS utilisés.
- 8pt grid, touch 44px+.
- Composant existant cherché dans `COMPONENT_LIBRARY.md`.
- `StyleSheet.create`, inline seulement pour dynamique.
- Rarity + text, pas couleur seule.

## Erreurs à éviter
Créer une autre Card/Button, hardcoder colors/radius, utiliser `theme.ts` en nouveau code, oublier light surfaces dans sheets.

## Exemples
- Ecran secondaire: `ScreenBackground` + `ScreenHeader` + `GlassCard`.
- CTA: `FloatingButton` avant nouveau Pressable gradient.

## Documents à charger
Toujours charger `@.cursor/CATDEX_CONTEXT.md` puis les docs/rules cités par la tâche.
