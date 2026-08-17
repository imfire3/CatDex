# Guide de Déploiement CatDex 🚀

Ce guide explique comment déployer CatDex en production pour que l'application soit accessible en ligne, même quand votre Mac est éteint.

## Architecture de Déploiement

CatDex est composé de 3 parties à déployer :

1. **API Backend** (Node.js/Hono) → Render.com ou Railway
2. **Base de données** → Supabase (déjà cloud)
3. **Application Mobile** → Expo EAS + version Web

---

## 🎯 Déploiement Rapide (Résumé)

### 1. API Backend (10 min)

```bash
# Sur Render.com (gratuit)
1. Connecte ton repo GitHub sur https://dashboard.render.com
2. "New" → "Blueprint"
3. Sélectionne le repo CatDex
4. Render détecte render.yaml automatiquement
5. Configure les variables d'environnement (voir section API)
6. Deploy!
```

**URL de l'API** : `https://catdex-api.onrender.com` (ou ton nom personnalisé)

### 2. Application Web (5 min)

```bash
# Netlify (gratuit)
npm run web:build
npx netlify deploy --prod --dir dist
```

Ou connecte directement ton repo GitHub à Netlify.

### 3. Application Mobile (15 min)

```bash
# Build iOS & Android avec Expo
eas build --platform all
eas submit --platform all
```

---

## 📱 Partie 1 : Déployer l'API Backend

### Option A : Render.com (Recommandé - Gratuit)

**Avantages** : Gratuit, détection automatique via `render.yaml`, CI/CD intégré

#### Étapes :

1. **Créer un compte Render**
   - Va sur https://dashboard.render.com
   - Connecte-toi avec GitHub

2. **Connecter le repo**
   - Clique sur "New +" → "Blueprint"
   - Sélectionne ton repo `CatDex`
   - Render détecte automatiquement `render.yaml`

3. **Configurer les variables d'environnement**
   
   Dans le dashboard Render, configure ces variables :
   
   ```env
   OPENAI_API_KEY=sk-proj-your-real-openai-key
   OPENAI_MODEL=gpt-4o-mini
   PORT=8787
   NODE_ENV=production
   
   # Supabase (pour vérifier les JWT)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-dashboard
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Dashboard usage (users + photos) — GET /admin?key=…
   ADMIN_STATS_SECRET=change-me-to-a-long-random-secret
   
   # API_SECRET est auto-généré par Render
   ```
   
   **⚠️ Important** :
   - `OPENAI_API_KEY` : Obligatoire ! Va sur https://platform.openai.com/api-keys
   - `SUPABASE_JWT_SECRET` : Dashboard Supabase → Settings → API → JWT Secret
   - `ADMIN_STATS_SECRET` : secret pour ouvrir `https://ton-api.onrender.com/admin?key=…` (voir [ADMIN_STATS.md](./ADMIN_STATS.md))
   - Ne jamais commit ces secrets dans Git !

4. **Déployer**
   - Clique sur "Apply"
   - Render va build et déployer automatiquement
   - Attends 3-5 minutes

5. **Vérifier le déploiement**
   ```bash
   curl https://ton-api.onrender.com/health
   # Devrait retourner: {"ok":true,"service":"catdex-api"}
   ```

6. **Note ton URL d'API**
   - Format : `https://catdex-api-xyz123.onrender.com`
   - Tu vas en avoir besoin pour configurer l'app

#### ⚠️ Limitation du plan gratuit Render

- L'instance s'endort après 15 min d'inactivité
- Premier appel après sommeil = 30-50 secondes de démarrage
- Pour éviter ça : upgrade vers le plan payant ($7/mois) ou utilise Railway

---

### Option B : Railway (Alternative)

**Avantages** : Pas de cold start, $5 de crédit gratuit/mois

#### Étapes :

1. Va sur https://railway.app
2. Connecte ton repo GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionne `CatDex`, sous-dossier `server`
5. Configure les mêmes variables d'environnement que Render
6. Railway détecte automatiquement le Dockerfile
7. Deploy!

**URL générée** : `https://catdex-api-production.up.railway.app`

---

### Option C : Déploiement Manuel (VPS/Serveur)

Si tu as ton propre serveur :

```bash
# Sur ton serveur
git clone https://github.com/ton-username/catdex.git
cd catdex/server

# Créer .env avec tes vraies clés
cp .env.example .env
nano .env  # Édite avec tes clés

# Installer et démarrer
npm install
npm start

# Optionnel : PM2 pour garder l'API en vie
npm install -g pm2
pm2 start src/index.ts --name catdex-api --interpreter tsx
pm2 save
pm2 startup
```

Configure un reverse proxy (Nginx/Caddy) avec HTTPS.

---

## 🌐 Partie 2 : Déployer l'Application Web

