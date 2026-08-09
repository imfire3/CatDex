# Fonctionnalités — CatDex

**Ton quartier. Tes chats.**

Carte publique des fonctionnalités du produit (ce que le repo expose côté app).
L’analyse IA et les clés serveur restent **privées** — voir [SECURITY.md](../SECURITY.md).

---

## Parcours principal

1. **Compte** — inscription / connexion (e-mail ; Google / Apple optionnels)
2. **Carte** — quartier, pins de chats, recentrage GPS
3. **Scanner** — photo (caméra ou galerie) + permissions in-map
4. **Analyse** — l’app appelle *ton* API privée (`EXPO_PUBLIC_API_URL`)
5. **Découverte** — fiche chat, rareté, placement sur la carte
6. **CatDex** — collection personnelle
7. **Missions** — objectifs de progression
8. **Profil** — stats, réglages, suppression de compte

---

## Modules

### Auth
- E-mail / mot de passe
- Session persistante (Supabase Auth)
- OAuth Google / Apple (flags `EXPO_PUBLIC_AUTH_*`, providers dashboard)
- Mode local (mock) si Supabase n’est pas configuré

### Carte
- Carte interactive (MapLibre / react-native-maps selon plateforme)
- Pins des chats découverts
- Recherche / proximité (PostGIS côté Supabase)
- Permissions localisation via modales in-map

### Scanner & IA
- Capture photo / import galerie
- Envoi sécurisé (Bearer Supabase) vers l’API d’analyse
- Cutout / mise en carte (selon config serveur)
- L’API et OpenAI restent **hors secrets publics**

### CatDex & fiche chat
- Collection, détail, thème pelage / rareté (`src/lib/catTheme.ts`)
- Photos stockées (bucket Supabase) quand sync cloud

### Missions & profil
- Missions de progression
- Profil utilisateur, réglages
- Suppression de compte (endpoint API + service_role **serveur uniquement**)

### Design system
- Tokens `src/theme/` via `useTheme()`
- Composants partagés `@/components` (Button, Card, Text, sheets, glass icons…)
- Canvas `#F9F9FB` · brand indigo `#6A69F8`

---

## Plateformes

| Cible | Statut typique |
|-------|----------------|
| Web (Expo) | Bêta / démo |
| iOS (Expo Go / EAS) | Dev → TestFlight |
| Android (Expo Go / EAS) | Dev → Internal testing |

---

## Ce que le public ne voit pas

- Clés OpenAI
- `service_role` / JWT secret Supabase
- Dashboards Render / comptes stores
- Données utilisateurs de production

Pour le plan de nettoyage du repo : [`PUBLIC_REPO_AGENDA.md`](./PUBLIC_REPO_AGENDA.md).
