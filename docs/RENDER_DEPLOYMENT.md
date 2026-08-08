# Déploiement de l'API CatDex sur Render.com 🚀

Guide pas-à-pas pour déployer l'API d'analyse de chats sur Render.com (plan gratuit).

## Pourquoi Render ?

- ✅ **Gratuit** : 750 heures/mois gratuites
- ✅ **Simple** : Détection automatique via `render.yaml`
- ✅ **HTTPS** : Certificat SSL automatique
- ✅ **CI/CD** : Déploiement automatique à chaque push Git
- ⚠️ **Cold start** : L'instance s'endort après 15 min d'inactivité (plan gratuit)

---

## Étape 1 : Créer un compte Render

1. Va sur https://dashboard.render.com
2. Clique sur **"Get Started"**
3. Connecte-toi avec **GitHub** (recommandé pour le CI/CD)

---

## Étape 2 : Connecter le dépôt GitHub

### Option A : Blueprint (Automatique - Recommandé)

Le fichier `render.yaml` à la racine du projet configure tout automatiquement !

1. Dans le dashboard Render, clique sur **"New +"**
2. Sélectionne **"Blueprint"**
3. Connecte ton repo GitHub si ce n'est pas déjà fait
4. Sélectionne le repo **CatDex**
5. Render détecte automatiquement `render.yaml` 🎉
6. Clique sur **"Apply"**

Le `render.yaml` contient :

```yaml
services:
  - type: web
    name: catdex-api
    runtime: docker
    rootDir: server
    dockerfilePath: ./Dockerfile
    plan: free
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "8787"
      - key: OPENAI_MODEL
        value: gpt-4o-mini
      - key: OPENAI_API_KEY
        sync: false
      - key: API_SECRET
        generateValue: true
```

**Render va créer** :
- Un service web Docker
- Port 8787
- Health check sur `/health`
- Variable `API_SECRET` auto-générée

---

### Option B : Manuelle

Si tu préfères configurer manuellement :

1. Dans le dashboard, clique sur **"New +"** → **"Web Service"**
2. Connecte ton repo GitHub
3. Configure :
   - **Name** : `catdex-api`
   - **Root Directory** : `server`
   - **Runtime** : `Docker`
   - **Build Command** : *(auto-détecté via Dockerfile)*
   - **Start Command** : *(auto-détecté via Dockerfile)*
   - **Plan** : `Free`

---

## Étape 3 : Configurer les Variables d'Environnement

**Critical** : Render a besoin de tes clés API pour fonctionner !

### Variables obligatoires

Dans le dashboard Render → Ton service → **Environment** :

#### 1. OPENAI_API_KEY (OBLIGATOIRE)

```
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Où trouver ?**
1. Va sur https://platform.openai.com/api-keys
2. Clique sur **"Create new secret key"**
3. Copie la clé (commence par `sk-proj-...` ou `sk-...`)
4. ⚠️ **Sauvegarde-la** : tu ne pourras plus la voir après !

**Coût** : ~$0.10 par 100 analyses avec `gpt-4o-mini` (très économique)

---

#### 2. SUPABASE_URL

```
SUPABASE_URL=https://xyzabc123.supabase.co
```

**Où trouver ?**
1. Dashboard Supabase → Ton projet
2. **Settings** → **API**
3. Copie **Project URL**

---

#### 3. SUPABASE_JWT_SECRET

```
SUPABASE_JWT_SECRET=your-jwt-secret-here-very-long-string
```

**Où trouver ?**
1. Dashboard Supabase → Ton projet
2. **Settings** → **API**
3. Scroll jusqu'à **JWT Secret**
4. Copie le secret (pour HS256 projects)

**Pourquoi ?** L'API vérifie les tokens d'authentification Supabase pour sécuriser l'endpoint `/analyze-cat`.

---

#### 4. OPENAI_MODEL (Optionnel)

```
OPENAI_MODEL=gpt-4o-mini
```

Par défaut : `gpt-4o-mini` (le plus économique).

Alternatives :
- `gpt-4o` : Plus précis, plus cher (~10x le prix)
- `gpt-4-turbo` : Ancien modèle

---

### Variables auto-configurées par Render

Ces variables sont déjà configurées dans `render.yaml` :

```
NODE_ENV=production
PORT=8787
API_SECRET=<auto-généré par Render>
```

Tu n'as pas besoin de les ajouter manuellement.

---

### Variables optionnelles

#### Désactiver le cutout (économiser du temps/CPU)

```
SKIP_CUTOUT=1
```

Par défaut, l'API génère une version détourée (background removed) de chaque photo. Ça prend ~1-2 secondes. Si tu veux accélérer, ajoute `SKIP_CUTOUT=1`.

#### Ajuster les limites

```
ANALYZE_RATE_LIMIT=20
ANALYZE_MAX_BYTES=5000000
CUTOUT_BUDGET_MS=1200
```

- **ANALYZE_RATE_LIMIT** : Nombre max d'analyses par utilisateur/heure (défaut: 20)
- **ANALYZE_MAX_BYTES** : Taille max d'image en bytes (défaut: 5MB)
- **CUTOUT_BUDGET_MS** : Timeout pour le background removal (défaut: 1200ms)

---

## Étape 4 : Déployer

Une fois les variables configurées :

1. Dans le dashboard Render, clique sur **"Manual Deploy"** → **"Deploy latest commit"**
2. Render va :
   - Cloner le repo
   - Builder l'image Docker
   - Démarrer le conteneur
   - Vérifier `/health`

**Temps estimé** : 3-5 minutes pour le premier déploiement.

---

## Étape 5 : Vérifier le Déploiement

### 1. Check les logs

Dans le dashboard → Ton service → **Logs**

Tu devrais voir :

```
CatDex API ready on http://0.0.0.0:8787
```

### 2. Test l'endpoint health

Note l'URL de ton service (exemple : `https://catdex-api.onrender.com`).

