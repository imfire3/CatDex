# CatDex Context

## Vision produit
CatDex est une experience mobile premium d'exploration urbaine ou les utilisateurs observent, decouvrent et documentent des chats de rue pour construire un ChatDex personnel et communautaire.

## Resume du concept
- Explorer des zones proches.
- Observer un chat de facon responsable.
- Documenter une fiche avec photo/analyse/couleur/race/motif si disponible.
- Ajouter la fiche au ChatDex.
- Gagner XP, badges, missions et progression de collection.

## Stack technique
- Expo Router + React Native + TypeScript.
- Supabase pour auth, base de donnees et storage.
- React Query pour cache/data fetching.
- Zustand pour state local.
- NativeWind / Tailwind pour styling.
- React Native Maps et Mapbox RN selon plateforme.
- Expo Camera, Location, Image Picker, Reanimated.
- Legacy web Vite archive dans `legacy-web/`.

## Principes UI
- Mobile-first, premium, lisible, une main.
- Source de verite design: `constants/design-system.ts` (`DS`, `TEXT`, `MOTION`, `ELEVATION`, `GRADIENTS`).
- 8pt grid, touch targets 44px minimum.
- Apple HIG: clarte, feedback, safe areas, navigation familiere.
- Reutiliser `components/ui` et `components/game` avant de creer.
- Pas de duplication UI ni valeurs hardcodees inutiles.

## Principes UX
- Flow principal simple: onboarding -> carte par zones -> observation -> documentation -> celebration -> ChatDex/progression.
- Un objectif par ecran, CTA principal clair.
- Etats loading, empty, error et permission explicites.
- Animations utiles et compatibles reduced motion.
- La carte guide par zones, jamais par position exacte de chat.

## Regles de wording
- Langue: francais clair, chaleureux, premium, joueur.
- Preferer: observer, decouvrir, documenter, explorer, ajouter au ChatDex.
- Eviter en UI: capturer, traquer, chasser, adresse exacte.
- Exception: ne pas renommer aveuglement les noms techniques existants comme routes ou variables.

## Flow principal
1. Splash / auth.
2. Onboarding: introduction, avatar, username, permissions.
3. Carte publique par zones.
4. Camera / observation.
5. Analyse et confirmation.
6. Celebration / recompense.
7. Detail chat, ChatDex, missions, profil.

## Ecrans existants reperes
- Auth: login, signup.
- Onboarding: welcome, introduction, avatar, username, permissions.
- Tabs: map, ChatDex, profile, capture tab.
- Capture/documentation: index, loading, analysis, confirm, celebration.
- Detail: cat detail.
- Meta-jeu: missions, badges, leaderboard, friends, menu, settings.

## Mecaniques de jeu
- XP rules.
- Missions et mission store.
- Badges definitions.
- Daily bonus, streaks, retention nudges.
- Discovery rewards.
- Raretés: commun, rare, legendaire.

## Regles de securite
- Ne jamais afficher la position exacte des chats.
- Ne pas exposer adresse, lat/lng precise ou pin animal exact en UI.
- Utiliser zones, indices generaux et proximite floue.
- Respecter permissions et vie privee utilisateur.
- Ne pas encourager la poursuite ou capture physique d'un animal.

## Priorites MVP
- Auth fiable.
- Onboarding clair et permissions expliquees.
- Carte par zones comprehensible.
- Observation/documentation simple.
- Fiche chat de qualite.
- ChatDex personnel motivant.
- Progression XP/missions/badges basique mais coherent.

## Dette technique a eviter
- Plusieurs sources de verite pour tokens UI, XP, rarete ou wording.
- Duplications de cards, boutons, headers, chips.
- Logique metier dans les routes UI.
- Calculs lourds dans render.
- Watchers geolocation sans cleanup.
- Hardcoding de couleurs, radius, spacing et textes repetes.
- Ajouts de dependances sans justification forte.