L'app React Native fonctionne aussi sur le web grâce à Expo Web.

### Option A : Netlify (Recommandé)

#### Méthode 1 : Déploiement manuel

```bash
# Build la version web
npx expo export --platform web

# Déployer sur Netlify
npx netlify-cli deploy --prod --dir dist
```

#### Méthode 2 : Connexion GitHub (CI/CD automatique)

1. Va sur https://app.netlify.com
2. "Add new site" → "Import from Git"
3. Sélectionne ton repo CatDex
4. Configure le build :
   ```
   Build command: npx expo export --platform web
   Publish directory: dist
   ```
5. Variables d'environnement :
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_API_URL=https://catdex-api.onrender.com
   ```
6. Deploy!

**URL générée** : `https://catdex-xyz123.netlify.app` (personnalisable)

---

### Option B : Vercel

Même principe que Netlify :

```bash
npm install -g vercel
npx expo export --platform web
vercel --prod
```

Ou connecte directement ton repo GitHub sur https://vercel.com.

---

### Option C : GitHub Pages (Gratuit)

```bash
# Build
npx expo export --platform web

# Déployer sur GitHub Pages
npx gh-pages -d dist
```

Configure dans les settings du repo GitHub : Pages → Source → `gh-pages` branch.

**URL** : `https://ton-username.github.io/catdex`

---

## 📱 Partie 3 : Déployer l'Application Mobile (iOS & Android)

### Prérequis

1. **Compte Expo** (gratuit) : https://expo.dev/signup
2. **Installer EAS CLI** :
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. **Pour iOS** : Compte Apple Developer ($99/an)
4. **Pour Android** : Compte Google Play Console ($25 unique)

---

### Étape 1 : Configuration EAS

Le fichier `eas.json` est déjà configuré ! Vérifie juste que l'URL de l'API est correcte :

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://TON-API.onrender.com"
      }
    }
  }
}
```

Modifie l'URL avec celle de ton API déployée.

---

### Étape 2 : Build l'application

#### Pour iOS + Android en même temps :

```bash
eas build --platform all --profile production
```

#### Séparément :

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

Le build prend 10-20 minutes. Expo build les apps sur leurs serveurs.

---

### Étape 3 : Télécharger et tester

Une fois le build terminé :

```bash
# Télécharger l'APK Android
eas build:list
# Clique sur le lien de téléchargement dans la console

# Ou installer directement sur ton téléphone Android
eas build:run --platform android
```

Pour iOS, tu peux tester avec TestFlight avant de publier sur l'App Store.

---

### Étape 4 : Publier sur les stores

#### iOS (App Store)

```bash
eas submit --platform ios
```

Tu auras besoin de :
- Apple Developer account actif
- App Store Connect configuré (créer l'app manuellement d'abord)
- Screenshots, description, etc.

Guide complet : https://docs.expo.dev/submit/ios/

#### Android (Google Play)

```bash
eas submit --platform android
```

Tu auras besoin de :
- Google Play Console account
- Créer l'app sur la console d'abord
- Screenshots, description, etc.

Guide complet : https://docs.expo.dev/submit/android/

---

## 🔄 Mises à Jour (OTA)

Avec Expo, tu peux pousser des updates JavaScript/React sans rebuild :

```bash
# Update instantané pour tous les utilisateurs
eas update --branch production --message "Fix bug XYZ"
```

Les utilisateurs reçoivent l'update au prochain lancement de l'app !

**Limitations** : OTA fonctionne uniquement pour le code JS/React, pas pour :
- Modifications natives (permissions, plugins Expo)
- Changements dans `app.json` / `eas.json`

Pour ça, il faut rebuilder et republier.

---

## ⚙️ Configuration Post-Déploiement

### 1. Mettre à jour les URLs dans Supabase

Dans ton dashboard Supabase → Authentication → URL Configuration :

```
Site URL: https://catdex.netlify.app (ou ton domaine)

Redirect URLs:
- https://catdex.netlify.app/**
- catdex://
- exp://
```

### 2. Configurer OAuth (Google/Apple)

Si tu utilises l'auth sociale :

#### Google OAuth
1. Va sur https://console.cloud.google.com
2. Crée un projet
3. Configure OAuth consent screen
4. Crée des credentials (OAuth 2.0 Client ID) pour :
   - Web (pour la version web)
   - iOS (bundle ID: `com.catdex.app`)
   - Android (package: `com.catdex.app`, SHA-1 de ton keystore)
5. Ajoute les credentials dans Supabase → Auth → Providers → Google

#### Apple OAuth
1. Va sur https://developer.apple.com
2. Certificates, Identifiers & Profiles
3. Identifiers → App IDs → Configure Sign in with Apple
4. Create a Service ID pour le web
5. Ajoute les credentials dans Supabase → Auth → Providers → Apple

### 3. Activer l'auth sociale dans l'app

Édite `.env` :

```env
EXPO_PUBLIC_AUTH_GOOGLE=true
EXPO_PUBLIC_AUTH_APPLE=true
```

Rebuild et redéploie l'app.

---

## 🧪 Tester le Déploiement Complet

### 1. Test API

```bash
# Health check
curl https://ton-api.onrender.com/health

