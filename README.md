
# CatDex

Application mobile **React Native (Expo)** pour chasser les chats de rue, créer des cartes virtuelles et remplir son ChatDex.

## Stack

- Expo Router + React Native
- Supabase (auth, base de données, storage)
- NativeWind (Tailwind)
- React Native Maps
- Expo Camera + analyse IA (OpenAI optionnelle)

## Démarrage

1. Copier `.env.example` vers `.env` et renseigner Supabase.
2. Exécuter `supabase/schema.sql` puis `supabase/storage.sql` dans Supabase.
3. Activer Google et Apple OAuth dans Supabase Auth si besoin.
4. Installer les dépendances :

```bash
npm install
```

5. Lancer l'app :

```bash
npx expo start
```

## Écrans MVP

- Splash
- Connexion / inscription (email, Google, Apple)
- Onboarding prévention
- Carte publique par zones
- Capture caméra
- Création de carte chat (IA couleur/race/motif)
- Détail chat
- Mon ChatDex
- Profil utilisateur

## Notes produit

- Les chats sont visibles publiquement par **zone**, jamais à l'adresse exacte.
- Une seule fiche par chat grâce à une clé de déduplication (`dedup_key`).
- Collection fun pour l'instant (pas de mode perdu/retrouvé).

## Legacy

L'ancienne version web Vite est archivée dans `legacy-web/`.
