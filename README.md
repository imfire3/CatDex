# CatDex

Application mobile (iOS & Android) pour capturer de vrais chats dans la rue, les analyser à l'IA, les placer sur une carte et construire un CatDex.

Slogan : **Ton quartier. Tes chats.**

## Stack

- **App** : Expo 54 · React Native · TypeScript · Expo Router
- **Backend** : Supabase (Auth, Database, Storage)
- **API** : Hono · OpenAI Vision (`gpt-4o-mini` par défaut)
- Zone MVP : Paris 20e (warning hors zone en dev, capture autorisée)

## Démarrer

### 1. Configuration Supabase

**Important** : Supabase est requis pour l'authentification et le stockage des données.

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Suivez le guide complet : **[supabase/README.md](./supabase/README.md)**
4. Copiez vos clés dans `.env` :

```bash
cp .env.example .env
# Ajoutez vos clés Supabase dans .env
```

### 2. API (Analyse IA)

```bash
cp server/.env.example server/.env
# Ajoute ta clé OpenAI dans server/.env
npm run server
```

Sans clé OpenAI, l'API renvoie une analyse mock pour pouvoir tester le flow.

### 3. App

```bash
npm install
cp .env.example .env   # puis colle ta clé anon Supabase
npm start
```

### Simulateur iOS (Mac)

Prérequis : **Xcode** (App Store) + un iPhone Simulator + **Node 20+**.

```bash
git pull origin main
npm install
cp .env.example .env   # si besoin — renseigne EXPO_PUBLIC_SUPABASE_ANON_KEY
npm run ios:sim
```

Ça démarre le Simulator, installe Expo Go (SDK 54) si possible, puis Metro.
Dans le terminal Expo : `i` = rouvrir iOS · `r` = reload · `shift+m` = menu.

Sans script :

```bash
open -a Simulator
npx expo start --ios --go --clear
```

Sur un **appareil physique**, pointe l'API vers ton Mac :

```bash
EXPO_PUBLIC_API_URL=http://TON_IP_LOCALE:8787 npm start
```

## Parcours V1

Login (Apple / Google / email) → Carte → Scanner → Analyse IA → Découverte → CatDex + pin carte

Onglets : Carte · CatDex · Missions · Profil (+ FAB Scanner)

## Configuration Supabase

L'application utilise Supabase pour :

- ✅ **Authentification** : Email/Password, Google OAuth, Apple OAuth
- ✅ **Base de données** : PostgreSQL avec PostGIS pour la recherche géospatiale
- ✅ **Storage** : Stockage des photos de chats
- ✅ **Sécurité** : Row Level Security (RLS) activé

### Fonctionnalités disponibles

- Création de compte et connexion
- Profils utilisateurs
- Ajout de chats découverts avec photos
- Carte interactive avec recherche de chats à proximité
- Historique des observations
- Upload sécurisé de photos

### Guide complet

Consultez **[supabase/README.md](./supabase/README.md)** pour :
- Configuration étape par étape
- Création des tables
- Configuration OAuth (Google/Apple)
- Configuration du Storage
- Exemples d'utilisation
- Dépannage

## Structure du projet

```
catdex/
├── app/                    # Routes Expo Router
│   ├── (auth)/            # Écrans d'authentification
│   ├── (tabs)/            # Navigation principale
│   └── _layout.tsx        # Layout racine
├── src/
│   ├── components/        # Composants réutilisables
│   ├── lib/              # Utilitaires
│   │   ├── supabase.ts   # Client Supabase
│   │   ├── supabaseQueries.ts    # Requêtes DB
│   │   └── supabaseStorage.ts    # Gestion des photos
│   ├── store/            # État global (Zustand)
│   ├── theme/            # Design system
│   └── types/            # Types TypeScript
├── supabase/
│   ├── schema.sql        # Schéma de base de données
│   └── README.md         # Guide de configuration
└── server/               # API Hono (analyse IA)
```

## Développement

### Commandes utiles

```bash
# Démarrer l'app
npm start

# Démarrer sur iOS (simulateur Mac)
npm run ios:sim

# Expo iOS classique
npm run ios

# Démarrer sur Android
npm run android

# Démarrer sur Web
npm run web

# Démarrer le serveur API
npm run server

# Linter
npm run lint

# Vérification TypeScript
npm run typecheck
```

### Variables d'environnement

Créez un fichier `.env` à la racine avec :

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key

# API (optionnel)
EXPO_PUBLIC_API_URL=http://localhost:8787
```

## 🚀 Setup Rapide - Mettre CatDex en Ligne

### Option 1 : Tester sur Ton Téléphone Maintenant (2 min)

**👉 [Guide Ultra Rapide Téléphone](./PHONE_QUICKSTART.md)** ⚡

```bash
npm start
# Scanne le QR code avec Expo Go
```

### Option 2 : Déployer l'API Backend (10 min)

**👉 [Guide Setup Render.com](./RENDER_SETUP_GUIDE.md)** 📦

**Ou utilise le script interactif** :
```bash
./scripts/setup-render.sh
```

**Ce dont tu as besoin** :
- 🔑 Clé OpenAI → [KEYS_TO_GET.md](./KEYS_TO_GET.md)
- 🗄️ Projet Supabase → [KEYS_TO_GET.md](./KEYS_TO_GET.md)
- 🚀 Compte Render.com (gratuit)

**Résumé** :
1. Obtenir les 3 clés (5 min) → [KEYS_TO_GET.md](./KEYS_TO_GET.md)
2. Déployer sur Render (2 min) → [RENDER_CHEATSHEET.md](./RENDER_CHEATSHEET.md)
3. Tester l'app (3 min)

**Coût** : ~3-5€/mois (OpenAI) + Gratuit (Supabase + Render)

## 🚀 Déploiement en Production

Pour déployer CatDex en ligne et le partager avec tes amis :

**👉 [Guide de Déploiement Complet](./DEPLOYMENT.md)**

Guides détaillés :

- **[Test sur Téléphone](./docs/TEST_ON_PHONE.md)** - Guide complet pour mobile
- **[Déploiement API (Render/Railway)](./docs/RENDER_DEPLOYMENT.md)** - Backend en 10 minutes
- **[Déploiement Mobile (iOS/Android)](./docs/MOBILE_DEPLOYMENT.md)** - Publication sur les stores
- **[Déploiement Web (Netlify/Vercel)](./DEPLOYMENT.md#-partie-2--déployer-lapplication-web)** - Version web en 5 minutes

### Résumé Rapide

```bash
# 1. Déployer l'API sur Render.com (gratuit)
# Dashboard → https://dashboard.render.com
# "New" → "Blueprint" → Sélectionne le repo CatDex

# 2. Déployer l'app web
npm install -g netlify-cli
npx expo export --platform web
netlify deploy --prod --dir dist

# 3. Build l'app mobile
npm install -g eas-cli
eas build --platform all --profile production
```

**URL de l'API par défaut** : `https://catdex-api.onrender.com` (à remplacer par la tienne)

## Licence

Voir [LICENSE](./LICENSE)
