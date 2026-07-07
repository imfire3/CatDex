# DECISIONS - CatDex

## ADR-001 - Source design canonique
Décision: `constants/design-system.ts` est la source de vérité; importer via `@/constants/game`. `theme.ts` reste legacy.

## ADR-002 - Privacy par zones
Décision: CatDex doit guider par zones/quartiers. Aucune UI ne doit afficher une adresse ou coordonnée exacte de chat. Les coordonnées approximées/jitterées sont une implémentation technique, pas une promesse UI de précision.

## ADR-003 - Expo/React Native, pas Flutter
Décision: le projet actif est Expo/React Native. Les mentions Flutter Best Practices signifient principes mobiles transposés: composants composables, state explicite, rebuilds limités, architecture claire.

## ADR-004 - Documentation vivante
Décision: toute fonctionnalité importante doit mettre à jour `.cursor/` si elle change architecture, flow, gameplay, design system, wording, privacy, performance ou roadmap.

## ADR-005 - Wording responsable
Décision: les nouvelles UI préfèrent observer/découvrir/documenter. Les noms techniques existants peuvent garder capture pour éviter refactor risqué.
