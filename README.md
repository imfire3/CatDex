# 🐱 CatDex

**Capture les chats que tu croises. Complète ton CatDex. Explore ta ville.**

CatDex est une application mobile qui transforme les chats rencontrés dans la vraie vie en une expérience de collection et d'exploration.

Prends un chat en photo, laisse CatDex l'analyser et ajoute-le automatiquement à ta collection avec ses caractéristiques, son lieu de découverte et ses statistiques.

---

## ✨ Concept

CatDex mélange :

- 📸 Capture de chats
- 🤖 Analyse par intelligence artificielle
- 🗺️ Exploration géolocalisée
- 🐱 Collection
- ⭐ Progression
- 🏆 Missions et récompenses

L'objectif est simple :

> Explorer → Trouver un chat → Le capturer → L'identifier → Compléter son CatDex → Continuer à explorer

---

## 📱 Fonctionnalités

### 📸 Scanner un chat

Photographie un chat directement depuis l'application.

CatDex analyse notamment :

- Couleur
- Pelage
- Yeux
- Taille
- Caractéristiques visuelles

Si l'image ne contient pas de chat, la capture est refusée.

### 🐱 CatDex

Chaque chat découvert rejoint automatiquement ta collection.

Tu peux retrouver :

- Les chats capturés
- Les chats encore inconnus
- Leur numéro CatDex
- Leur rareté
- Leurs caractéristiques
- Leur lieu de découverte
- Le nombre d'observations

### 🗺️ Exploration

La carte permet de visualiser les chats découverts autour de toi et encourage l'exploration de nouvelles zones.

### ⭐ Progression

Les captures participent à la progression du joueur :

- XP
- Niveaux
- Séries
- Missions
- Badges
- Progression du CatDex

---

## 🧱 Stack

### Mobile

- React Native
- Expo
- TypeScript
- Expo Router

### Backend

- Supabase
- PostgreSQL
- Supabase Auth

### IA

- OpenAI Vision

### Services

- Expo Location
- Expo Camera
- Expo Image Picker
- Expo Secure Store

---

## 🏗️ Architecture

```text
CatDex/
├── app/              # Routes et écrans Expo Router
├── assets/           # Images, fonts et ressources
├── src/              # Logique applicative
├── scripts/          # Scripts du projet
├── supabase/         # Configuration et migrations Supabase
├── docs/             # Documentation du projet
│
├── .env.example
├── app.config.js
├── eas.json
├── package.json
└── tsconfig.json
```

---

## 🚀 Installation

### Prérequis

- Node.js
- npm
- Expo
- Un projet Supabase

Clone le repository :

```bash
git clone <repository-url>
cd CatDex
```

Installe les dépendances :

```bash
npm install
```

Crée ton fichier d'environnement :

```bash
cp .env.example .env
```

Configure ensuite les variables nécessaires dans `.env`.

---

## 🔐 Variables d'environnement

Exemple :

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
```

⚠️ Ne jamais commit de clés privées ou de secrets dans le repository.

---

## ▶️ Lancer CatDex

Démarrage classique :

```bash
npx expo start
```

Avec nettoyage du cache :

```bash
npx expo start --clear
```

Puis ouvre l'application avec :

- Expo Go
- iOS Simulator
- Android Emulator
- Development Build

---

## 🧪 Vérification du projet

Avant une Pull Request :

```bash
npm run lint
```

```bash
npx tsc --noEmit
```

Et vérifie que l'application démarre correctement :

```bash
npx expo start --clear
```

---

## 🌿 Git workflow

La branche `main` doit toujours rester stable.

Pour une nouvelle fonctionnalité :

```bash
git checkout main
git pull
git checkout -b feature/nom-feature
```

Pour une correction :

```bash
git checkout -b fix/nom-fix
```

Pour du nettoyage ou de la maintenance :

```bash
git checkout -b chore/nom-changement
```

Une fois le travail terminé :

```text
branche
   ↓
Pull Request
   ↓
Review
   ↓
Tests
   ↓
Merge
   ↓
main
```

---

## 📚 Documentation

La documentation technique et produit se trouve dans :

```text
/docs
```

Elle contient notamment :

- Architecture
- Déploiement
- Supabase
- Product
- UX/UI
- Audits
- Git workflow

Le `README.md` reste volontairement simple et sert de point d'entrée au projet.

---

## 🗺️ Roadmap

CatDex est actuellement en développement.

Les principaux chantiers concernent :

- Fiabilisation de la reconnaissance des chats
- Amélioration de l'expérience de capture
- Gamification
- Progression joueur
- Missions
- Exploration sur la carte
- Enrichissement des fiches chats
- Performance et stabilité

---

## 🐾 Vision

CatDex veut rendre les chats du monde réel collectionnables.

Chaque promenade peut devenir une exploration.

Chaque chat rencontré peut devenir une nouvelle découverte.

**Attrape-les tous. Enfin... prends-les en photo. 🐱**
