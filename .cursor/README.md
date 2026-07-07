# Cursor Setup CatDex - Équipe d'agents spécialisés

Ce dossier configure Cursor comme une équipe produit/design/dev pour CatDex. Il est volontairement spécifique au code actuel: Expo/React Native, Supabase, React Query, Zustand/MMKV, Reanimated, carte par zones, gameplay XP/missions/badges.

## Dossiers
- `rules/`: règles projet applicables par type de tâche.
- `skills/`: méthodes opérationnelles CatDex avec checklists.
- `agents/`: rôles spécialisés avec prompts système prêts à copier.
- `prompts/`: prompts prêts à l'emploi qui chargent automatiquement docs/rules/skills/agents via `@.cursor/...`.
- Docs racine: mémoire vivante du produit, architecture, DS, gameplay, roadmap, dette.

## Routine obligatoire pour un futur agent
1. Lire `@.cursor/CATDEX_CONTEXT.md`.
2. Lire les docs ciblées par la tâche.
3. Charger la rule 00 et 08, plus les rules spécialisées.
4. Charger les skills et agent liés.
5. Faire un changement scope, puis mettre à jour docs vivantes si la feature change.

## Router de tâches
| Tâche | Agent | Rules | Skills | Prompt |
|---|---|---|---|---|
| UI écran/composant | Lead Product Designer + UI Reviewer | 00,01,06,07,08 | apple-hig, design-system, accessibility | `prompts/ui-review.md` |
| UX flow | Lead Product Designer + Vision Keeper | 00,02,06,07,08 | laws-of-ux, catdex-product-thinking | `prompts/ux-flow-review.md` |
| Gameplay | Mobile Game Designer | 00,03,08 | mobile-game-design, gamification | `prompts/game-design-review.md` |
| Architecture/code | Flutter Architect | 04,05,08 | performance | `prompts/code-quality-review.md` |
| Performance | Performance Engineer | 05,08 | performance, motion-design | `prompts/performance-review.md` |
| Map/privacy | Maps Privacy Reviewer | 00,02,06,08 | maps-geolocation, accessibility | `prompts/maps-privacy-review.md` |
| Motion | Motion Designer | 05,06,08 | motion-design, performance | `prompts/motion-review.md` |
| Vision/scope | Vision Keeper | 00,08 | catdex-product-thinking | `prompts/vision-arbitration.md` |
| Planning | Staff Engineer + Product Design | 00,02,03,04,08 | product, game, design, performance | `prompts/sprint-planning.md` |

## Documentation vivante
Mettre à jour `.cursor` quand une fonctionnalité importante change:
- écran/flow -> `UX_GUIDELINES.md`, `FEATURES.md`;
- architecture/service/store/hook -> `PROJECT_ARCHITECTURE.md`, `TECH_DEBT.md`;
- composant/token -> `DESIGN_SYSTEM.md`, `COMPONENT_LIBRARY.md`, `UI_GUIDELINES.md`;
- gameplay -> `GAME_DESIGN.md`, `ROADMAP.md`;
- map/privacy -> `DECISIONS.md`, `KNOWN_ISSUES.md`;
- wording -> `COPYWRITING_GUIDELINES.md`;
- décision produit -> `DECISIONS.md`;
- update majeure -> `CHANGELOG.md`.

## Reviews rapides
- UI: copier `prompts/ui-review.md`.
- UX: `prompts/ux-flow-review.md`.
- Performance: `prompts/performance-review.md`.
- Architecture: `prompts/code-quality-review.md`.
- Privacy map: `prompts/maps-privacy-review.md`.

## Éviter que Cursor modifie trop de choses
Ajouter au prompt: "Ne modifie que les fichiers listés. Pas de refactor global. Pas de dépendance. Pas de config build. Si la documentation doit changer, limite-toi aux fichiers `.cursor` pertinents." Demander une review avant patch pour les flows sensibles.
