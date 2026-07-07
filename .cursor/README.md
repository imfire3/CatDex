# Cursor Setup CatDex

Ce dossier transforme Cursor en equipe d'agents specialises pour CatDex. Il documente les regles produit/design/dev, les skills operationnels, les agents et les prompts prets a copier.

## Dossiers
- `rules/`: contraintes courtes et actionnables a charger selon le type de tache.
- `skills/`: methodes de travail detaillees avec checklists et exemples CatDex.
- `agents/`: profils d'agents specialises avec prompt systeme pret a copier.
- `prompts/`: prompts prets a lancer pour reviews et planning.
- `CATDEX_CONTEXT.md`: memoire produit et technique commune.

## Comment utiliser les agents
1. Ouvrir le fichier d'agent dans `.cursor/agents/`.
2. Copier le bloc "Prompt systeme pret a copier".
3. Le coller dans Cursor Agent ou dans le prompt de tache.
4. Ajouter le fichier ou l'ecran a analyser et demander une sortie concrete: risques, recommandations, patch minimal.

## Quel agent choisir
- Lead Product Designer: UI, UX, Apple HIG, design system, coherence globale.
- Mobile Game Designer: XP, missions, badges, rewards, retention.
- Flutter Architect: architecture mobile adaptee a Expo/React Native, widgets/components, state, navigation, qualite code.
- UI Consistency Reviewer: audit visuel strict, spacing, typography, radius, composants.
- Motion Designer: animations, haptics, feedback, game feel.
- Performance Engineer: FPS, rebuilds, images, lazy loading, optimisations.
- CatDex Vision Keeper: arbitrage produit, securite chats, refus des derives.

## Quand utiliser chaque rule
- Toujours: `00-product-vision`, `08-quality-review`.
- UI/ecrans: `01-ui-design-system`, `02-ux-flow`, `06-accessibility`, `07-copywriting-fr`.
- Gameplay: `03-game-design`.
- Code: `04-mobile-architecture`, `05-performance`.
- Carte/localisation: `00-product-vision`, `02-ux-flow`, `06-accessibility`, plus skill maps-geolocation.

## Quand utiliser chaque skill
- `apple-hig`: navigation, permissions, sheets, touch targets.
- `laws-of-ux`: simplification de flows et priorisation mobile.
- `mobile-game-design`: boucle de jeu, missions, progression.
- `gamification`: XP, badges, streaks, rewards.
- `design-system`: composants, tokens, coherence UI.
- `motion-design`: animations, haptics, celebrations.
- `accessibility`: labels, contraste, reduced motion.
- `performance`: carte, camera, listes, images, renders.
- `maps-geolocation`: zones, permissions, privacy, securite des chats.
- `catdex-product-thinking`: priorisation et refus de scope incoherent.

## Lancer une review UI
Utiliser `.cursor/prompts/ui-review.md` avec l'agent UI Consistency Reviewer ou Lead Product Designer. Joindre les fichiers d'ecran/composants concernes et demander des references fichier/ligne.

## Lancer une review UX
Utiliser `.cursor/prompts/ux-flow-review.md` avec Lead Product Designer et CatDex Vision Keeper. Demander le flow actuel, les frictions, les risques et un plan de correction minimal.

## Lancer une review performance
Utiliser `.cursor/prompts/performance-review.md` avec Performance Engineer. Demander de cibler renders, listes, images, carte, camera, geolocation et animations.

## Lancer une review architecture
Utiliser `.cursor/prompts/code-quality-review.md` avec Flutter Architect. Preciser que CatDex est Expo/React Native et demander une evaluation scopee sans refactor global.

## Eviter que Cursor modifie trop de choses
- Demander explicitement: "Ne modifie que les fichiers listés".
- Ajouter: "Pas de refactor global, pas de changement de dependance, pas de config build".
- Demander une phase review avant patch.
- Limiter la tache a un ecran, un composant ou un flow.
- Exiger une checklist avant/apres et un resume des fichiers touches.
