# 🚀 CatDex - Par Où Commencer ?

Bienvenue ! Ce guide te dirige vers la bonne documentation selon ce que tu veux faire.

> **Repo public** — commence par [README.md](./README.md),
> [docs/FEATURES.md](./docs/FEATURES.md), [SECURITY.md](./SECURITY.md)
> et l’[agenda public/privé](./docs/PUBLIC_REPO_AGENDA.md).
> Ne colle jamais de clés API dans Git.

---

## 🎯 Je veux...

### 📱 **Tester sur mon téléphone MAINTENANT** (2 minutes)

👉 **[PHONE_QUICKSTART.md](./PHONE_QUICKSTART.md)**

3 méthodes ultra rapides :
- Expo Go (2 min)
- Version web (5 min) 
- APK Android (15 min)

---

### 🌐 **Mettre l'app en ligne pour mes amis** (30 minutes)

👉 **[QUICKSTART.md](./QUICKSTART.md)**

Guide pas-à-pas pour :
1. Configurer Supabase (5 min)
2. Déployer l'API (10 min)
3. Déployer le web (5 min)
4. Partager avec tes amis !

---

### 📦 **Publier sur App Store / Play Store** (2-3 jours)

👉 **[docs/MOBILE_DEPLOYMENT.md](./docs/MOBILE_DEPLOYMENT.md)**

Guide complet pour :
- Build iOS avec EAS
- Build Android avec EAS
- Soumission aux stores
- TestFlight beta testing

---

### 🏗️ **Comprendre l'architecture du projet**

👉 **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**

Diagrammes et explications :
- Architecture complète
- Flux de données
- Sécurité et scalabilité
- Coûts détaillés

---

### 🔧 **J'ai un problème / bug**

👉 **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)**

Solutions pour :
- Problèmes de déploiement
- Erreurs API
- Problèmes d'authentification
- Bugs mobile
- Performance

---

### 📚 **Tout savoir sur le déploiement**

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

Documentation complète :
- Toutes les options de déploiement
- Backend, Web, Mobile
- Configuration avancée
- Monitoring et CI/CD

---

## 🗺️ Plan du Projet

```
CatDex/
│
├── 📱 Tests Rapides
│   ├── PHONE_QUICKSTART.md         ← Tester sur téléphone (2 min)
│   └── docs/TEST_ON_PHONE.md       ← Guide détaillé mobile
│
├── 🚀 Déploiement
│   ├── QUICKSTART.md                ← Démarrage rapide (30 min)
│   ├── DEPLOYMENT.md                ← Guide complet production
│   ├── docs/RENDER_DEPLOYMENT.md   ← API backend (Render)
│   └── docs/MOBILE_DEPLOYMENT.md   ← Apps iOS/Android (EAS)
│
├── 📖 Documentation
│   ├── docs/ARCHITECTURE.md         ← Architecture système
│   ├── docs/TROUBLESHOOTING.md     ← Dépannage
│   ├── README.md                    ← Vue d'ensemble
│   └── supabase/README.md          ← Configuration Supabase
│
└── 🛠️ Scripts
    ├── scripts/deploy-web.sh        ← Déployer web
    ├── scripts/check-deployment.sh  ← Vérifier config
    └── scripts/ios-sim.sh          ← Simulateur iOS
```

---

## ⚡ Commandes Rapides

### Développement Local

```bash
# Démarrer l'app
npm start

# API backend
npm run server

# Web
npm run web

# iOS Simulator (Mac)
npm run ios:sim
```

### Déploiement

```bash
# Vérifier la config
npm run deploy:check

# Build web
npm run web:build

# Déployer web
npm run deploy:web

# Build mobile
eas build --platform all
```

---

## 🎓 Ordre Recommandé

Si tu débutes avec CatDex :

### 1️⃣ **Configuration Initiale** (10 min)

```bash
# Clone et installe
git clone https://github.com/ton-username/catdex
cd catdex
npm install

# Configure .env
cp .env.example .env
# Édite .env avec tes clés Supabase
```

👉 Voir `README.md` section "Démarrer"

---

### 2️⃣ **Test Local** (5 min)

```bash
# Démarre l'app
npm start

# Ouvre dans le navigateur
# ou scanne le QR code avec Expo Go
```

---

### 3️⃣ **Test sur Téléphone** (2 min)

👉 **[PHONE_QUICKSTART.md](./PHONE_QUICKSTART.md)**

```bash
npm start
# Scanne le QR code avec Expo Go
```

---

### 4️⃣ **Déployer pour Amis** (30 min)

👉 **[QUICKSTART.md](./QUICKSTART.md)**

```bash
# 1. Déployer API sur Render
# 2. Déployer web sur Netlify
# 3. Partager le lien !
```

---

### 5️⃣ **Apps Stores** (optionnel, 2-3 jours)

👉 **[docs/MOBILE_DEPLOYMENT.md](./docs/MOBILE_DEPLOYMENT.md)**

```bash
eas build --platform all
eas submit --platform all
```

---

## 🆘 Besoin d'Aide ?

### Documentation Officielle

- [Expo Docs](https://docs.expo.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)

### Communautés

- [Expo Discord](https://discord.gg/expo)
- [Supabase Discord](https://discord.supabase.com)

### Ce Projet

- Ouvre une [GitHub Issue](https://github.com/imfire3/CatDex/issues)
- Consulte [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## 📊 Temps Estimés

| Tâche | Temps | Difficulté |
|-------|-------|------------|
| Test Expo Go | 2 min | ⭐ Facile |
| Test web local | 5 min | ⭐ Facile |
| Déploiement web | 5 min | ⭐⭐ Moyen |
| Déploiement API | 10 min | ⭐⭐ Moyen |
| Déploiement complet | 30 min | ⭐⭐ Moyen |
| Build APK Android | 15 min | ⭐⭐ Moyen |
| Publish App Stores | 2-3 jours | ⭐⭐⭐ Difficile |

---

## 💰 Coûts

### Gratuit (pour commencer)

- Supabase : Gratuit
- Render : Gratuit (cold start)
- Netlify : Gratuit
- OpenAI : ~3-5€/mois

**Total : 3-5€/mois**

### Production

- Supabase Pro : 25$/mois
- Render Starter : 7$/mois
- OpenAI : 5-30$/mois

**Total : 37-62$/mois**

---

## 🎉 Prêt ?

**Commence par** 👉 **[PHONE_QUICKSTART.md](./PHONE_QUICKSTART.md)**

Teste l'app sur ton téléphone en 2 minutes, c'est le plus motivant ! 🚀📱

Ensuite, suis **[QUICKSTART.md](./QUICKSTART.md)** pour la mettre en ligne.

---

**Bon code !** 🐱✨
