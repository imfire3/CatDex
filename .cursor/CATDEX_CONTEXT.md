# CATDEX_CONTEXT - Mémoire centrale CatDex

Dernière vérification code: 2026-07-07. Toujours lire ce fichier avant une tâche CatDex.

## Index vivant
- Vision: `PRODUCT_VISION.md`
- Architecture: `PROJECT_ARCHITECTURE.md`
- Design: `DESIGN_SYSTEM.md`, `UI_GUIDELINES.md`, `COMPONENT_LIBRARY.md`
- UX: `UX_GUIDELINES.md`
- Gameplay: `GAME_DESIGN.md`
- Motion: `ANIMATION_GUIDELINES.md`
- Copy: `COPYWRITING_GUIDELINES.md`
- Fonctionnalités: `FEATURES.md`
- Roadmap: `ROADMAP.md`
- Dette/issues: `KNOWN_ISSUES.md`, `TECH_DEBT.md`
- Décisions: `DECISIONS.md`
- Historique config: `CHANGELOG.md`

## Concept
CatDex est une app mobile Expo/React Native où l'utilisateur observe, découvre et documente des chats de rue par zones pour enrichir son ChatDex, gagner XP/badges/missions et progresser dans une expérience premium inspirée jeux d'exploration.

## Stack
Expo Router, React Native, TypeScript, Supabase, React Query, Zustand+MMKV, Reanimated, Expo Camera/Location, react-native-maps/Mapbox fallback, NativeWind installé mais app surtout StyleSheet+tokens.

## Flow principal réel
Splash/auth gate -> login/signup/guest -> onboarding welcome/permissions/introduction/avatar/username -> map -> capture camera/loading/analysis/confirm/celebration -> cat detail ou map -> ChatDex/profile/missions/badges.

## Règles non négociables
- Ne jamais afficher position exacte, adresse ou coordonnée précise d'un chat en UI.
- Préférer observer, découvrir, documenter, ajouter au ChatDex; éviter capturer/chasser/traquer en UI nouvelle.
- Utiliser design system DS/TEXT/MOTION/ELEVATION/GRADIENTS/RARITY_COLORS.
- Mobile first, Apple HIG, 8pt grid, touch targets 44px+.
- Pas de duplication UI, pas de refactor global, pas de code inutile.
- Reduced motion, accessibilité et performance à considérer par défaut.
- Mettre à jour la documentation vivante si une feature importante change.

## Sources code à connaître
- Routes: `app/`.
- Providers: `providers/`.
- Stores: `stores/index.ts`, `gameplay/*/*store.ts`.
- Gameplay: `gameplay/` + `services/gameplay.service.ts`.
- Data: `services/`, `hooks/useGameData.ts`, `types/database.ts`, `supabase/schema*.sql`.
- UI: `constants/design-system.ts`, `components/ui`, `components/game`, `components/map`, `components/auth`, `components/feedback`.

## Dette prioritaire
Privacy map à auditer, missions partiellement câblées, badges/catalogues multiples, level curve client/DB divergente, social local, reduced motion incomplet, legacy theme/ui.
