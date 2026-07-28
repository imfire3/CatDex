# CatDex

Application mobile (iOS & Android) pour capturer de vrais chats dans la rue, les analyser à l’IA, les placer sur une carte et construire un CatDex.

Slogan : **Ton quartier. Tes chats.**

## Stack

- **App** : Expo 57 · React Native · TypeScript · Expo Router
- **API** : Hono · OpenAI Vision (`gpt-4o-mini` par défaut)
- Zone MVP : Paris 20e (warning hors zone en dev, capture autorisée)

## Démarrer

### 1. API

```bash
cp server/.env.example server/.env
# Ajoute ta clé OpenAI dans server/.env
npm run server
```

Sans clé OpenAI, l’API renvoie une analyse mock pour pouvoir tester le flow.

### 2. App

```bash
npm start
```

Sur un **appareil physique**, pointe l’API vers ton Mac :

```bash
EXPO_PUBLIC_API_URL=http://TON_IP_LOCALE:8787 npm start
```

## Parcours V1

Login (Apple / Google / e-mail stub) → Carte → Scanner → Analyse IA → Découverte → CatDex + pin carte

Onglets : Carte · CatDex · Missions · Profil (+ FAB Scanner)
