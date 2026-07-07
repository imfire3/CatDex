# Skill - Design System

## Quand l'utiliser
- Creer ou harmoniser composants, tokens, cards, buttons, chips, headers.
- Faire une review de coherence visuelle.
- Reduire duplication UI.

## Principes cles
- `constants/design-system.ts` est la source de verite.
- `components/ui` et `components/game` doivent etre preferes aux implementations locales.
- 8pt grid, radius coherents, typographie stable, couleurs tokenisees.
- Une variante reutilisable vaut mieux que trois copies legerement differentes.

## Checklist
- Tokens DS/TEXT/MOTION utilises.
- Espacements en multiples de 8 quand possible.
- Touch targets conformes.
- Variantes nommees et limitees.
- Pas de couleur ou radius local si un token existe.

## Erreurs a eviter
- Ajouter un nouveau composant sans chercher l'existant.
- Duplications de cartes glass ou boutons gradient.
- Styles inline massifs dans les routes.

## Exemples CatDex
- Utiliser `ScreenHeader`, `GlassCard`, `ProgressBar`, `TagChip` ou equivalents existants avant d'en creer de nouveaux.
- Une fiche chat doit partager les memes tokens de rarete que le reste du ChatDex.
