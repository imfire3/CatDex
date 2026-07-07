# GAME_DESIGN - CatDex

Dernière vérification code: 2026-07-07.

## Boucle de jeu
Explorer une zone -> observer/documenter un chat -> recevoir analyse et récompense -> enrichir le ChatDex -> progresser via missions/badges/streaks -> revenir explorer.

## XP (`gameplay/xp/xp-rules.ts`)
- Découverte: 100 XP.
- Premier découvreur: 500 XP.
- Série quotidienne: 200 XP.
- Nouveau quartier: 300 XP.
- Mission accomplie: 150 XP base.
- Défi saisonnier: 400 XP défini mais completion non câblée.
- Thresholds client: 19 niveaux cumulés de 0 à 70000 XP.

## Missions (`gameplay/missions/mission-definitions.ts`)
Daily: trois rencontres, balade urbaine, photo marathon, nouveau territoire. Weekly: chasseur actif, observateur, pionnier. Progress local MMKV via `missionStore`.

## Badges
Gameplay IDs: explorer, photographer, collector, night_explorer, cats_100/500/1000, streak_7. DB seed contient aussi first_step, night_owl, legend, cat_friend, rainy, social. Toute évolution doit réconcilier catalogues.

## Rétention
- Daily bonus XP selon streak (`daily-bonus.ts`).
- First discovery of day: +100 XP dans `gameplay.service.ts`.
- Streak freeze possible si un seul jour manqué.
- DailyBonusModal sur map après 600ms si claimable.

## Saisons
`getCurrentSeason()` choisit une saison mensuelle; progress local via `seasonStore`; pas encore de claim/reward UI complet.

## Rareté et modèles
Analyse simulée déterministe: 72% commun, 20% rare, 8% légendaire. Modèles: black_short, white_short, orange_short, tabby_short, calico_long, gray_long, siamese_short, tuxedo_short.

## Principes de balancing
Récompenser la qualité et diversité d'observation, jamais le spam ni la traque. Les missions distance/observations sont dette tant qu'elles ne sont pas câblées.
