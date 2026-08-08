# 🚀 CatDex - Lance l'App MAINTENANT

## 📱 Tu Veux Tester sur Ton Téléphone ? (2 minutes)

### Expo est Déjà Lancé ! ✅

```
Serveur actif sur : exp://172.30.0.2:8081
```

### 3 Étapes Simples :

1. **Installe Expo Go** sur ton téléphone
   - iPhone : [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android : [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scanne le QR Code**
   - iPhone : App Appareil Photo
   - Android : Ouvre Expo Go → Scan

3. **L'app se charge** sur ton téléphone ! 🎉

---

## 🌐 Tu Veux Mettre l'App en Ligne ? (30 minutes)

### Ce Qu'il Te Faut :

#### 1. Obtenir les Clés API (5 min)

**👉 [KEYS_TO_GET.md](./KEYS_TO_GET.md)** - Guide pour obtenir :
- 🔑 OpenAI API Key
- 🗄️ Supabase URL + Keys
- 💰 Coût : ~3-5€/mois

#### 2. Setup Automatique (2 min)

```bash
./scripts/setup-render.sh
```

Ce script va :
- ✅ Te demander tes clés API
- ✅ Configurer `.env`
- ✅ Te donner les instructions pour Render.com

**Ou manuel** : **👉 [RENDER_SETUP_GUIDE.md](./RENDER_SETUP_GUIDE.md)**

#### 3. Déployer (3 min)

1. Va sur https://dashboard.render.com
2. "New +" → "Blueprint"
3. Sélectionne ton repo "CatDex"
4. Colle les clés du script
5. "Apply" → Attends 3-5 min ⏱️

**Guide rapide** : **👉 [RENDER_CHEATSHEET.md](./RENDER_CHEATSHEET.md)**

---

## 🎯 Quel Guide pour Toi ?

| Tu veux... | Temps | Guide |
|------------|-------|-------|
| 📱 Tester sur téléphone NOW | 2 min | Expo est déjà lancé ✅ |
| 🌐 Version web pour amis | 5 min | [PHONE_QUICKSTART.md](./PHONE_QUICKSTART.md) |
| 🚀 Mettre API en ligne | 10 min | [RENDER_SETUP_GUIDE.md](./RENDER_SETUP_GUIDE.md) |
| 📦 Tout comprendre | 30 min | [QUICKSTART.md](./QUICKSTART.md) |
| 📱 Apps iOS/Android stores | 2-3 jours | [docs/MOBILE_DEPLOYMENT.md](./docs/MOBILE_DEPLOYMENT.md) |
| 🔧 J'ai un problème | - | [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) |

---

## 📋 Checklist Rapide

### Pour Tester Localement (2 min)

- [x] Dépendances installées (`npm install`)
- [x] Serveur Expo lancé (`npm start`)
- [ ] Expo Go installé sur téléphone
- [ ] QR code scanné

### Pour Déployer en Ligne (10 min)

- [ ] Compte OpenAI + clé API
- [ ] Projet Supabase créé
- [ ] Schema SQL exécuté
- [ ] Bucket `cat-photos` créé
- [ ] Clés copiées dans Render.com
- [ ] API déployée (status "Live")
- [ ] Health check OK

---

## 🔥 Actions Rapides

### Commandes Utiles

```bash
# Tester localement
npm start                    # Expo Go
npm run web                  # Version web
npm run server               # API locale

# Setup & Deploy
./scripts/setup-render.sh    # Config interactive
npm run deploy:check         # Vérifier config
npm run web:build            # Build web
npx netlify deploy --prod --dir dist  # Deploy web

# Build mobile
eas build --platform all     # iOS + Android
```

### Liens Importants

- 🔑 Clés API : [KEYS_TO_GET.md](./KEYS_TO_GET.md)
- 🚀 Setup Render : [RENDER_SETUP_GUIDE.md](./RENDER_SETUP_GUIDE.md)
- 📝 Aide-mémoire : [RENDER_CHEATSHEET.md](./RENDER_CHEATSHEET.md)
- 📱 Test mobile : [PHONE_QUICKSTART.md](./PHONE_QUICKSTART.md)
- 📚 Guide complet : [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💡 Conseil

**Commence par** :
1. 📱 Tester sur ton téléphone avec Expo Go (2 min)
2. 🔑 Obtenir les clés API ([KEYS_TO_GET.md](./KEYS_TO_GET.md))
3. 🚀 Lancer le script : `./scripts/setup-render.sh`
4. 🌐 Déployer sur Render.com (3 min)

**Temps total** : ~15 minutes pour avoir l'app en ligne ! 🎉

---

## 🆘 Besoin d'Aide ?

### Le serveur Expo ne marche pas ?

```bash
# Redémarre
cd /workspace
npm start
```

### Pas de QR code visible ?

Le serveur écoute sur : `exp://172.30.0.2:8081`

Entre cette URL manuellement dans Expo Go.

### Autres problèmes ?

👉 [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

**Prêt ?** Scanne le QR code avec Expo Go ! 📱✨
