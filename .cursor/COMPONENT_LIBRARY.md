# COMPONENT_LIBRARY - CatDex

Dernière vérification code: 2026-07-07.

## Primitives UI (`components/ui/`)
- `ScreenBackground`: shell gradient par variante.
- `GameTextField`: input glass, label, multiline, accessibilité.
- `IconButton`: bouton icône circulaire, variants glass/dark/light, label obligatoire.
- `Chip`: filtre sélectionnable avec `accessibilityState.selected`.
- `TagChip`: tag readonly coloré.
- `ProgressBar`: progress gradient, role progressbar.
- `SectionLabel`: label section uppercase.
- `LinkRow`: row settings/menu avec icon, subtitle, badge, highlight.

## Game chrome (`components/game/`)
- `GlassCard`: carte glass standard, elevated, subtle.
- `FloatingButton`: CTA gradient/ghost/glass/capture, press scale.
- `ScreenHeader`: header safe-area avec back.
- `MenuRow`: row menu simple.
- `PokeballButton`: shutter/capture avec pulse.
- `XpBar`, `StatBar`: progression.
- `StreakPill`, `StreakWeek`: streak.
- `ProgressDots`: onboarding.
- `MapCatMarker`: marker memoïsé, discovered/silhouette.
- `CatDexTile`: tile collection memoïsée.
- `CatAvatar3D`, `CatRevealStage`: avatar/reveal procédural.
- `DailyGoalsCard`, `DailyBonusModal`: retention.

## Map (`components/map/`)
- `GameMap`: route Web -> Mapbox -> Native.
- `GameMapNative`: react-native-maps, `tracksViewChanges={false}`.
- `GameMapMapbox`: Mapbox PointAnnotation si token/module disponibles.
- `GameMapWeb`: fallback léger.
- `MapBottomSheet`: sheet zone + CTA.
- `MapControls`: recenter FAB.

## Auth / feedback / ChatDex
- Auth: `AuthBackground`, `AuthCard`, `GradientButton`, `SocialAuthRow`.
- Feedback: `LoadingView`, `EmptyState`, `ErrorState`, `Skeleton`, `SkeletonCard`.
- ChatDex: `ChatDexToolbar` recherche + chips.

## Règle anti-duplication
Avant de créer un composant, chercher dans cette bibliothèque. Si un nouveau composant est nécessaire, l'ajouter à ce fichier et justifier la variante.
