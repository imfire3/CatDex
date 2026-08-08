# 📱 CatDex sur Ton Téléphone - Guide Ultra Rapide

3 méthodes simples pour tester CatDex sur ton téléphone **MAINTENANT**.

---

## 🚀 Méthode 1 : Expo Go (2 minutes)

**C'est quoi ?** Teste l'app **instantanément** sur ton téléphone, sans build

### Étapes :

```
1️⃣ Installe "Expo Go" sur ton téléphone
   📲 iOS : App Store
   📲 Android : Play Store

2️⃣ Sur ton ordinateur :
   $ cd /workspace
   $ npm start

3️⃣ Scanne le QR code avec ton téléphone
   📷 iOS : App Appareil Photo
   📷 Android : Dans l'app Expo Go

4️⃣ L'app s'ouvre sur ton téléphone ! 🎉
```

**⚠️ Important** : Ton téléphone et ton Mac doivent être sur le **même WiFi**.

**Problème de WiFi ?** Utilise :
```bash
npx expo start --tunnel
```

---

## 🌐 Méthode 2 : Version Web (5 minutes)

**C'est quoi ?** Une app web qui fonctionne dans le navigateur (comme Instagram Web)

### Étapes :

```bash
# 1. Build l'app web
npm run web:build

# 2. Déployer sur Netlify (gratuit)
npx netlify-cli deploy --prod --dir dist

# 3. Tu reçois un lien : https://catdex-xyz.netlify.app
```

**Partage le lien** avec tes amis → Ils ouvrent dans Chrome/Safari → Ça marche ! 📲

**Astuce** : Ajoute à l'écran d'accueil pour que ça ressemble à une vraie app :
- **iOS** : Safari → Bouton Partager → "Sur l'écran d'accueil"
- **Android** : Chrome → Menu (⋮) → "Ajouter à l'écran d'accueil"

---

## 📦 Méthode 3 : APK Android (15 minutes)

**C'est quoi ?** Une vraie app Android que tu peux partager par lien

### Étapes :

```bash
# 1. Build un APK
eas build --platform android --profile preview

# 2. Attends 10-15 minutes ⏳

# 3. Tu reçois un lien de téléchargement
# Exemple : https://expo.dev/artifacts/eas/abc123.apk

# 4. Envoie ce lien à tes amis par WhatsApp
```

**Installation** :
1. Télécharge l'APK depuis le lien
2. Ouvre le fichier → Android demande l'autorisation
3. Autorise "Installer depuis cette source"
4. Installe → Ouvre CatDex ! 🎉

---

## 🎯 Quelle Méthode Choisir ?

| Si tu veux... | Utilise... |
|---------------|------------|
| **Tester MAINTENANT** | Expo Go (2 min) |
| **Partager avec des amis** | Version Web (5 min) |
| **Une vraie app Android** | APK (15 min) |
| **Une vraie app iOS** | Voir `docs/MOBILE_DEPLOYMENT.md` |

---

## 🔧 Prérequis

Avant de tester sur téléphone, assure-toi que :

✅ **L'API backend est déployée**
```bash
curl https://ton-api.onrender.com/health
# Doit retourner : {"ok":true,"service":"catdex-api"}
```

✅ **Supabase est configuré**
- Tables créées (voir `supabase/schema.sql`)
- Bucket `cat-photos` créé

✅ **Variables d'environnement OK**
```bash
npm run deploy:check
```

**Pas encore fait ?** Suis d'abord `QUICKSTART.md` (30 minutes).

---

## 📱 Test Complet sur Téléphone

Une fois l'app ouverte sur ton téléphone :

### 1. Créer un Compte
```
📧 Email : test@catdex.app
🔒 Password : test123456
```

### 2. Autoriser les Permissions
```
📍 Localisation → Autoriser
📷 Caméra → Autoriser
🖼️ Photos → Autoriser
```

### 3. Scanner un Chat
```
1. Clique sur le gros bouton violet (+) en bas
2. "Prendre une photo" ou "Galerie"
3. Scanne un chat 🐱
4. Attends l'analyse (~2-4 secondes)
5. Le chat apparaît dans ton CatDex ! 🎉
```

### 4. Voir la Carte
```
1. Onglet "Carte"
2. Les chats autour de toi apparaissent sur la carte
3. Clique sur un pin pour voir le chat
```

**Tout marche ?** 🎊 Partage avec tes amis !

---

## 🚨 Problèmes Rapides

### ❌ "Cannot connect to Metro"

**Solution** :
```bash
# Redémarre Expo avec cache clear
npx expo start --clear
```

---

### ❌ "API Error" dans l'app

**Solution** : Vérifie que `EXPO_PUBLIC_API_URL` pointe vers une **URL publique** (pas localhost)

```bash
# Édite .env
nano .env

# Change
EXPO_PUBLIC_API_URL=https://ton-api.onrender.com

# Redémarre
npx expo start --clear
```

---

### ❌ Photos ne marchent pas

**Solution** : Paramètres téléphone → CatDex (ou Expo Go) → Autoriser Caméra + Photos + Localisation

---

### ❌ "Téléphone pas sur le même WiFi"

**Solution** :
```bash
# Utilise un tunnel public
npx expo start --tunnel

# Ou utilise la version web (pas besoin de même WiFi)
npm run web:build
npx netlify deploy --prod --dir dist
```

---

## 💬 Partager avec tes Amis

### Message Type (Version Web)

```
Salut ! 🐱

J'ai créé CatDex, une app pour capturer tous les chats du quartier !

👉 https://catdex.netlify.app

Tu peux créer un compte et commencer à scanner des chats.
C'est comme Pokemon Go mais avec de vrais chats ! 😄

Dis-moi ce que tu en penses !
```

### Message Type (APK Android)

```
Hey ! 🐱

J'ai fait une app pour trouver tous les chats du quartier.

📥 Télécharge : https://expo.dev/artifacts/eas/abc123.apk

Sur ton téléphone :
1. Ouvre le lien
2. Télécharge le fichier
3. Autorise l'installation
4. Ouvre CatDex !

Dis-moi si tu aimes !
```

---

## 🎯 Récap Ultra Rapide

**Tester maintenant** :
```bash
npm start
# Scanne QR code avec Expo Go
```

**Partager sur le web** :
```bash
npm run web:build
npx netlify deploy --prod --dir dist
# Partage l'URL
```

**Build APK Android** :
```bash
eas build --platform android --profile preview
# Attends 15 min, partage le lien APK
```

---

## 📚 Besoin de Plus de Détails ?

- **Guide complet téléphone** : `docs/TEST_ON_PHONE.md`
- **Déploiement production** : `DEPLOYMENT.md`
- **Démarrage rapide** : `QUICKSTART.md`
- **Apps mobiles stores** : `docs/MOBILE_DEPLOYMENT.md`

---

**Prêt ? GO !** 🚀📱🐱
