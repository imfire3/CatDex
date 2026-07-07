# TECH_DEBT - CatDex

## Dette à éviter
- Ajouter une troisième source de tokens ou une nouvelle variante card/button locale.
- Mettre logique gameplay dans `app/` au lieu de `gameplay/` ou `services/`.
- Ajouter des watchers location sans cleanup.
- Faire des calculs de reward ou filtrage lourd dans render.
- Modifier routes/config build pour un besoin UI local.

## Dette existante suivie
1. `theme.ts`/`ui.tsx` legacy vs DS canonique.
2. Badges: gameplay/DB/mock non alignés.
3. Level curve client vs DB RPC.
4. Missions partiellement câblées.
5. Social local non sync.
6. Reduced motion incomplet.
7. Privacy map à auditer régulièrement.
8. Settings/friends partiellement stubbés.

## Politique
Quand un agent touche une zone endettée, il doit soit corriger dans le scope, soit ajouter/mettre à jour une note dans ce fichier et `KNOWN_ISSUES.md`.
