# Skill - Performance

## Quand l'utiliser
- Review de carte, camera, listes, animations, images et data fetching.
- Avant d'ajouter markers, sheets, effets visuels ou calculs gameplay.
- Investigation de lenteurs ou FPS bas.

## Principes cles
- Rendu mobile fluide avant sophistication visuelle.
- Calculs hors render, subscriptions nettoyees, listes bornees.
- Fetching cache via React Query quand approprie.
- Images dimensionnees et chargees progressivement.

## Checklist
- Aucun calcul lourd dans JSX/render.
- Markers et listes memoises ou limites si necessaire.
- Listes longues virtualisees.
- Effets et listeners avec cleanup.
- Animations compatibles 60 FPS et reduced motion.

## Erreurs a eviter
- Recalculer toutes les missions a chaque render visible.
- Re-render toute la carte sur changement mineur de UI.
- Charger images originales non redimensionnees.
- Garder un watcher geolocation actif hors besoin.

## Exemples CatDex
- Clusteriser ou simplifier les zones si trop de markers.
- Utiliser une preview optimisee pour les cartes chat dans le ChatDex.
