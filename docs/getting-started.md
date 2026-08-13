# 🚀 Démarrage Rapide - CatDex

> **Navigation** : [README](../README.md) · [Ops](./ops/README.md) · [Téléphone](./phone-quickstart.md) · [Sécurité](../SECURITY.md)

Guide rapide pour mettre CatDex en ligne en 30 minutes !

## Ce dont tu as besoin

- [ ] Compte GitHub (gratuit)
- [ ] Compte Supabase (gratuit) - https://supabase.com
- [ ] Compte OpenAI (payant ~$5/mois) - https://platform.openai.com
- [ ] Compte Render (gratuit) - https://render.com
- [ ] Compte Netlify (gratuit) - https://netlify.com

**Coût total** : ~0-10€/mois pour commencer

---

## Étape 1 : Configurer Supabase (5 min)

1. Crée un projet sur https://supabase.com/dashboard
2. Va dans **SQL Editor** → Copie-colle le contenu de `supabase/schema.sql`
3. Exécute le script (bouton Run)
4. Va dans **Storage** → Crée un bucket `cat-photos` (public)
5. Note tes clés :
   - Project URL : `https://xyz.supabase.co`
   - Anon Key : `eyJhbGc...`
   - JWT Secret : `your-jwt-secret`

✅ Base de données prête !

---

## Étape 2 : Configurer l'API (10 min)

### Obtenir une clé OpenAI

1. Va sur https://platform.openai.com/api-keys
2. Crée une nouvelle clé → **Create new secret key**
3. Copie la clé (commence par `sk-proj-...`)
4. Ajoute $5-10 de crédit sur ton compte (Settings → Billing)

### Déployer sur Render

1. Fork ou push ce repo sur ton GitHub
2. Va sur https://dashboard.render.com
3. **New +** → **Blueprint**
4. Connecte ton repo GitHub
5. Sélectionne le repo CatDex
6. Render détecte `render.yaml` automatiquement
7. Configure les variables d'environnement :
   ```
   OPENAI_API_KEY=sk-proj-xxx
   SUPABASE_URL=https://xyz.supabase.co
   SUPABASE_JWT_SECRET=your-jwt-secret
   ```
8. Clique sur **Apply** → Attends 3-5 min

9. Note l'URL de ton API : `https://catdex-api-xyz.onrender.com`

✅ API déployée !

---

## Étape 3 : Configurer l'App (2 min)

### En local

```bash
cp .env.example .env
nano .env
```

Modifie :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=https://catdex-api-xyz.onrender.com
```

### Pour le déploiement

Dans `eas.json`, modifie :

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://catdex-api-xyz.onrender.com"
      }
    }
  }
}
```

✅ App configurée !

---

## Étape 4 : Déployer la Version Web (5 min)

### Option 1 : Netlify (recommandé)

```bash
# Build
npm run web:build

# Déployer
npx netlify-cli deploy --prod --dir dist
```

Ou connecte ton repo GitHub directement :

1. https://app.netlify.com → **Add new site**
2. Import from Git → Sélectionne ton repo
3. Build command : `npm run web:build`
4. Publish directory : `dist`
5. Variables d'environnement :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   EXPO_PUBLIC_API_URL=https://catdex-api-xyz.onrender.com
   ```
6. Deploy site !

### Option 2 : Vercel

```bash
npm install -g vercel
npm run web:build
vercel --prod
```

✅ App web en ligne ! Exemple : `https://catdex.netlify.app`

---

## Étape 5 : Configurer les Redirects Supabase (1 min)

Dans Supabase → **Authentication** → **URL Configuration** :

```
Site URL: https://catdex.netlify.app

Redirect URLs:
- https://catdex.netlify.app/**
- catdex://**
```

✅ OAuth configuré !

---

## Étape 6 : Tester ! 🎉

1. Ouvre `https://catdex.netlify.app` (ou ton URL)
2. Crée un compte avec email/password
3. Va dans **Scanner** → Upload une photo de chat
4. L'IA devrait analyser la photo en 2-3 secondes
5. Le chat apparaît dans ton CatDex et sur la carte !

