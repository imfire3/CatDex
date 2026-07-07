# Skill - Apple Human Interface Guidelines

## Quand l'utiliser
- Creation ou review d'ecrans iOS/React Native.
- Decisions de navigation, hierarchy, feedback, sheets, permissions.
- Ajustements de touch targets, spacing, typographie et gestes.

## Principes cles
- Clarte: l'utilisateur comprend l'etat et l'action suivante.
- Deference: le contenu prime sur le chrome UI.
- Profondeur: transitions et couches aident la comprehension.
- Controle utilisateur: pas d'action irreversible sans feedback.
- 44px minimum pour les zones tactiles.

## Checklist
- Action principale visible et accessible au pouce.
- Navigation coherente avec Expo Router et les patterns iOS.
- Permission demandee avec contexte et benefice.
- Sheet/modal utilisee pour une decision courte, pas un flow complexe.
- Etat pressed/disabled/loading present.

## Erreurs a eviter
- Copier des patterns desktop.
- Multiplier les boutons concurrents.
- Masquer une action critique dans une icone non labelisee.
- Ignorer safe areas et bottom tabs.

## Exemples CatDex
- Une demande de localisation doit expliquer qu'elle sert a proposer des zones proches, jamais des adresses exactes.
- Une celebration de decouverte doit etre courte et laisser continuer l'exploration.
