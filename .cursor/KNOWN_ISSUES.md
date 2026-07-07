# KNOWN_ISSUES - CatDex

Dernière vérification code: 2026-07-07.

## Produit / gameplay
- Le wording visible contient encore "Capturer", "Chasseur" à certains endroits, alors que la direction cible préfère observer/documenter.
- Missions `distance_km` et `observations` définies mais non incrémentées.
- Saisons: progress local, pas de flow complet de claim/reward.
- `isFirstDiscoverer` passé true dans confirm pour nouvelle création; pas de re-observation communautaire complète.

## Architecture / data
- Level math client (`LEVEL_THRESHOLDS`) différent de la RPC DB `award_xp`.
- Badge catalogs multiples: gameplay, DB seeds, mock.
- Social likes/comments local MMKV, pas persisté Supabase malgré tables/services partiels.
- Offline queue existe, mais expérience post-enqueue reste simple.

## UI / accessibilité / perf
- Reduced motion partiel: plusieurs animations continues non encore gated.
- `ProgressBar` role présent mais `accessibilityValue` à auditer.
- Dual token legacy: `constants/theme.ts`, `components/ui.tsx`, `AuthCard`.
- Carte peut devenir coûteuse si nombre de markers augmente; pas de clustering.

## Privacy
- Les coordonnées stockées côté cat sont approximées/jitterées, mais toute évolution map/focus doit être auditée pour ne jamais exposer de position exacte en UI.
