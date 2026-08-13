# 🚀 Guide de Déploiement Render.com - CatDex

Guide pas-à-pas pour déployer ton API CatDex sur Render.com en 10 minutes.

---

## ✅ Ce qui est Déjà Prêt

Ton projet contient déjà :
- ✅ `render.yaml` - Configuration automatique
- ✅ `server/Dockerfile` - Image Docker pour l'API
- ✅ `server/package.json` - Dépendances Node.js
- ✅ Code API complet dans `server/src/`

**Tu n'as besoin que de 3 clés pour déployer !**

---

## 📋 Étape 0 : Préparer les Clés (5 minutes)

Avant de déployer sur Render, tu dois obtenir 3 clés. Voici comment :

### 1️⃣ OpenAI API Key (OBLIGATOIRE)

**C'est quoi ?** La clé pour utiliser GPT-4o-mini qui analyse les photos de chats.

**Comment l'obtenir :**

1. Va sur https://platform.openai.com/api-keys
2. Clique sur **"Create new secret key"**
3. Nom : `CatDex API Key`
4. Copie la clé (commence par `sk-proj-...`)
5. ⚠️ **Sauvegarde-la maintenant**, tu ne pourras plus la voir !

**Coût estimé :** ~3-5€/mois pour quelques centaines d'analyses

📝 Note ta clé ici (temporaire) :
```
OPENAI_API_KEY=sk-proj-___________________________
```

---

### 2️⃣ Supabase URL & JWT Secret

**C'est quoi ?** Supabase est ta base de données + authentification.

#### A. Créer un Projet Supabase

1. Va sur https://supabase.com/dashboard
2. Clique sur **"New project"**
3. Remplis :
   - **Name** : `catdex`
   - **Database Password** : Choisis un mot de passe fort
   - **Region** : Paris (proche de tes utilisateurs)
   - **Plan** : Free
4. Clique **"Create new project"**
5. Attends 2-3 minutes que le projet se crée ☕

#### B. Configuration de la Base de Données

1. Une fois le projet créé, va dans **SQL Editor** (menu gauche)
2. Clique sur **"New query"**
3. Copie-colle **tout** le contenu du fichier `supabase/schema.sql` de ton projet
4. Clique **"Run"** (ou Ctrl+Enter)
5. Tu devrais voir : "Success. No rows returned"

#### C. Configuration du Storage

1. Va dans **Storage** (menu gauche)
2. Clique **"Create a new bucket"**
3. Nom : `cat-photos`
4. **Public bucket** : ✅ Coché (important !)
5. Clique **"Create bucket"**

#### D. Récupérer les Clés

1. Va dans **Settings** → **API** (menu gauche)

2. **Project URL** (en haut)
   ```
   SUPABASE_URL=https://xyzabc123.supabase.co
   ```
   📝 Note-la :
   ```
   SUPABASE_URL=___________________________
   ```

3. **Anon / Public Key** (section "Project API keys")
   ```
   SUPABASE_ANON_KEY=eyJhbGc...
   ```
   📝 Note-la :
   ```
   SUPABASE_ANON_KEY=___________________________
   ```

4. Scroll jusqu'à **JWT Secret** (section "JWT Settings")
   ```
   SUPABASE_JWT_SECRET=your-super-secret-jwt-key
   ```
   📝 Note-la :
   ```
   SUPABASE_JWT_SECRET=___________________________
   ```

---

## 🚀 Étape 1 : Déployer sur Render.com

### A. Connecter GitHub

1. Va sur https://dashboard.render.com
2. Clique **"Get Started"** (si nouveau compte)
3. **"Sign up with GitHub"** → Connecte-toi avec ton compte GitHub
4. Autorise Render à accéder à tes repos

### B. Créer le Service via Blueprint

1. Dans le dashboard Render, clique **"New +"** (en haut à droite)
2. Sélectionne **"Blueprint"**
3. Cherche et sélectionne ton repo **"CatDex"**
4. Render va détecter automatiquement le fichier `render.yaml` 🎉
5. Tu verras : "Found 1 service: catdex-api"

### C. Configurer les Variables d'Environnement

**Très important !** Clique sur le service `catdex-api` dans la preview.

