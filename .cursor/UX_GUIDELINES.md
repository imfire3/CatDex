# UX_GUIDELINES - CatDex

## Boucle principale
Onboarding -> carte par zones -> observation/photo -> analyse -> confirmation -> célébration -> fiche/ChatDex -> missions/progression.

## Critères UX par flow
- Auth: proposer login/signup/guest, revenir par `app/index.tsx` gate.
- Onboarding: expliquer permissions avant demande; skippable mais capture complète nécessite location/camera.
- Map: zone active, objectifs du jour, streak, capture CTA, sheet claire.
- Capture: caméra -> loading IA -> review analyse -> nom/note -> ajout.
- Celebration: XP, rareté, badges, level-up, sortie vers fiche ou map.
- ChatDex: recherche/filtre lisibles, empty state motivant.
- Profil: stats, streak, daily bonus, accès missions/badges/friends/leaderboard/settings.

## Etats obligatoires
Loading, empty, error, permission denied, offline/queue si réseau absent.

## Simplicité
Un écran = une intention dominante. Si deux CTA se concurrencent, clarifier le flow avant de coder.
