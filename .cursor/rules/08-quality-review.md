---
description: CatDex final quality and living documentation checklist.
alwaysApply: true
---
# 08 - Quality Review & Documentation Vivante

## Checklist avant fin de tâche
- Vision CatDex respectée; pas de traque ni position exacte de chat.
- Apple HIG, mobile-first, 8pt grid, DS tokens, composants existants.
- UX simple avec états loading/empty/error/permission/offline si concernés.
- Accessibilité: labels, contraste, touch targets, reduced motion.
- Performance: pas de render coûteux, listeners nettoyés, images/listes/animations maîtrisées.
- Architecture: pas de duplication, logique au bon endroit, TypeScript clair.
- Gamification responsable: reward utile, pas de dark pattern.
- Wording FR aligné: observer/découvrir/documenter.

## Documentation vivante obligatoire
Si la tâche change une fonctionnalité importante, mettre à jour les docs `.cursor` concernées:
- Architecture/service/store/hook -> `PROJECT_ARCHITECTURE.md`, `TECH_DEBT.md` si dette.
- UI/composant/token -> `DESIGN_SYSTEM.md`, `COMPONENT_LIBRARY.md`, `UI_GUIDELINES.md`.
- Flow/écran -> `UX_GUIDELINES.md`, `FEATURES.md`.
- Gameplay -> `GAME_DESIGN.md`, `ROADMAP.md` si futur.
- Privacy/map -> `DECISIONS.md`, `KNOWN_ISSUES.md`.
- Wording -> `COPYWRITING_GUIDELINES.md`.
- Toujours ajouter une entrée courte dans `CHANGELOG.md` pour une mise à jour majeure de docs.
