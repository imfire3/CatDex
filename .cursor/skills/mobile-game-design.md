# Skill - Mobile Game Design CatDex

## Quand l'utiliser
XP, missions, badges, streaks, daily bonus, seasons, rewards, retention, celebration.

## Connaissance code
- XP: `gameplay/xp/xp-rules.ts`.
- Missions: `gameplay/missions/mission-definitions.ts`, `mission-store.ts`, `hooks/useMissions.ts`.
- Badges: `gameplay/badges/badge-definitions.ts`, `services/badges.service.ts`.
- Retention: `gameplay/retention/*`, `hooks/useRetention.ts`.
- Discovery: `services/gameplay.service.ts`, `gameplay/discovery/discovery-rewards.ts`.

## Principes
Boucle courte, reward lisible, pas de pression punitive, pas de traque. Valoriser diversité de zones, première découverte, qualité documentation, streak doux.

## Checklist
- Comportement encouragé identifié.
- Reward proportionné.
- Anti-abus prévu.
- Pas d'exposition de position exacte.
- Impact sur missions/badges/DB compris.

## Erreurs à éviter
Multiplier devises, ajouter rareté anxiogène, récompenser spam, oublier catalogues badges DB/gameplay, introduire saison sans claim.

## Documents à charger
Toujours charger `@.cursor/CATDEX_CONTEXT.md` puis les docs/rules cités par la tâche.
