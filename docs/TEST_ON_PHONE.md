# Tester CatDex sur ton Téléphone 📱

Guide pour installer et tester CatDex directement sur ton téléphone en quelques minutes, sans passer par les app stores.

## 🎯 Méthodes Rapides

### Méthode 1 : Expo Go (Le Plus Rapide - 2 minutes)

**Avantages** : Aucun build nécessaire, instantané
**Inconvénient** : Nécessite l'app Expo Go installée

#### Étapes :

1. **Installer Expo Go** sur ton téléphone
   - iOS : [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
   - Android : [Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Démarrer le serveur de développement**
   ```bash
   cd /workspace
   npm start
   ```

3. **Scanner le QR code**
   - **iOS** : Ouvre l'app Appareil Photo → Scanne le QR code
   - **Android** : Ouvre Expo Go → Scanne le QR code

4. **C'est tout !** L'app se charge sur ton téléphone 🎉

**⚠️ Important** : Ton téléphone et ton ordinateur doivent être sur le **même réseau WiFi**.

---

### Méthode 2 : Build EAS (Partage avec Amis - 15 minutes)

**Avantages** : Pas besoin d'Expo Go, lien de téléchargement direct
**Inconvénient** : Build prend 10-15 minutes

#### Pour Android (APK Direct)

```bash
# 1. Build un APK
eas build --platform android --profile preview

# 2. Attends 10-15 minutes

# 3. Tu reçois un lien de téléchargement
# Exemple : https://expo.dev/artifacts/eas/abc123.apk

# 4. Envoie ce lien à tes amis par WhatsApp/SMS
# Ils téléchargent et installent directement
```

**Partage le lien APK** : Tes amis peuvent installer l'app sans avoir Expo Go !

⚠️ Sur Android, il faudra autoriser l'installation depuis des sources inconnues :
- Paramètres → Sécurité → Sources inconnues → Autoriser

#### Pour iOS (TestFlight)

```bash
# 1. Build iOS
eas build --platform ios --profile preview

# 2. Upload sur TestFlight
eas submit --platform ios

# 3. Invite tes amis depuis App Store Connect
# Ils reçoivent un email avec un lien TestFlight
```

---

### Méthode 3 : Version Web (Immédiat - 0 minute)

**Le plus simple** : Pas d'installation, fonctionne dans le navigateur !

#### Déployer la version web

```bash
# 1. Build
npm run web:build

# 2. Déployer sur Netlify
npx netlify deploy --prod --dir dist

# 3. Tu reçois une URL : https://catdex-xyz.netlify.app
```

**Partage l'URL** : Tes amis ouvrent simplement le lien dans leur navigateur (Chrome, Safari, etc.)

✅ Fonctionne sur **tous les téléphones** (iOS, Android, même sur PC)

---

## 🔥 Recommandation : Méthode Hybride

**Pour toi** (développeur) : Utilise **Expo Go** pour tester rapidement

**Pour tes amis** : Partage la **version web** (lien Netlify)

**Pourquoi ?**
- Web = Aucune installation, fonctionne partout
- Expo Go = Rapide pour toi pendant le développement

---

## 📱 Déploiement Complet sur Téléphone

### Configuration Requise

Avant de tester sur téléphone, assure-toi que :

1. **L'API backend est déployée** (Render)
   ```bash
   # Teste l'API
   curl https://ton-api.onrender.com/health
   ```

2. **Supabase est configuré**
   - Dashboard Supabase → Projet créé
   - Tables créées (voir `supabase/schema.sql`)
   - Bucket `cat-photos` créé

3. **Variables d'environnement** sont correctes
   ```bash
   # Vérifie .env
   npm run deploy:check
   ```

---

## 🚀 Guide Pas-à-Pas : Expo Go

### 1. Préparer l'Environnement

```bash
# S'assurer que tout est à jour
cd /workspace
npm install

# Vérifier la configuration
cat .env
```

Ton `.env` doit contenir :
```env
EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=https://ton-api.onrender.com
```

### 2. Démarrer le Serveur

```bash
# Démarrer Expo
npm start
```

Tu verras quelque chose comme :
```
› Metro waiting on exp://192.168.1.10:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

 ┌──────────────────────────────────────┐
 │                                      │
 │   ████ ████ ████   ████ ████ ████   │
 │   ████ ████ ████   ████ ████ ████   │
 │   ████ ████ ████   ████ ████ ████   │
 │                                      │
 │   ████ ████ ████   ████ ████ ████   │
 │   ████ ████ ████   ████ ████ ████   │
 │   ████ ████ ████   ████ ████ ████   │
 │                                      │
 └──────────────────────────────────────┘
```

### 3. Ouvrir sur Téléphone

#### iPhone

1. Ouvre l'**app Appareil Photo**
2. Scanne le QR code
3. Une notification apparaît : "Ouvrir dans Expo Go"
4. Clique → L'app se charge !

#### Android

1. Ouvre **Expo Go**
2. Clique sur "Scan QR code"
3. Scanne → L'app se charge !

### 4. Test Complet

Une fois l'app chargée sur ton téléphone :

1. ✅ **Créer un compte**
   - Email + mot de passe

2. ✅ **Tester la carte**
   - Autoriser la géolocalisation
   - La carte s'affiche avec ta position

3. ✅ **Scanner un chat**
   - Clique sur le bouton FAB (flottant)
   - Autoriser la caméra
   - Prends une photo d'un chat (ou upload depuis galerie)

4. ✅ **Analyser**
   - L'IA analyse la photo (~2-4 secondes)
   - Le chat apparaît dans ton CatDex
   - Le chat apparaît sur la carte

5. ✅ **Profil**
   - Vérifie tes statistiques

**Tout fonctionne ?** 🎉 L'app est prête à partager !

---

## 🌐 Guide Pas-à-Pas : Version Web

### 1. Build la Version Web

```bash
# Build
npm run web:build

# Vérifie que dist/ a été créé
ls -lh dist/
```

### 2. Déployer sur Netlify

#### Option A : CLI (Rapide)

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Déployer
netlify deploy --prod --dir dist

# Tu reçois une URL : https://abc123.netlify.app
```

#### Option B : Interface Web (Plus Simple)

1. Va sur https://app.netlify.com
2. "Add new site" → "Deploy manually"
3. Drag & drop le dossier `dist/`
4. Attends 30 secondes
5. Tu reçois une URL !

### 3. Tester sur Téléphone

1. Ouvre l'URL dans le navigateur de ton téléphone
2. Ajoute à l'écran d'accueil :
   - **iOS** : Safari → Partager → Ajouter à l'écran d'accueil
   - **Android** : Chrome → Menu → Ajouter à l'écran d'accueil

L'app ressemble maintenant à une vraie app ! 🎉

---

## 📦 Build EAS pour Distribution

### Android APK (Partage Direct)

```bash
# Build
eas build --platform android --profile preview

# Attends 10-15 minutes
# Tu reçois un lien de téléchargement dans la console

# Exemple de lien :
# https://expo.dev/artifacts/eas/abc123def456.apk
```

**Partager l'APK** :

1. Copie le lien
2. Envoie par WhatsApp, SMS, Email
3. Tes amis cliquent → Téléchargent → Installent

**Sur leur téléphone** :

1. Télécharger l'APK
2. Ouvrir le fichier
3. Autoriser "Sources inconnues" si demandé
4. Installer
5. Ouvrir CatDex !

### iOS via TestFlight

```bash
# 1. Build iOS
eas build --platform ios --profile preview

# 2. Submit à TestFlight
eas submit --platform ios

# 3. App Store Connect
# Va sur https://appstoreconnect.apple.com
# TestFlight → Ajouter des testeurs externes
# Entre les emails de tes amis

# 4. Ils reçoivent un email
# "Vous êtes invité à tester CatDex"
# Ils cliquent → Installent TestFlight → Installent CatDex
```

**Limite** : 10 000 testeurs externes max (largement suffisant !)

---

## 🔥 Tunnel pour Tester sans Même Réseau WiFi

Si ton téléphone n'est **pas sur le même WiFi** que ton PC :

### Option 1 : Expo Tunnel

```bash
# Démarrer avec tunnel
npx expo start --tunnel

# Expo crée un tunnel public
# Tu peux scanner le QR code de n'importe où !
```

### Option 2 : ngrok

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le port Expo
ngrok http 8081

# Tu reçois une URL publique : https://abc123.ngrok.io
```

---

## 🐛 Problèmes Courants

### ❌ "Unable to resolve module"

**Cause** : Cache Expo corrompu

**Solution** :
```bash
npx expo start --clear
```

---

### ❌ "Network response timed out"

**Cause** : Ton téléphone ne peut pas atteindre ton PC

**Solution** :

1. Vérifie que téléphone et PC sont sur le même WiFi
2. Désactive le firewall temporairement
3. Ou utilise `--tunnel` :
   ```bash
   npx expo start --tunnel
   ```

---

### ❌ Photos ne marchent pas

**Cause** : Permissions caméra/galerie pas autorisées

**Solution** :

1. Paramètres téléphone → CatDex / Expo Go
2. Autoriser Caméra, Photos, Localisation

---

### ❌ "API error" sur téléphone

**Cause** : L'app ne peut pas atteindre l'API

**Solution** :

1. Vérifie que `EXPO_PUBLIC_API_URL` pointe vers une **URL publique** (pas `localhost`)
   ```env
   # ❌ Mauvais
   EXPO_PUBLIC_API_URL=http://localhost:8787
   
   # ✅ Bon
   EXPO_PUBLIC_API_URL=https://ton-api.onrender.com
   ```

2. Redémarre Expo après modification :
   ```bash
   npx expo start --clear
   ```

---

## 🎉 Checklist Finale

Avant de partager avec tes amis :

- [ ] API backend déployée sur Render
- [ ] API fonctionne : `curl https://ton-api.onrender.com/health`
- [ ] Supabase configuré (tables + bucket)
- [ ] `.env` avec les bonnes URLs (publiques, pas localhost)
- [ ] App testée sur ton téléphone
- [ ] Créer un compte fonctionne
- [ ] Scanner un chat fonctionne
- [ ] Analyse IA fonctionne
- [ ] Carte affiche les chats

**Tout bon ?** 🚀 Partage avec tes amis !

---

## 📲 Comment Partager

### Version Web (Recommandé)

```
Salut ! J'ai créé une app pour découvrir les chats du quartier 🐱

👉 https://catdex.netlify.app

Tu peux créer un compte et scanner des chats avec ton téléphone !
```

### Version APK Android

```
Salut ! J'ai créé CatDex, une app pour capturer les chats 🐱

📥 Télécharge l'APK : https://expo.dev/artifacts/eas/abc123.apk

Tu devras autoriser "Sources inconnues" pour installer.
```

### Version iOS TestFlight

```
Salut ! Tu veux tester CatDex en beta ?

1. Installe TestFlight : https://apps.apple.com/app/testflight/id899247664
2. Clique sur ce lien : https://testflight.apple.com/join/ABC123
3. Installe CatDex

C'est une app pour capturer tous les chats du quartier ! 🐱
```

---

## 🎯 Résumé Méthodes

| Méthode | Temps | Complexité | Partage Amis |
|---------|-------|------------|--------------|
| **Expo Go** | 2 min | Facile | ❌ Besoin Expo Go |
| **Web** | 5 min | Facile | ✅ Simple lien |
| **APK Android** | 15 min | Moyen | ✅ Lien APK |
| **TestFlight iOS** | 20 min | Moyen | ✅ Lien TestFlight |
| **App Stores** | 2-3 jours | Difficile | ✅ Universel |

**Notre recommandation** : Commence par la **version web** pour tes amis, c'est le plus simple !

---

Bon test ! 🚀📱
