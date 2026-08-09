# Fonctionnalités — CatDex

**Ton quartier. Tes chats.**

Carte publique des fonctionnalités du produit (ce que le repo expose côté app).
L’analyse IA et les clés serveur restent **privées** — voir [SECURITY.md](../SECURITY.md).

---

## Parcours principal

1. **Compte** — inscription / connexion (e-mail ; Google / Apple optionnels)
2. **Onboarding game-feel** (3 écrans, permissions plus tard) — voir ci-dessous
3. **Carte** — quartier, pins de chats, recentrage GPS
4. **Scanner** — photo (caméra ou galerie) + permissions in-map
5. **Analyse** — l’app appelle *ton* API privée (`EXPO_PUBLIC_API_URL`)
6. **Découverte** — fiche chat, rareté, placement sur la carte
7. **CatDex** — collection personnelle
8. **Missions** — objectifs de progression
9. **Profil** — stats, réglages, suppression de compte

---

## Onboarding (trilogy)

Screenshots publics : `screenshots/app/04-intro.png` · `05-scan.png` · `06-reward.png`

| Étape | Écran | Message | CTA |
|-------|-------|---------|-----|
| 1 | Apparition | « Un chat vient d’apparaître près de toi » | Partir explorer |
| 2 | Analyse IA | « L’IA découvre qui il est » (race, couleur, pelage, pose…) | Trouver mon premier chat |
| 3 | Récompense | « Nouveau chat ! » — carte (ex. Miel #042) + XP / badges | Commencer ma collection |

Les autorisations GPS / caméra sont demandées **au bon moment** (in-map), pas pendant cette intro.

---

## Modules

### Auth
- E-mail / mot de passe
- Session persistante (Supabase Auth)
- OAuth Google / Apple (flags `EXPO_PUBLIC_AUTH_*`, providers dashboard)
- Mode local (mock) si Supabase n’est pas configuré
- Onboarding immersif 3 étapes (ci-dessus)

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
