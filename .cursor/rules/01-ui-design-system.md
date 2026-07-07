---
description: CatDex UI system, Apple HIG, 8pt grid, components.
globs: app/**/*.tsx,components/**/*.tsx,constants/**/*.ts
---
# 01 - UI Design System

## Obligatoire
- Apple HIG: clarté, feedback, safe areas, contrôle, touch targets 44px+.
- 8pt grid: DS.space d'abord; 4px seulement pour ajustement fin.
- Source design: `constants/design-system.ts`, import via `@/constants/game`.
- Utiliser `DS`, `TEXT`, `MOTION`, `ELEVATION`, `GRADIENTS`, `RARITY_COLORS`; `GAME` toléré pour compatibilité.
- Réutiliser `components/ui`, `components/game`, `components/map`, `components/feedback`, `components/auth`.
- Pas de nouveau bouton/carte/chip/header si un composant existe.
- Premium mobile game: surfaces glass contrôlées, hiérarchie forte, radius cohérent, feedback press subtil.

## Interdits
Couleurs/radius/spacing hardcodés sans justification, duplications de cards/buttons, styles inline massifs, UI desktop, texte critique tronqué.

## Sources à charger
`@.cursor/DESIGN_SYSTEM.md`, `@.cursor/COMPONENT_LIBRARY.md`, `@.cursor/UI_GUIDELINES.md`, `@.cursor/skills/design-system.md`.