```bash
curl https://ton-api.onrender.com/health
```

**Réponse attendue** :

```json
{
  "ok": true,
  "service": "catdex-api"
}
```

✅ Si tu vois ça, l'API fonctionne !

---

### 3. Test l'analyse (avec un token Supabase)

Pour tester `/analyze-cat`, tu as besoin d'un token d'authentification.

**Récupérer un token** :

1. Ouvre ton app CatDex en local
2. Connecte-toi avec un compte
3. Dans le code, log le token :

```typescript
// src/lib/supabase.ts
const { data: { session } } = await supabase.auth.getSession();
console.log('Access Token:', session?.access_token);
```

Copie le token.

**Tester l'API** :

```bash
# Remplace YOUR_TOKEN et image en base64
curl -X POST https://ton-api.onrender.com/analyze-cat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -d '{
    "imageBase64": "/9j/4AAQSkZJRgABAQAAAQ...",
    "mimeType": "image/jpeg"
  }'
```

**Réponse attendue** :

```json
{
  "analysis": {
    "suggestedName": "Minou",
    "breed": "Européen",
    "color": "Tigré",
    "coat": "Tigré",
    "tags": ["mignon", "joueur"],
    "distinctiveFeatures": ["Tache blanche sur le poitrail"],
    "description": "Un chat européen tigré avec...",
    "confidence": "high",
    "notACat": false
  },
  "mocked": false
}
```

---

## Étape 6 : Configurer l'App

Maintenant que l'API est déployée, configure l'app pour pointer vers elle.

### Option A : Modifier .env (local)

```bash
# .env
EXPO_PUBLIC_API_URL=https://ton-api.onrender.com
```

### Option B : Modifier eas.json (production mobile)

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://ton-api.onrender.com"
      }
    }
  }
}
```

### Option C : Variables d'environnement Netlify/Vercel (web)

Si tu déploies le web sur Netlify/Vercel :

1. Dashboard → Ton site → **Environment variables**
2. Ajoute :
   ```
   EXPO_PUBLIC_API_URL=https://ton-api.onrender.com
   ```

---

## CI/CD Automatique

Avec Render Blueprint, **chaque push sur `main`** redéploie automatiquement l'API !

Workflow :

```bash
# Modifier server/src/index.ts
git add server/
git commit -m "feat: Improve cat analysis prompt"
git push origin main

# Render détecte le push et redéploie automatiquement
```

Suivi du déploiement : Dashboard Render → Ton service → **Events**

---

## ⚠️ Limitations du Plan Gratuit

### Cold Start

L'instance **s'endort après 15 min** d'inactivité.

Au prochain appel `/analyze-cat` :
- **Réveil** : 30-50 secondes
- Puis normal

**Impact** : Les premiers utilisateurs après inactivité attendent ~1 minute.

**Solutions** :

1. **Keep-alive ping** (pas recommandé, consomme les heures gratuites) :
   ```bash
   # Cron job pour ping /health toutes les 10 min
   */10 * * * * curl https://ton-api.onrender.com/health
   ```

2. **Upgrade vers Starter ($7/mois)** :
   - Pas de cold start
   - Toujours actif
   - Recommandé pour production

3. **Utiliser Railway** (pas de cold start, $5 gratuit/mois) :
   - Voir `DEPLOYMENT.md` → Section Railway

---

### Limites de ressources

- **RAM** : 512 MB (plan gratuit)
- **CPU** : Partagé
- **Bandwidth** : 100 GB/mois
- **Build minutes** : 500 min/mois

Pour CatDex, ces limites sont largement suffisantes pour des dizaines d'utilisateurs.

---

## Monitoring

### Logs en temps réel

```bash
# Dashboard Render → Ton service → Logs
```

Ou avec Render CLI :

```bash
npm install -g render

