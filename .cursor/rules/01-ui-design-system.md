# 01 - UI Design System

Le design system CatDex existe deja dans `constants/design-system.ts`. Toute UI doit partir des tokens DS, MOTION, ELEVATION, GRADIENTS, TEXT et des composants reutilisables.

## Regles UI
- Respecter une grille 8pt: espacements en multiples de 8 autant que possible.
- Utiliser les tokens existants avant de creer une valeur locale.
- Respecter les Apple Human Interface Guidelines: clarte, profondeur, feedback, zones tactiles 44px minimum.
- Favoriser les composants existants dans `components/ui` et `components/game`.
- Ne pas dupliquer une carte, un bouton, un champ ou un header si un composant existe.
- Garder un style premium: contraste fort, surfaces controlees, radius coherents, typographie stable.
- Limiter les styles inline aux ajustements locaux non reutilisables.
- Un ecran = hierarchie claire: titre, contexte, action principale, feedback.

## Interdits
- Spacing arbitraire non justifie.
- Couleurs hardcodees hors exception ponctuelle documentee.
- Variantes visuelles proches mais incompatibles entre elles.
