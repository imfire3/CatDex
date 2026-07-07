---
description: Accessibility rules for CatDex mobile game UI.
globs: app/**/*.tsx,components/**/*.tsx
---
# 06 - Accessibility

## Obligatoire
- Touch targets 44px minimum, idéalement 48px pour actions principales.
- Labels accessibles pour boutons icônes, map controls, capture, favoris.
- Ne jamais communiquer uniquement par couleur, mouvement ou haptique.
- Contraste lisible sur glass/gradients/map.
- Reduced motion pour pulses, reveals, celebrations, skeletons.
- Textes critiques lisibles avec tailles dynamiques autant que possible.
- Erreurs: expliquer problème + prochaine action.
- Carte: offrir texte/zone compréhensible hors représentation visuelle.

## Sources à charger
`@.cursor/skills/accessibility.md`, `@.cursor/UI_GUIDELINES.md`, `@.cursor/UX_GUIDELINES.md`.