**Ça marche ?** 🎊 Félicitations, CatDex est en ligne !

**Ça ne marche pas ?** Voir la section Dépannage ci-dessous.

---

## Partager avec tes Amis

### Version Web (immédiat)

Partage simplement le lien : `https://catdex.netlify.app`

Tes amis peuvent créer un compte et commencer à utiliser CatDex immédiatement ! 🐱

### Version Mobile (optionnel)

Pour avoir une vraie app iOS/Android, voir [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md).

Temps estimé : 15-30 min + 1-3 jours de review Apple/Google.

---

## Dépannage Rapide

### ❌ "API error" dans l'app

**Vérifications** :

1. L'API Render est bien démarrée ?
   ```bash
   curl https://ton-api.onrender.com/health
   # Doit retourner: {"ok":true,"service":"catdex-api"}
   ```

2. La clé OpenAI est valide ?
   - Dashboard Render → Environment → `OPENAI_API_KEY`
   - Vérifie qu'elle commence par `sk-proj-` ou `sk-`

3. L'URL de l'API est correcte dans l'app ?
   - Vérifie `.env` (local) ou variables Netlify (web)

### ❌ "Non autorisé" lors de l'analyse

**Cause** : L'API ne peut pas vérifier le token Supabase.

**Solution** :

1. Vérifie `SUPABASE_JWT_SECRET` dans Render
   - Dashboard Supabase → Settings → API → JWT Secret
2. Redémarre l'API Render après modification

### ❌ L'API est lente (30-50 secondes)

**Cause** : Cold start Render (plan gratuit).

L'instance s'endort après 15 min d'inactivité. Au premier appel, elle met 30-50 secondes à se réveiller.

**Solutions** :

- Accepter le délai (gratuit)
- Upgrade Render Starter : $7/mois → pas de cold start
- Utiliser Railway : $5 gratuit/mois, pas de cold start

### ❌ Photos ne s'uploadent pas

**Cause** : Bucket Supabase mal configuré.

**Solution** :

1. Dashboard Supabase → Storage → `cat-photos`
2. Vérifie que le bucket est **public**
3. Policies → Make public (voir `supabase/README.md`)

### ❌ OAuth Google/Apple ne marche pas

**Cause** : Providers pas configurés dans Supabase.

**Solution** :

Ne les active dans l'app qu'APRÈS avoir configuré les providers dans Supabase → Authentication → Providers.

Voir [DEPLOYMENT.md](./ops/DEPLOYMENT.md) section OAuth pour les détails.

---

## Prochaines Étapes

- [ ] Personnalise l'app (couleurs, nom, logo)
- [ ] Ajoute un domaine personnalisé (exemple : `catdex.app`)
- [ ] Configure Google Analytics
- [ ] Build les apps mobiles natives (iOS/Android)
- [ ] Invite tes amis à tester !

---

## Besoin d'aide ?

- **Guides complets** : [DEPLOYMENT.md](./ops/DEPLOYMENT.md)
- **API Render** : [docs/RENDER_DEPLOYMENT.md](./docs/RENDER_DEPLOYMENT.md)
- **Apps mobiles** : [docs/MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md)
- **Supabase** : [supabase/README.md](./supabase/README.md)

**Problème ?** Ouvre une issue sur GitHub !

---

## Récapitulatif des Coûts

### Gratuit pour commencer

- ✅ Supabase : Gratuit (500 MB, 1 GB Storage)
- ✅ Render : Gratuit (750h/mois, cold start)
- ✅ Netlify : Gratuit (100 GB bandwidth)
- ⚠️ OpenAI : ~$3-5/mois (selon usage)

**Total** : ~3-5€/mois

### Pour production

- Supabase Pro : $25/mois
- Render Starter : $7/mois (pas de cold start)
- OpenAI : $5-30/mois (selon usage)
- Netlify : Gratuit ou $19/mois (Pro)

**Total** : ~37-81€/mois

### Stores (optionnel)

- Apple Developer : $99/an
- Google Play : $25 unique

---

Bon déploiement ! 🚀🐱
