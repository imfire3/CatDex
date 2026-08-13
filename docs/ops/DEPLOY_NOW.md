# 🚀 Déployer CatDex sur Render.com MAINTENANT

> Pour une nouvelle installation, commence par
> [`docs/releases/SUPABASE_CLEAN_START.md`](./docs/releases/SUPABASE_CLEAN_START.md),
> puis suis [`docs/releases/WEB_BETA.md`](./docs/releases/WEB_BETA.md). Les
> anciennes instructions ci-dessous sont conservées comme aide détaillée.

## ✅ C'est Prêt !

Le fichier `render.yaml` est maintenant sur la branche **main** de GitHub !

---

## 📋 Étapes pour Déployer (5 minutes)

### 1️⃣ Va sur Render.com

**Lien direct** : https://dashboard.render.com

- Si tu n'as pas de compte : **"Get Started"** → **Sign up with GitHub**
- Si tu as un compte : **Sign in**

### 2️⃣ Connecte le Repo GitHub

1. Clique sur **"New +"** (en haut à droite)
2. Sélectionne **"Blueprint"**
3. Si c'est la première fois : **"Connect GitHub"** → Autorise Render
4. Sélectionne le repo **"CatDex"** (ou imfire3/CatDex)
5. Render va détecter automatiquement `render.yaml` ✅

Tu verras :
```
✓ Found render.yaml
✓ 1 service: catdex-api
```

### 3️⃣ Configure les Variables d'Environnement

**IMPORTANT** : Clique sur le service `catdex-api` dans la prévisualisation.

Tu verras plusieurs variables. **Configure SEULEMENT celles-ci** :

| Variable | Valeur | Où la trouver |
|----------|--------|---------------|
| `OPENAI_API_KEY` | `sk-proj-...` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `SUPABASE_URL` | `https://xyz.supabase.co` | Dashboard Supabase → Settings → API |
| `SUPABASE_JWT_SECRET` | `secret-key` | Dashboard Supabase → Settings → API → JWT Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | clé secrète serveur | Dashboard Supabase → Settings → API |

**Les autres sont déjà configurées** :
- ✅ `NODE_ENV=production`
- ✅ `PORT=8787`
- ✅ `OPENAI_MODEL=gpt-4o-mini`
- ✅ `API_SECRET` (auto-généré)

### 4️⃣ Déployer !

1. Clique sur **"Apply"** (en bas)
2. Render va :
   - ✅ Cloner le repo
   - ✅ Builder l'image Docker
   - ✅ Déployer l'API
   - ✅ Vérifier `/health`

**Temps d'attente** : 3-5 minutes ⏱️

### 5️⃣ Récupérer l'URL de l'API

Une fois le déploiement terminé (status "Live" vert) :

1. En haut de la page, tu verras l'URL
2. Format : `https://catdex-api-xyz.onrender.com`
3. **Note cette URL** ✍️

### 6️⃣ Tester l'API

Dans ton terminal :

```bash
curl https://TON-API.onrender.com/health
```

**Réponse attendue** :
```json
{"ok":true,"service":"catdex-api"}
```

✅ **Si tu vois ça, l'API est en ligne !** 🎉

---

## 🔑 Tu N'as Pas les Clés API ?

### Guide Complet

👉 **[KEYS_TO_GET.md](./KEYS_TO_GET.md)**

### Résumé Ultra Rapide

#### OpenAI (2 min)
1. https://platform.openai.com/api-keys
2. "Create new secret key"
3. Copie `sk-proj-...`

#### Supabase (5 min)
1. https://supabase.com/dashboard
2. "New project" → Nom : `catdex`
3. Settings → API :
   - **Project URL** : `https://xyz.supabase.co`
   - **anon key** : `eyJhbGc...`
   - **JWT Secret** : (scroll en bas)

#### Configuration Supabase
1. **SQL Editor** → Copie le contenu de `supabase/schema.sql` → Run
2. **Storage** → Create bucket → Nom : `cat-photos` (Public ✅)

---

## 🐛 Problèmes ?

### ❌ "Blueprint file not found"

✅ **RÉSOLU** ! Le fichier est maintenant sur `main`.

Si tu vois encore l'erreur :
1. Rafraîchis la page Render
2. Ou reconnecte le repo GitHub
3. Le fichier `render.yaml` est bien là maintenant !

### ❌ "OPENAI_API_KEY missing"

Tu n'as pas configuré la clé OpenAI dans Render.

**Solution** :
1. Dashboard Render → Ton service
2. **Environment** (menu gauche)
3. Ajoute `OPENAI_API_KEY=sk-proj-...`
4. Sauvegarde

### ❌ API ne démarre pas

**Check les logs** :
```
Dashboard Render → Service → Logs
```

Regarde l'erreur et consulte `TROUBLESHOOTING.md`.

---

## 📱 Après le Déploiement API

### Mettre à Jour ton App Locale

Sur ton Mac :

```bash
cd ~/Documents/catdexapp

# Édite .env
nano .env
```

Change :
```env
EXPO_PUBLIC_API_URL=https://TON-API.onrender.com
```

Redémarre Expo :
```bash
npm start
```

### Tester avec Expo Go

1. Scanne le QR code
2. Créer un compte
3. Scanner un chat
4. L'API sur Render va l'analyser ! 🎉

---

## 💰 Coût

**Plan Gratuit Render** : 0€/mois
- ⚠️ L'API s'endort après 15 min d'inactivité
- Premier appel = 30-50s (réveil)
- Ensuite = normal (2-4s)

**Upgrade Starter** : 7$/mois
- Pas de cold start
- Toujours actif

---

## 📚 Guides Complets

- **Clés API** : [KEYS_TO_GET.md](./KEYS_TO_GET.md)
- **Setup Render** : [RENDER_SETUP_GUIDE.md](./RENDER_SETUP_GUIDE.md)
- **Aide-mémoire** : [RENDER_CHEATSHEET.md](./RENDER_CHEATSHEET.md)
- **Troubleshooting** : [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## 🎯 Récapitulatif

1. ✅ `render.yaml` est sur `main`
2. 🔑 Obtiens 3 clés (OpenAI + Supabase)
3. 🚀 Va sur Render → Blueprint → Configure → Deploy
4. ⏱️ Attends 3-5 min
5. ✅ Note l'URL de l'API
6. 📱 Teste avec Expo Go

**C'est tout !** 🎉

---

**Prêt ? Va sur** 👉 https://dashboard.render.com