render login
render logs <service-id> --tail
```

### Métriques

Dashboard → Ton service → **Metrics** :
- CPU usage
- Memory usage
- Response times
- Error rates

---

## Dépannage

### ❌ Erreur : "OPENAI_API_KEY missing or placeholder"

**Cause** : `OPENAI_API_KEY` pas configuré ou invalide.

**Solution** :
1. Dashboard Render → Environment
2. Ajoute `OPENAI_API_KEY=sk-proj-XXX` (ta vraie clé)
3. Clique sur **"Save Changes"**
4. Render redéploie automatiquement

---

### ❌ Erreur : "Non autorisé. Connecte-toi pour analyser une photo."

**Cause** : Token Supabase invalide ou expiré.

**Solution** :
1. Vérifie que `SUPABASE_JWT_SECRET` est correct
2. Vérifie que le token Bearer est valide (pas expiré)
3. En dev, tu peux désactiver l'auth :
   ```env
   ALLOW_UNAUTH_ANALYZE=1
   ```
   ⚠️ **Ne JAMAIS activer en production** !

---

### ❌ Build échoue : "Docker build failed"

**Cause** : Problème avec le Dockerfile ou dépendances natives.

**Solution** :
1. Check les logs Render → Build logs
2. Le Dockerfile a besoin de `ca-certificates` pour `onnxruntime` (@imgly/background-removal-node)
3. Vérifie que `server/Dockerfile` est correct

Si besoin, rebuild en local pour debug :

```bash
cd server
docker build -t catdex-api .
docker run -p 8787:8787 --env-file .env catdex-api
```

---

### ❌ Cold start trop long

**Cause** : Plan gratuit Render.

**Solutions** :
1. **Upgrade vers Starter** ($7/mois) → Pas de cold start
2. **Migrer vers Railway** → Voir `DEPLOYMENT.md`
3. **Keep-alive ping** (pas idéal, consomme les heures gratuites)

---

### ❌ Rate limit atteint

**Cause** : Un utilisateur fait trop d'appels `/analyze-cat`.

**Solution** :

L'API a un rate limit par défaut : 20 analyses/heure/user.

Ajuste si besoin :

```env
ANALYZE_RATE_LIMIT=50
```

---

## Coûts OpenAI

### Estimation avec gpt-4o-mini

- **Input** : $0.150 / 1M tokens (~$0.00015 par analyse)
- **Output** : $0.600 / 1M tokens (~$0.0006 par analyse)

**Total par analyse** : ~$0.001 (0.1 centime)

**100 analyses/jour** : ~$0.10/jour = **$3/mois**

**1000 analyses/jour** : ~$1/jour = **$30/mois**

Très économique pour démarrer ! 🎉

---

## Alternative : Migrer vers Railway

Si le cold start Render te gêne, Railway est une excellente alternative :

**Avantages** :
- Pas de cold start
- $5 gratuit/mois
- Deploy ultra rapide

**Inconvénients** :
- Après $5, commence à facturer
- Moins de features gratuites que Render

Voir **`DEPLOYMENT.md`** → Section Railway pour les instructions.

---

## Checklist Finale

Avant de partager l'app à tes amis :

- [ ] API déployée sur Render
- [ ] `OPENAI_API_KEY` configuré (clé valide)
- [ ] `SUPABASE_URL` configuré
- [ ] `SUPABASE_JWT_SECRET` configuré
- [ ] Health check OK : `/health` retourne `{"ok":true}`
- [ ] Test `/analyze-cat` avec un token Supabase
- [ ] URL de l'API notée : `https://ton-api.onrender.com`
- [ ] App configurée avec `EXPO_PUBLIC_API_URL`

**Tout bon ?** L'API est prête ! 🚀

Prochaine étape : Déployer l'app (voir `MOBILE_DEPLOYMENT.md`)
