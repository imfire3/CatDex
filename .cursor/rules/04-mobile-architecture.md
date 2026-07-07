# 04 - Mobile Architecture

CatDex est une app Expo Router / React Native / TypeScript avec Supabase, React Query, Zustand, NativeWind et services dedies.

## Regles architecture
- Respecter les frontieres: `app/` pour routes, `components/` pour UI, `services/` pour acces metier, `gameplay/` pour regles de jeu, `hooks/` pour composition.
- Garder les ecrans minces: extraire composants et logique quand cela clarifie.
- Utiliser des composants reutilisables au lieu de dupliquer des structures UI.
- Centraliser les constantes dans `constants/` ou le domaine gameplay approprie.
- Eviter le code mort, les helpers prematurement generiques et les abstractions inutiles.
- Preferer TypeScript strict, types explicites aux frontieres et noms metier clairs.
- Ne pas melanger navigation, fetching, calcul de recompense et rendu dans un meme bloc.

## Modification minimale
Toute intervention doit etre scopee: corriger le besoin sans refactor global non demande.