# Test analyze-cat (nécessite un Bearer token)
curl -X POST https://ton-api.onrender.com/analyze-cat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -d '{"imageBase64":"...","mimeType":"image/jpeg"}'
```

### 2. Test Web

1. Ouvre `https://catdex.netlify.app` (ou ton URL)
2. Créer un compte / Se connecter
3. Tester la navigation : Carte, CatDex, Scanner, Profil
4. Tester l'upload d'une photo de chat
5. Vérifier que l'analyse IA fonctionne

### 3. Test Mobile

1. Télécharge l'app depuis TestFlight (iOS) ou le lien EAS (Android)
2. Même tests que web
3. Tester les permissions (caméra, localisation)
4. Tester en mode avion puis reconnexion (offline sync)

---

## 🐛 Dépannage

### L'API ne démarre pas sur Render

**Cause** : Variables d'environnement manquantes

**Solution** :
```bash
# Vérifie les logs Render
# Dashboard → ton service → Logs

# Vérifie que OPENAI_API_KEY est défini et valide
```

### Cold start trop long sur Render

**Cause** : Plan gratuit Render met en veille l'instance

**Solutions** :
1. Upgrade vers le plan payant ($7/mois)
2. Utilise Railway ou un autre hébergeur
3. Configure un service de ping (cron) pour garder l'API éveillée (pas idéal)

### L'app mobile ne se connecte pas à l'API

**Causes possibles** :
1. `EXPO_PUBLIC_API_URL` mal configuré dans `eas.json`
2. CORS bloqué (normalement `origin: '*'` devrait marcher)
3. API en sommeil (Render free tier)

**Solution** :
```bash
# Rebuild avec la bonne URL
# Édite eas.json puis :
eas build --platform all --profile production --clear-cache
```

### L'upload de photos ne marche pas

**Cause** : Configuration Supabase Storage

**Solution** :
1. Dashboard Supabase → Storage
2. Crée le bucket `cat-photos` s'il n'existe pas
3. Configure les policies RLS (voir `supabase/README.md`)

### OAuth ne fonctionne pas

**Cause** : Redirect URLs mal configurées

**Solution** :
1. Dashboard Supabase → Auth → URL Configuration
2. Ajoute toutes les URLs :
   ```
   https://catdex.netlify.app/**
   catdex://**
   exp://**
   ```
3. Vérifie que les credentials OAuth (Google/Apple) sont corrects

---

## 💰 Coûts Estimés

### Plan Gratuit (pour commencer)

- **Supabase** : Gratuit (500 MB DB, 1 GB Storage, 50k auth users)
- **Render** : Gratuit (750h/mois, cold start après 15 min)
- **Netlify** : Gratuit (100 GB bandwidth/mois)
- **Expo** : Gratuit (builds illimités, mais queue plus longue)

**Total** : 0€/mois (parfait pour tester avec des amis)

**Limitations** :
- Cold start API ~30-50s après inactivité
- Pas de domaine personnalisé (tu peux en acheter un séparément)

### Plan Recommandé pour Production

- **Supabase Pro** : 25$/mois (8 GB DB, 100 GB Storage)
- **Render Starter** : 7$/mois (no cold start, toujours actif)
- **Netlify Pro** : 19$/mois (domaine personnalisé, plus de bandwidth)
- **Expo Production** : Gratuit ou 29$/mois pour priorité build

**Total** : ~31-55$/mois pour une app en production

### Stores

- **Apple Developer** : 99$/an (obligatoire pour iOS)
- **Google Play Console** : 25$ unique (obligatoire pour Android)

---

## 🎉 C'est Fini !

Ton CatDex est maintenant déployé en production ! 🚀

**Partage avec tes amis** :

- **Version Web** : `https://catdex.netlify.app`
- **iOS** : Lien TestFlight ou App Store
- **Android** : Lien de téléchargement EAS ou Google Play

**Prochaines étapes** :

1. Personnalise ton domaine (exemple : `catdex.app`)
2. Configure un monitoring (Sentry, LogRocket)
3. Ajoute Google Analytics / Mixpanel
4. Configure des notifications push
5. Optimise les performances (caching, CDN)

**Questions ?** Ouvre une issue sur GitHub ou contacte-moi !

---

## 📚 Ressources

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [Supabase Documentation](https://supabase.com/docs)
- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Guide de publication iOS](https://docs.expo.dev/submit/ios/)
- [Guide de publication Android](https://docs.expo.dev/submit/android/)
