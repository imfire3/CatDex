# Skill - Accessibility

## Quand l'utiliser
- Creation/review de composants interactifs.
- Ecrans avec carte, camera, modals, icon buttons ou animations.
- Validation avant merge d'une UI.

## Principes cles
- Perceptible, utilisable, comprehensible, robuste.
- Information jamais uniquement par couleur ou mouvement.
- Controle utilisateur et alternative textuelle pour contenus visuels.
- Zones tactiles minimum 44px.

## Checklist
- accessibilityLabel et role sur controles non textuels.
- Contraste suffisant sur glass/gradient/map.
- Textes critiques compatibles grandes tailles.
- Reduced motion respecte.
- Etats erreur et vide lisibles par texte.

## Erreurs a eviter
- Icone seule sans label.
- Texte blanc sur surface trop transparente.
- Badge rarete exprime seulement par couleur.
- Carte indispensable sans alternative descriptive.

## Exemples CatDex
- Un marker de zone doit avoir un label du type "Zone avec observations recentes", sans coordonnees exactes.
- Un badge doit avoir nom + description, pas seulement une couleur.
