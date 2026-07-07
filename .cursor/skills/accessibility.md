# Skill - Accessibility CatDex

## Quand l'utiliser
Toute UI interactive, carte, camera, animations, progression, icônes, états d'erreur.

## Checklist CatDex
- `accessibilityRole` sur Pressable important.
- `accessibilityLabel` en français sur icônes et controls.
- `accessibilityState` pour selected/disabled.
- `accessibilityValue` pour progressbars quand pertinent.
- Contraste sur glass/gradient/map.
- Touch 44px+.
- Reduced motion.
- Texte de zone disponible hors carte.

## Erreurs à éviter
Rareté couleur-only, marker sans label, skeleton non stoppable, texte critique tronqué, haptic comme seul feedback.

## Exemples
- Marker: "Zone avec observations récentes" plutôt que coordonnées.
- Badge: nom + description + état unlocked.

## Documents à charger
Toujours charger `@.cursor/CATDEX_CONTEXT.md` puis les docs/rules cités par la tâche.
