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
npm start
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

# Démarrer sur iOS
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

## Licence

Voir [LICENSE](./LICENSE)
