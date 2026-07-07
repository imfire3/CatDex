# PROJECT_ARCHITECTURE - CatDex

Dernière vérification code: 2026-07-07.

## Stack active
- Expo 54, React Native 0.81, React 19, TypeScript.
- Expo Router file-based routing: `app/`.
- Supabase: auth, profiles, cats, captures, zones, badges, friends, notifications.
- React Query: cache serveur via `hooks/useGameData.ts` et `providers/QueryProvider.tsx`.
- Zustand + MMKV: drafts capture, filtres ChatDex, missions, retention, social local, auth guest.
- Reanimated: transitions, press scale, pulses, reveal/celebration.
- Maps: `GameMap.tsx` route Web -> Mapbox si disponible -> react-native-maps.

## Root shell
- `app/_layout.tsx`: `GestureHandlerRootView`, `AppProviders`, stack sans header.
- `providers/AppProviders.tsx`: QueryProvider -> AuthProvider -> LocationProvider -> UIProvider -> SessionEffects.
- `SessionEffects`: sync offline au démarrage, auto-sync toutes les 30s, touch daily streak si session+profile.

## Routes principales
- Entry: `app/index.tsx` + `hooks/useAuthGate.ts`.
- Auth: `app/(auth)/login.tsx`, `signup.tsx`.
- Onboarding réel: welcome -> permissions -> introduction -> avatar -> username -> tabs/map.
- Tabs: map, capture-tab FAB, chatdex, profile.
- Capture stack: index camera -> loading AI -> analysis -> confirm -> celebration.
- Meta: cat detail, missions, badges, friends, leaderboard, menu, settings.

## Providers et hooks
- `AuthProvider`: session/profile Supabase, refreshProfile.
- `LocationProvider`: foreground location, fallback Paris, permission state.
- `UIProvider`: état UI onboarding/avatar local.
- `useGameData`: zones, nearby cats, captures, stats, badges, friends.
- `useMissions`: definitions + MMKV missionStore + season.
- `useRetention`: daily bonus, first discovery, unclaimed missions.
- `useReduceMotion`: `AccessibilityInfo` reduceMotionChanged.

## Stores MMKV/Zustand
- `useCaptureStore`: photo, compressedUri, analysis, discoveryResult, catName, note, lat/lng, zoneId, existingCatId; persisté `capture-draft`.
- `useAppStore`: searchQuery, chatdexFilter, pendingMapFocus.
- `missionStore`: daily/weekly mission progress local.
- `seasonStore`: season progress local.
- `retentionStore`: daily bonus, dismissed prompt, streak freeze, first discovery date.
- `socialStore`: likes/comments locaux non synchronisés Supabase.
- `syncService`: queue offline `create_cat` / `add_capture`.

## Services
- `auth.service.ts`: permissions, onboarding sync, streak/freeze.
- `cats.service.ts`: zones, cats, captures, favorites, observations, createFromCapture.
- `gameplay.service.ts`: analysis, processDiscovery, XP, missions, badges, daily bonus, social local.
- `map.service.ts`: current location, nearby filter 4 km, cache cats 5 min.
- `badges.service.ts`: badges Supabase.
- `friends.service.ts`: friends + leaderboard.
- `camera.service.ts`: compression 1280px / qualité 0.72.
- `notifications.service.ts`: notifications app.
- `sync.service.ts`: upload queue retry max 3, auto-sync.

## Frontières à respecter
- `app/`: composition route et navigation, pas de logique lourde.
- `components/`: UI réutilisable.
- `components/game`: chrome game, cards, capture, progression.
- `components/map`: abstraction map + sheet/controls.
- `services/`: IO, Supabase, side effects.
- `gameplay/`: règles pures ou stores de jeu.
- `lib/`: adapters, zones, auth helpers, Supabase, storage.
- `constants/`: tokens, query keys, contenus stables.

## Flutter best practices transposées
Le projet n'est pas Flutter. Quand une rule demande Flutter Best Practices, traduire les principes en React Native: petits composants composables, state explicite, rebuilds limités, logique hors render, navigation claire, widgets/components réutilisables, props typées, side effects isolés.

## Vérifications utiles
- TypeScript: `npm run lint` (`tsc --noEmit`).
- Flow scripts: `npm run test:flow`, `npm run test:all` si pertinents.
- Pas de build/test obligatoire pour changement documentation-only `.cursor`.
