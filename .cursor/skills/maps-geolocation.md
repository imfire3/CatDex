# Skill - Maps & Geolocation CatDex

## Quand l'utiliser
Carte, zones, location permission, markers, pendingMapFocus, capture zone, privacy.

## Sources code
`services/map.service.ts`, `lib/zones.ts`, `providers/LocationProvider.tsx`, `components/map/*`, `app/(tabs)/map.tsx`, `stores/index.ts`, `cats.service.ts`.

## Règles privacy
- UI par zones/quartiers, jamais adresse exacte.
- Coordonnées de chats stockées/affichées doivent être approximées/jitterées; ne jamais présenter comme exactes.
- Ne pas logguer ou exposer lat/lng exactes inutilement.
- Permission location doit expliquer bénéfice: zones proches, pas tracking animal.
- Refus permission: fallback utile mais transparent.

## Checklist
- Marker représente observation approximative ou zone, pas animal en temps réel.
- Sheet affiche zone/city, pas adresse.
- `pendingMapFocus` audité si utilisé.
- Radius 4 km et nearbyZones cohérents.
- No exact coordinates in copy/debug UI.

## Erreurs à éviter
"Viens ici", pin exact, distance au mètre vers un chat, suivi live, coordonnées dans params visibles.

## Documents à charger
Toujours charger `@.cursor/CATDEX_CONTEXT.md` puis les docs/rules cités par la tâche.
