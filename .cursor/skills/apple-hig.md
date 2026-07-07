# Skill - Apple HIG appliqué à CatDex

## Quand l'utiliser
Écrans `app/`, navigation Expo Router, permissions camera/location, sheets, modals, tab bar, touch targets.

## Principes CatDex
- Clarté: zone, action, reward et état doivent être évidents.
- Contrôle: permission refusée ou offline ne doit pas casser l'app sans alternative.
- Profondeur: glass, sheets et transitions expliquent le contexte, pas juste décorer.
- Touch: 44px minimum, actions capture/progression accessibles au pouce.

## Checklist
- Safe areas respectées (`SafeAreaView`, insets tab/map).
- CTA principal unique.
- Permission copy indique bénéfice et privacy.
- Back/close disponible dans flows secondaires.
- Feedback pressed/loading/disabled.

## Erreurs à éviter
Pattern desktop, icône sans label, modal pour flow long, tab/FAB qui concurrence la sheet, action critique trop proche du bord.

## Exemples CatDex
- Map: sheet zone + CTA plutôt que overlay dense.
- Capture: étapes courtes et stack modal slide_from_bottom.
- DailyBonusModal: célébration brève, dismiss claire.

## Documents à charger
Toujours charger `@.cursor/CATDEX_CONTEXT.md` puis les docs/rules cités par la tâche.
