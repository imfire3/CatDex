---
description: Clean mobile architecture for CatDex Expo/React Native plus Flutter best-practice principles.
globs: app/**/*.tsx,components/**/*.tsx,hooks/**/*.ts,services/**/*.ts,gameplay/**/*.ts,providers/**/*.tsx,stores/**/*.ts,lib/**/*.ts
---
# 04 - Mobile Architecture

## Architecture propre
- `app/` compose routes/navigation; pas de logique lourde.
- `components/` rend UI réutilisable.
- `services/` gère IO/Supabase/side effects.
- `gameplay/` contient règles jeu et stores de gameplay.
- `hooks/` composent data/state pour UI.
- `providers/` expose contextes globaux.
- `lib/` contient adapters/helpers infra.

## Flutter Best Practices transposées
Le projet est Expo/React Native. Appliquer les principes Flutter utiles: petits composants composables, state explicite, rebuilds limités, logique hors render, séparation UI/domain/data, props typées, side effects isolés, navigation prévisible.

## Règles de code
Pas de refactor global non demandé, pas de dépendance inutile, pas de duplication logique, pas de calcul coûteux dans render, cleanup effects/listeners, TypeScript clair aux frontières.

## Sources à charger
`@.cursor/PROJECT_ARCHITECTURE.md`, `@.cursor/TECH_DEBT.md`, `@.cursor/skills/performance.md`.
