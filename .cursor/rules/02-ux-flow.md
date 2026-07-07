---
description: CatDex mobile UX flows and friction rules.
globs: app/**/*.tsx,components/**/*.tsx,hooks/**/*.ts
---
# 02 - UX Flow

## Flow canonique
Auth/guest -> onboarding -> carte par zones -> observation/photo -> analyse -> confirmation -> célébration -> fiche/ChatDex/progression.

## Règles UX
- Un écran = une intention dominante + CTA clair.
- Permissions expliquées au moment utile, avec bénéfice et alternative.
- Toujours prévoir loading, empty, error, permission denied/offline si data ou IO.
- Carte = zones et opportunités, jamais adresse exacte.
- Capture/documentation doit rester courte: prendre photo, analyser, vérifier, nom/note, ajouter.
- Célébration brève, lisible et compatible reduced motion.
- Ne jamais bloquer sans sortie.

## Sources à charger
`@.cursor/UX_GUIDELINES.md`, `@.cursor/FEATURES.md`, `@.cursor/skills/laws-of-ux.md`, `@.cursor/skills/apple-hig.md`.