Tu verras une liste de variables. Configure celles-ci avec les clés que tu as notées :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` (déjà configuré) |
| `PORT` | `8787` (déjà configuré) |
| `OPENAI_MODEL` | `gpt-4o-mini` (déjà configuré) |
| `OPENAI_API_KEY` | **Ta clé OpenAI** (sk-proj-...) |
| `SUPABASE_URL` | **Ton URL Supabase** (https://xyz.supabase.co) |
| `SUPABASE_JWT_SECRET` | **Ton JWT Secret Supabase** |
| `API_SECRET` | Auto-généré par Render ✅ |

### D. Déployer !

1. Une fois les variables configurées, clique **"Apply"**
2. Render va :
   - Clone ton repo GitHub ✅
   - Build l'image Docker ✅
   - Déploie le conteneur ✅
   - Vérifie `/health` ✅

**Temps de déploiement :** 3-5 minutes ⏱️

### E. Récupérer l'URL de ton API

1. Une fois le déploiement terminé (status "Live" en vert)
2. En haut de la page, tu verras l'URL de ton API
3. Exemple : `https://catdex-api.onrender.com`

📝 Note ton URL :
```
API_URL=___________________________
```

---

## ✅ Étape 2 : Vérifier que l'API Fonctionne

### Test 1 : Health Check

```bash
curl https://TON-API.onrender.com/health
```

**Réponse attendue :**
```json
{"ok":true,"service":"catdex-api"}
```

✅ Si tu vois ça, l'API fonctionne !

### Test 2 : Analyser une Photo (optionnel)

Pour tester `/analyze-cat`, tu as besoin d'un token Supabase. On fera ça plus tard depuis l'app.

---

## 🌐 Étape 3 : Configurer l'App Mobile/Web

Maintenant que l'API est déployée, configure l'app pour l'utiliser.

### A. Modifier `.env` Local

```bash
cd /workspace
nano .env
```

Modifie :
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://TON-URL.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# API (ton URL Render)
EXPO_PUBLIC_API_URL=https://TON-API.onrender.com
```

### B. Modifier `eas.json` (pour builds mobiles)

```bash
nano eas.json
```

Dans la section `production` :
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

---

## 📱 Étape 4 : Tester l'App Complète

### Option A : Test Local avec Expo Go

```bash
cd /workspace
npm start
# Scanne le QR code avec Expo Go
```

Tu peux maintenant :
1. Créer un compte (email + password)
2. Scanner un chat
3. L'API sur Render va analyser la photo !

### Option B : Déployer la Version Web

```bash
# Build
npm run web:build

# Déployer sur Netlify
npx netlify-cli deploy --prod --dir dist
```

Configure les mêmes variables d'environnement dans Netlify :
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL`

---

## 🎉 C'est Fini !

### ✅ Checklist Finale

- [ ] Projet Supabase créé
- [ ] Tables créées (via schema.sql)
- [ ] Bucket `cat-photos` créé
- [ ] Clés Supabase notées
- [ ] Clé OpenAI obtenue
- [ ] API déployée sur Render
- [ ] Health check OK
- [ ] `.env` configuré avec les bonnes URLs
- [ ] App testée avec Expo Go

**Tout coché ?** 🎊 Ton CatDex est en ligne !

---

## 💰 Récapitulatif des Coûts

| Service | Plan | Coût |
|---------|------|------|
| **Supabase** | Free | 0€ |
| **Render** | Free | 0€ |
| **OpenAI** | Pay-as-you-go | ~3-5€/mois |
| **Total** | | **3-5€/mois** |

⚠️ **Limitation Render gratuit** : L'API s'endort après 15 min d'inactivité. Le premier appel prend ~30-50s à se réveiller.

**Solution** : Upgrade vers Render Starter ($7/mois) = pas de cold start.

---

## 🆘 Problèmes Courants

### ❌ "OPENAI_API_KEY missing"

- Va dans Dashboard Render → Ton service → **Environment**
- Vérifie que `OPENAI_API_KEY` est bien configuré avec ta vraie clé
- Redémarre le service : **Manual Deploy** → **Deploy latest commit**

### ❌ "Non autorisé" dans l'app

- Vérifie que `SUPABASE_JWT_SECRET` est correct dans Render
- C'est le **JWT Secret**, pas l'anon key !

### ❌ API lente (30-50s)

- C'est normal sur le plan gratuit (cold start)
- Première requête après inactivité = réveil de l'instance
- Ensuite c'est rapide (~2-4s par analyse)

---

## 📚 Ressources

- **Documentation complète** : `./DEPLOYMENT.md`
- **Troubleshooting** : `docs/TROUBLESHOOTING.md`
- **Architecture** : `docs/ARCHITECTURE.md`
- **Support Render** : https://render.com/docs

---

## 🎯 Prochaines Étapes

1. ✅ Teste l'app avec tes amis
2. 📱 Build les apps mobiles (voir `../MOBILE_DEPLOYMENT.md`)
3. 🌐 Partage la version web (voir `../getting-started.md`)
4. 📊 Configure Google Analytics (optionnel)
5. 🔔 Active les notifications push (optionnel)

**Bon déploiement !** 🚀🐱
