---
description: CatDex gameplay, XP, missions, badges, retention.
globs: gameplay/**/*.ts,services/gameplay.service.ts,app/missions.tsx,app/badges.tsx,components/game/**/*.tsx
---
# 03 - Game Design

## Règles gameplay
- Boucle: explorer -> observer -> documenter -> progresser -> revenir.
- Récompenser observation responsable, diversité de zones et qualité de fiche.
- Pas de dark patterns, rareté anxiogène ou streak punitif.
- Aucun reward ne doit dépendre d'une localisation exacte visible.
- XP/missions/badges doivent rester alignés avec `gameplay/` et Supabase.
- Toute nouvelle mécanique doit expliquer: comportement encouragé, reward, anti-abus, impact MVP.

## Sources code
XP `gameplay/xp/xp-rules.ts`, missions `gameplay/missions`, badges `gameplay/badges`, retention `gameplay/retention`, seasons `gameplay/seasons`, models `gameplay/models`.

## Sources à charger
`@.cursor/GAME_DESIGN.md`, `@.cursor/skills/mobile-game-design.md`, `@.cursor/skills/gamification.md`.
