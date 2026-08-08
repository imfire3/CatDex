# ✅ Fix : "eas: command not found"

## 🎯 Problème

```bash
bash: eas: command not found
```

## ✨ Solution Rapide

**N'installe PAS `eas-cli` globalement.** Utilise `npx` à la place !

### Remplace :
```bash
❌ eas build --platform all
❌ eas submit --platform ios
```

### Par :
```bash
✅ npx eas-cli build --platform all
✅ npx eas-cli submit --platform ios
```

---

## 🚀 Commandes EAS Corrigées

### Login
```bash
npx eas-cli login
```

### Build
```bash
# Android APK (test)
npx eas-cli build --platform android --profile preview

# iOS + Android (production)
npx eas-cli build --platform all --profile production

# iOS uniquement
npx eas-cli build --platform ios --profile production
```

### Submit aux Stores
```bash
# iOS App Store
npx eas-cli submit --platform ios --latest

# Android Play Store
npx eas-cli submit --platform android --latest

# Les deux
npx eas-cli submit --platform all --latest
```

### Autres Commandes
```bash
# Voir les builds
npx eas-cli build:list

# Configurer les credentials
npx eas-cli credentials --platform ios

# Update OTA
npx eas-cli update --branch production --message "Fix bug"
```

---

## 💡 Pourquoi npx ?

### Avantages de `npx` :
- ✅ Pas besoin d'installation globale
- ✅ Pas de problème de permissions
- ✅ Toujours la dernière version
- ✅ Fonctionne partout (Mac, Linux, Windows)

### Inconvénient :
- ⏱️ Légèrement plus lent (première fois télécharge le package)

---

## 🔧 Alternative : Installer Localement

Si tu veux vraiment installer :

```bash
# Dans ton projet
cd ~/Documents/catdexapp
npm install --save-dev eas-cli

# Puis utilise via npm scripts
npm run eas -- build --platform all

# Ou via npx local
npx eas build --platform all
```

---

## 📝 Mise à Jour du package.json

Tu peux ajouter des scripts pour simplifier :

```json
{
  "scripts": {
    "build:android": "npx eas-cli build --platform android --profile preview",
    "build:ios": "npx eas-cli build --platform ios --profile production",
    "build:all": "npx eas-cli build --platform all --profile production",
    "submit:ios": "npx eas-cli submit --platform ios --latest",
    "submit:android": "npx eas-cli submit --platform android --latest"
  }
}
```

Ensuite :
```bash
npm run build:android
npm run submit:ios
```

---

## ✅ C'est Corrigé !

Utilise maintenant :
```bash
npx eas-cli [commande]
```

Au lieu de :
```bash
eas [commande]
```

**Simple !** 🎉
