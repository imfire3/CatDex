# Guide de Déploiement Mobile CatDex 📱

Guide détaillé pour déployer CatDex sur iOS et Android avec Expo Application Services (EAS).

## Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Initiale](#configuration-initiale)
3. [Build Android](#build-android)
4. [Build iOS](#build-ios)
5. [Publication sur les Stores](#publication-sur-les-stores)
6. [Mises à Jour OTA](#mises-à-jour-ota)
7. [Dépannage](#dépannage)

---

## Prérequis

### 1. Compte Expo

Créer un compte gratuit sur https://expo.dev/signup

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter
eas login
```

### 2. Pour Android

- **Gratuit** : Aucun compte nécessaire pour tester
- **Publication Play Store** : Compte Google Play Console ($25 unique)
  - Créer un compte sur https://play.google.com/console

### 3. Pour iOS

- **Mac requis** : Pas nécessaire avec EAS ! Build dans le cloud
- **Compte Apple Developer** : $99/an
  - Inscription sur https://developer.apple.com
- **Certificats** : EAS peut les générer automatiquement

---

## Configuration Initiale

### 1. Lier le projet à ton compte Expo

```bash
cd /workspace

# Initialiser EAS (si pas déjà fait)
eas init

# Lier au projet (déjà configuré dans app.json)
eas whoami
```

Le projet est déjà lié à l'organisation `imfire` via `app.json` :

```json
{
  "expo": {
    "owner": "imfire",
    "extra": {
      "eas": {
        "projectId": "ba00fda8-5917-4ef4-aa0c-b420e5108984"
      }
    }
  }
}
```

### 2. Configurer l'URL de l'API

**Important** : Avant de build, configure l'URL de ton API déployée dans `eas.json` :

```bash
nano eas.json
```

Modifie la section `production.env` :

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://TON-API-REELLE.onrender.com"
      }
    }
  }
}
```

**Remplace** `TON-API-REELLE.onrender.com` par l'URL de ton API déployée sur Render/Railway.

### 3. Vérifier les identifiants

Dans `app.json`, vérifie que les bundle identifiers sont uniques :

```json
{
  "ios": {
    "bundleIdentifier": "com.catdex.app"
  },
  "android": {
    "package": "com.catdex.app"
  }
}
```

Si tu prévois de publier plusieurs versions (dev/prod), tu peux créer des variants :
- Production : `com.catdex.app`
- Dev : `com.catdex.app.dev`

---

## Build Android

### Première fois : Build APK pour tester

```bash
# Build un APK (pas besoin de compte Play Store)
eas build --platform android --profile preview
```

Temps estimé : **10-15 minutes**

Une fois terminé :

```bash
# Télécharger l'APK
eas build:list

# Ou installer directement sur un téléphone Android connecté
eas build:run --platform android --latest
```

**Partage l'APK** : Tu peux envoyer le fichier `.apk` directement à tes amis par WhatsApp, email, etc.

⚠️ **Attention** : Android affichera un warning "App inconnue". C'est normal, il faut autoriser l'installation depuis des sources inconnues dans les paramètres.

---

### Build de Production (pour Google Play)

#### 1. Créer l'app sur Google Play Console

1. Va sur https://play.google.com/console
2. "Créer une application"
3. Remplis les infos de base :
   - Nom : **CatDex**
   - Langue par défaut : Français
   - Type : Application
   - Gratuite ou payante : Gratuite

#### 2. Build un AAB (Android App Bundle)

```bash
# Build de production
eas build --platform android --profile production
```

Le fichier généré sera un `.aab` (format requis par Google Play).

#### 3. Télécharger le build

```bash
eas build:list

# Ou télécharge depuis le dashboard Expo
```

Ouvre https://expo.dev/accounts/imfire/projects/catdex/builds

#### 4. Upload sur Google Play Console

1. Dans la Play Console, va dans "Production" → "Créer une version"
2. Upload le fichier `.aab`
3. Remplis les infos requises :
   - Description courte et longue
   - Screenshots (4 minimum)
   - Icône haute résolution (512x512)
   - Capture vidéo (optionnel)

4. Configure la classification de contenu :
   - Questionnaire : Réponds honnêtement
   - CatDex devrait être classé "PEGI 3" (tout public)

5. Configure les pays cibles :
   - France au minimum
   - Ou monde entier

6. Envoyer pour validation
   - Google review : 1-3 jours

---

## Build iOS

### Prérequis

1. **Compte Apple Developer actif** ($99/an)
2. **Accepter les agreements** sur https://developer.apple.com/account

### Première fois : Configuration automatique

EAS peut générer automatiquement tous les certificats et profils !

```bash
# Build iOS (EAS va te guider)
eas build --platform ios --profile production
```

EAS va te demander :

1. **Generate a new Apple Distribution Certificate?** → Oui
2. **Generate a new Apple Provisioning Profile?** → Oui
3. **Login Apple Developer** → Entre tes identifiants Apple Developer

Temps estimé : **15-20 minutes**

---

### Tester avec TestFlight (avant l'App Store)

Une fois le build terminé :

```bash
# Submit directement à TestFlight
eas submit --platform ios --latest
```

Ou upload manuellement :

1. Télécharge le `.ipa` depuis https://expo.dev/builds
2. Ouvre https://appstoreconnect.apple.com
3. "My Apps" → "CatDex" (crée l'app si elle n'existe pas)
4. "TestFlight" → "+" → Upload le `.ipa`

TestFlight te permet de :
- Tester l'app sur de vrais iPhones
- Inviter jusqu'à 10 000 testeurs externes
- Distribuer à tes amis avant la publication officielle

**Inviter des testeurs** :

1. Dans TestFlight, va dans "External Testing"
2. Crée un groupe "Amis"
3. Ajoute des emails
4. Ils reçoivent un lien pour installer l'app via l'app TestFlight

---

### Publier sur l'App Store

#### 1. Créer l'app sur App Store Connect

1. Va sur https://appstoreconnect.apple.com
2. "My Apps" → "+" → "Nouvelle App"
3. Remplis :
   - Plateforme : iOS
   - Nom : **CatDex**
   - Langue principale : Français
   - Bundle ID : `com.catdex.app` (doit matcher `app.json`)
   - SKU : `catdex-001` (identifiant interne)

#### 2. Remplir les métadonnées

1. **Informations générales**
   - Nom : CatDex
   - Sous-titre : Ton quartier. Tes chats.
   - Catégorie : Réseaux sociaux ou Photo & Vidéo

2. **Screenshots** (requis pour iPhone et iPad)
   - iPhone 6.7" (iPhone 14 Pro Max) : 3-10 screenshots
   - iPhone 6.5" (iPhone 11 Pro Max) : 3-10 screenshots
   - iPad Pro 12.9" : 3-10 screenshots (si iPad supporté)

   Tu peux utiliser le simulateur iOS + Xcode pour capturer les screenshots.

3. **Description**

   ```
   CatDex - Ton quartier. Tes chats.

   Découvre et capture tous les chats de ton quartier !

   🐱 Scanne un chat avec ta caméra
   🤖 Analyse IA automatique (race, couleur, traits)
   🗺️ Place-le sur la carte interactive
   📚 Construis ton CatDex personnel
   🏆 Complète des missions et débloquer des récompenses

   CatDex transforme ton quartier en terrain de jeu. Pars à la chasse aux félins, explore ta ville et partage tes découvertes avec la communauté.

   Caractéristiques :
   - Capture de photos de chats
   - Analyse IA pour identifier les races
   - Carte interactive avec tous les chats découverts
   - Système de missions et récompenses
   - Profil personnalisé avec tes statistiques

   Gratuit, sans pub, respectueux de la vie privée.
   ```

4. **Mots-clés** (100 caractères max)
   ```
   chat,cats,animaux,carte,ia,pokemon,collection
   ```

5. **URL support** : Ton site web ou GitHub
   ```
   https://github.com/ton-username/catdex
   ```

6. **Classification de contenu**
   - Réponds au questionnaire
   - CatDex devrait être 4+ (tout âge)

#### 3. Soumettre le build

1. Dans "Build", sélectionne le build iOS que tu as uploadé via EAS
2. Remplis les informations de version :
   - Version : 1.0.0
   - Copyright : 2026 Ton Nom

3. Remplis les questions de conformité :
   - Chiffrement : Non (à moins que tu ajoutes du chiffrement custom)
   - Publicité : Non (si tu n'as pas de pub)

4. **Envoyer pour validation**

Review Apple : **1-3 jours** (parfois 24h)

---

## Mises à Jour OTA

### Over-The-Air Updates

Avec EAS Update, tu peux pousser des changements JavaScript sans rebuilder l'app !

#### 1. Configurer EAS Update

```bash
# Installer le package (déjà dans package.json normalement)
npm install expo-updates

# Initialiser
eas update:configure
```

#### 2. Pousser une update

```bash
# Update pour la branche de production
eas update --branch production --message "Fix bug photo upload"
```

Les utilisateurs reçoivent l'update au **prochain démarrage** de l'app.

#### 3. Updates automatiques par branche

Tu peux lier des branches Git à des canaux EAS :

```json
// eas.json
{
  "build": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  }
}
```

Ensuite :

```bash
# Update production
git push origin main
eas update --branch production --message "Release v1.1"

# Update preview (beta)
git push origin develop
eas update --branch preview --message "Test new feature"
```

---

## Limites OTA

**OTA fonctionne UNIQUEMENT pour** :
- Code JavaScript/TypeScript
- Assets (images, fonts)
- React components

**OTA ne fonctionne PAS pour** :
- Modifications natives (permissions, plugins)
- Changements dans `app.json` (nouvelle icône, permissions, etc.)
- Mise à jour de packages natifs (expo-camera, expo-location)
- Changements dans `ios/` ou `android/` (si présent)

Dans ces cas, il faut **rebuilder** l'app et republier sur les stores.

---

## Cycle de Release Recommandé

### Version initiale (v1.0.0)

```bash
# 1. Build production
eas build --platform all --profile production

# 2. Submit aux stores
eas submit --platform ios --latest
eas submit --platform android --latest

# 3. Attendre validation (1-3 jours)
```

### Hotfix (v1.0.1) - Bug mineur

```bash
# Push un OTA update (rapide, instantané)
eas update --branch production --message "Fix: Bug affichage photo"

# Users reçoivent l'update au prochain lancement
```

### Feature Update (v1.1.0)

Si le changement nécessite :
- Nouvelles permissions
- Nouveaux plugins natifs
- Changements dans app.json

Alors **rebuild** :

```bash
# 1. Incrémenter version dans app.json
# "version": "1.1.0"

# 2. Rebuild
eas build --platform all --profile production

# 3. Resubmit aux stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## Dépannage

### Build échoue : "Credentials error"

**Cause** : Problème avec les certificats Apple

**Solution** :
```bash
# Regénérer les credentials
eas credentials --platform ios

# Sélectionne "Remove all credentials"
# Puis rebuild - EAS va les recréer
eas build --platform ios --profile production --clear-cache
```

---

### Build échoue : "Bundle ID already exists"

**Cause** : Un autre développeur a déjà utilisé `com.catdex.app`

**Solution** : Change le bundle ID dans `app.json` :

```json
{
  "ios": {
    "bundleIdentifier": "com.TONPSEUDO.catdex"
  },
  "android": {
    "package": "com.TONPSEUDO.catdex"
  }
}
```

Rebuild après modification.

---

### L'app crash au démarrage

**Causes possibles** :
1. `EXPO_PUBLIC_API_URL` mal configuré
2. Variable d'environnement manquante
3. Code incompatible avec la version native

**Diagnostic** :

```bash
# Voir les logs du dernier build
eas build:list
# Clique sur le build → View logs

# Test en local d'abord
npx expo run:ios
# ou
npx expo run:android
```

**Solution** :
1. Vérifie `eas.json` → `production.env`
2. Rebuild avec les bonnes variables
3. Test en local avant de rebuild pour EAS

---

### TestFlight : "Missing compliance"

**Cause** : Apple demande si l'app utilise du chiffrement

**Solution** :

Dans `app.json`, ajoute (déjà présent normalement) :

```json
{
  "ios": {
    "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false
    }
  }
}
```

Rebuild si nécessaire.

---

### Google Play refuse l'upload

**Cause** : Version code trop basse ou déjà utilisée

**Solution** :

Dans `eas.json`, active l'auto-incrémentation (déjà activé) :

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

À chaque build, le `versionCode` (Android) et `buildNumber` (iOS) s'incrémentent automatiquement.

---

## Monitoring et Analytics

### Crashlytics (recommandé)

```bash
# Installer Sentry pour React Native
npx expo install sentry-expo

# Configurer dans app.json
```

Sentry capture automatiquement les crashes et erreurs.

### Analytics

```bash
# Google Analytics
npx expo install @react-native-firebase/analytics

# Mixpanel
npm install mixpanel-react-native
```

---

## Coûts

### Gratuit

- **Expo EAS** : Builds illimités (mais queue plus longue)
- **TestFlight** : Gratuit, inclus avec Apple Developer

### Payant

- **Apple Developer** : $99/an (obligatoire pour iOS)
- **Google Play Console** : $25 unique (obligatoire pour Android)
- **Expo Priority Builds** : $29/mois (builds plus rapides, optionnel)

---

## Ressources

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentation EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Documentation EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Guide App Store Review](https://developer.apple.com/app-store/review/)
- [Guide Play Store Review](https://support.google.com/googleplay/android-developer/answer/9859455)
- [Expo Status](https://status.expo.dev/) - Vérifier l'état des services EAS

---

## Checklist Finale

Avant de publier sur les stores :

- [ ] L'API backend est déployée et fonctionne (Render/Railway)
- [ ] `EXPO_PUBLIC_API_URL` pointe vers l'API de production
- [ ] Supabase est configuré avec les bonnes redirect URLs
- [ ] OAuth (Google/Apple) est configuré si activé
- [ ] Screenshots prêts (3-10 par taille d'écran)
- [ ] Description de l'app rédigée
- [ ] Icône de l'app haute résolution (1024x1024)
- [ ] Politique de confidentialité publiée (URL)
- [ ] Conditions d'utilisation publiées (URL)
- [ ] Apple Developer account actif ($99/an)
- [ ] Google Play Console account créé ($25 unique)
- [ ] Build de test installé et testé sur de vrais devices
- [ ] Crashlytics/monitoring configuré

**Prêt ?** Fonce ! 🚀
