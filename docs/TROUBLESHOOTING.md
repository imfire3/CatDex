# Guide de Dépannage CatDex 🔧

Guide complet pour résoudre les problèmes courants lors du déploiement et de l'utilisation de CatDex.

## Table des Matières

1. [Problèmes de Déploiement](#problèmes-de-déploiement)
2. [Problèmes d'API](#problèmes-dapi)
3. [Problèmes d'Authentification](#problèmes-dauthentification)
4. [Problèmes de Build Mobile](#problèmes-de-build-mobile)
5. [Problèmes de Performance](#problèmes-de-performance)
6. [Problèmes de Photos](#problèmes-de-photos)

---

## Problèmes de Déploiement

### ❌ "render.yaml not found"

**Symptôme** : Render ne détecte pas le Blueprint.

**Cause** : Le fichier `render.yaml` n'est pas à la racine du repo.

**Solution** :
```bash
# Vérifier la présence du fichier
ls -la render.yaml

# S'il n'existe pas, le créer ou le restaurer
git checkout main -- render.yaml
git push
```

---

### ❌ Netlify build échoue : "Command not found: expo"

**Symptôme** : Le build Netlify échoue avec une erreur "expo command not found".

**Cause** : Netlify n'a pas installé les dépendances.

**Solution** :

Modifier la build command dans Netlify :
```bash
npm install && npm run web:build
```

Ou dans `netlify.toml` :
```toml
[build]
  command = "npm install && npx expo export --platform web"
```

---

### ❌ Vercel : "Build failed: Cannot find module 'expo'"

**Symptôme** : Build Vercel échoue.

**Cause** : Même problème que Netlify.

**Solution** :

Ajouter un script `build` dans `package.json` :
```json
{
  "scripts": {
    "build": "expo export --platform web"
  }
}
```

---

## Problèmes d'API

### ❌ "OPENAI_API_KEY missing or placeholder"

**Symptôme** : L'API retourne une erreur 503 lors de `/analyze-cat`.

**Cause** : La clé OpenAI n'est pas configurée ou est invalide.

**Solution** :

1. Dashboard Render → Ton service → **Environment**
2. Ajoute ou modifie :
   ```
   OPENAI_API_KEY=sk-proj-XXXXXXXXXX
   ```
3. Vérifie que la clé est valide :
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer sk-proj-XXXXXXXXXX"
   ```
4. Redémarre le service Render (il redémarre automatiquement après changement d'env var)

---

### ❌ "Non autorisé. Connecte-toi pour analyser une photo."

**Symptôme** : L'app retourne une erreur 401 lors de l'analyse.

**Cause** : L'API ne peut pas vérifier le token Supabase.

**Solution** :

1. Vérifie que `SUPABASE_JWT_SECRET` est correct :
   - Dashboard Supabase → Settings → API → JWT Secret
   - Copie exactement le secret (attention aux espaces)

2. Vérifie que `SUPABASE_URL` est correct :
   - Format : `https://xyzabc.supabase.co`
   - Pas de `/` à la fin

3. Redémarre l'API Render après modification

**Debug** :

Si le problème persiste, active temporairement le mode dev (⚠️ JAMAIS en production) :

```env
# Dans Render → Environment (temporaire pour debug)
ALLOW_UNAUTH_ANALYZE=1
```

Teste l'API sans token :
```bash
curl -X POST https://ton-api.onrender.com/analyze-cat \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"...","mimeType":"image/jpeg"}'
```

Si ça marche sans token, le problème vient de la vérification JWT.

**N'oublie pas de retirer `ALLOW_UNAUTH_ANALYZE` après le debug !**

---

### ❌ API très lente (30-50 secondes)

**Symptôme** : Première requête après inactivité prend 30-50s.

**Cause** : **Cold start** du plan gratuit Render. L'instance s'endort après 15 min d'inactivité.

**Solutions** :

1. **Accepter le délai** (gratuit)
   - Informe les utilisateurs : "Premier chargement peut prendre 30s"

2. **Upgrade Render Starter** ($7/mois)
   - Pas de cold start
   - Instance toujours active

3. **Migrer vers Railway** ($5 gratuit/mois)
   - Pas de cold start
   - Voir `docs/ops/DEPLOYMENT.md` section Railway

4. **Keep-alive ping** (pas recommandé)
   ```bash
   # Cron job toutes les 10 min (consomme les heures gratuites)
   */10 * * * * curl https://ton-api.onrender.com/health
   ```

---

### ❌ "Rate limit exceeded"

**Symptôme** : Erreur 429 "Trop de demandes".

**Cause** : Un utilisateur a dépassé la limite (20 analyses/heure par défaut).

**Solution** :

Augmente la limite dans Render → Environment :
```env
ANALYZE_RATE_LIMIT=50
```

Ou désactive temporairement (⚠️ pas en prod) :
```env
ANALYZE_RATE_LIMIT=999999
```

---

### ❌ Docker build échoue : "COPY failed"

**Symptôme** : Build Render échoue avec une erreur Docker.

**Cause** : Problème avec le Dockerfile.

**Solution** :

Vérifie que `server/Dockerfile` existe et est correct :

```dockerfile
FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

CMD ["npm", "start"]
```

Test en local :
```bash
cd server
docker build -t catdex-api .
docker run -p 8787:8787 --env-file .env catdex-api
```

---

## Problèmes d'Authentification

### ❌ "Invalid login credentials"

**Symptôme** : Impossible de se connecter avec email/password.

**Cause** : Email non confirmé ou mauvais mot de passe.

**Solution** :

1. Dashboard Supabase → Authentication → Users
2. Trouve l'utilisateur
3. Si "Email not confirmed", clique sur **Confirm email**

Ou en dev, désactive la confirmation email :
- Dashboard Supabase → Authentication → Providers → Email
- Décocher **Confirm email**

---

### ❌ Google OAuth ne fonctionne pas

**Symptôme** : Erreur lors de la connexion Google.

**Cause** : Provider pas configuré dans Supabase ou redirect URL incorrecte.

**Solution** :

1. **Activer Google dans Supabase**
   - Dashboard → Authentication → Providers → Google
   - Enable
   - Ajoute Client ID et Client Secret (depuis Google Cloud Console)

2. **Configurer Redirect URLs**
   - Dashboard Supabase → Authentication → URL Configuration
   - Redirect URLs :
     ```
     https://catdex.netlify.app/**
     catdex://**
     exp://**
     ```

3. **Google Cloud Console**
   - https://console.cloud.google.com
   - OAuth consent screen → Configure
   - Credentials → OAuth 2.0 Client ID
   - Authorized redirect URIs :
     ```
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     ```

---

### ❌ Apple OAuth : "Invalid state"

**Symptôme** : Erreur lors de Sign in with Apple.

**Cause** : Même problème que Google OAuth.

**Solution** : Voir [ops/DEPLOYMENT.md](./ops/DEPLOYMENT.md) section "Configurer OAuth (Google/Apple)"

---

## Problèmes de Build Mobile

### ❌ EAS Build échoue : "Bundle ID already exists"

**Symptôme** : Build iOS échoue avec une erreur "Bundle ID already exists".

**Cause** : Un autre développeur utilise déjà `com.catdex.app`.

**Solution** :

Change le bundle ID dans `app.json` :
```json
{
  "ios": {
    "bundleIdentifier": "com.TONPSEUDO.catdex"
  },
  "android": {
    "package": "com.TONPSEUDO.catdex"
  }
}
```

Puis rebuild :
```bash
eas build --platform all --profile production --clear-cache
```

---

### ❌ "No valid iOS Distribution Certificate"

**Symptôme** : Build iOS échoue, problème de certificat.

**Cause** : Certificats Apple expirés ou invalides.

**Solution** :

Regénère les credentials :
```bash
# Supprimer tous les credentials
eas credentials --platform ios

# Sélectionne "Remove all credentials"

# Rebuild - EAS va les recréer
eas build --platform ios --profile production
```

---

### ❌ Android build échoue : "Duplicate resources"

**Symptôme** : Build Android échoue avec une erreur de ressources dupliquées.

**Cause** : Conflit entre packages.

**Solution** :

1. Clean cache :
   ```bash
   eas build --platform android --profile production --clear-cache
   ```

2. Si ça persiste, vérifie les dépendances dans `package.json`

---

### ❌ L'app crash au démarrage sur iOS

**Symptôme** : L'app se ferme immédiatement après ouverture.

**Cause** : URL API mal configurée ou variable d'environnement manquante.

**Solution** :

1. Vérifie `eas.json` → `production.env` :
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

2. Rebuild avec les bonnes variables

3. Test en local d'abord :
   ```bash
   npx expo run:ios
   ```

---

## Problèmes de Performance

### ❌ Analyse de chat très lente (>10 secondes)

**Symptôme** : L'analyse prend plus de 10 secondes.

**Cause** : Background removal prend trop de temps.

**Solution** :

Désactive le cutout dans Render → Environment :
```env
SKIP_CUTOUT=1
```

L'analyse sera 2x plus rapide (~2s au lieu de 4s).

---

### ❌ App web lente au chargement

**Symptôme** : La version web met 5-10s à charger.

**Cause** : Bundle JS trop gros.

**Solution** :

1. Vérifier la taille du bundle :
   ```bash
   npm run web:build
   ls -lh dist/_expo/static/js/web/
   ```

2. Si >2 MB, activer le code splitting (déjà fait par Expo normalement)

3. Désactiver les source maps en production (déjà fait)

---

### ❌ Photos mettent longtemps à charger

**Symptôme** : Les images de chats mettent 3-5s à apparaître.

**Cause** : Photos trop lourdes (>2 MB).

**Solution** :

L'app compresse déjà les photos à 1024px. Si le problème persiste :

1. Vérifier la compression dans le code :
   ```typescript
   // src/components/Scanner.tsx
   const result = await ImagePicker.launchImageLibraryAsync({
     quality: 0.8, // Augmente si trop compressé
   });
   ```

2. Utiliser un CDN externe (Cloudinary, Cloudflare R2)

---

## Problèmes de Photos

### ❌ "Failed to upload photo"

**Symptôme** : Erreur lors de l'upload de photo dans Supabase Storage.

**Cause** : Bucket mal configuré ou policies RLS incorrectes.

**Solution** :

1. Dashboard Supabase → Storage → `cat-photos`
2. Vérifie que le bucket existe et est **public**

3. Policies RLS :
   ```sql
   -- Policy: Anyone can view photos
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'cat-photos');

   -- Policy: Authenticated users can upload
   CREATE POLICY "Authenticated upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'cat-photos' 
     AND auth.uid() IS NOT NULL
   );
   ```

4. Réexécute le SQL dans Supabase SQL Editor

---

### ❌ Photos apparaissent cassées (broken image)

**Symptôme** : Les photos de chats affichent une icône "broken image".

**Cause** : URL incorrecte ou photo supprimée.

**Solution** :

1. Vérifie l'URL dans les logs :
   ```bash
   # Dans l'app, log l'URL
   console.log('Photo URL:', cat.photoUrl);
   ```

2. Test l'URL dans le navigateur

3. Si 404, la photo n'existe pas dans Storage :
   - Check Dashboard Supabase → Storage → `cat-photos`
   - La photo a peut-être été supprimée

---

### ❌ "Image format not supported"

**Symptôme** : Erreur 400 "Format image non supporté".

**Cause** : Format HEIC/HEIF (iPhone) ou TIFF non supporté.

**Solution** :

L'app devrait convertir automatiquement. Si le problème persiste :

1. Vérifier la conversion dans le code :
   ```typescript
   // ImagePicker devrait retourner JPEG par défaut
   const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsEditing: false,
     quality: 0.8,
   });
   ```

2. Si l'utilisateur a un format exotique, demander de prendre une nouvelle photo avec la caméra (pas depuis la galerie)

---

## Problèmes Divers

### ❌ "Cannot connect to Supabase"

**Symptôme** : Erreur de connexion à Supabase.

**Cause** : URL ou clé incorrecte.

**Solution** :

1. Vérifie `.env` (local) ou variables Netlify/Vercel (web) :
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. Test la connexion :
   ```bash
   curl https://xyzabc.supabase.co/rest/v1/ \
     -H "apikey: eyJhbGc..."
   ```

   Devrait retourner un JSON (pas une erreur 404).

---

### ❌ Carte ne s'affiche pas

**Symptôme** : La carte interactive reste blanche.

**Cause** : MapLibre n'arrive pas à charger les tiles.

**Solution** :

1. Vérifier la console du navigateur (web) :
   - F12 → Console
   - Chercher des erreurs MapLibre

2. Vérifier la connexion internet

3. Vérifier que `react-native-maps` / `maplibre-gl` est bien installé :
   ```bash
   npm list react-native-maps maplibre-gl
   ```

---

### ❌ "Error: PostGIS not installed"

**Symptôme** : Erreur lors de requêtes géospatiales.

**Cause** : Extension PostGIS pas activée dans Supabase.

**Solution** :

```sql
-- Dans Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
```

Puis réexécute le schema :
```bash
# Copier le contenu de supabase/schema.sql
# Coller dans SQL Editor
# Run
```

---

## Outils de Debug

### 1. Vérifier l'API

```bash
# Health check
curl https://ton-api.onrender.com/health

# Analyze (avec token)
curl -X POST https://ton-api.onrender.com/analyze-cat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{"imageBase64":"...","mimeType":"image/jpeg"}'
```

### 2. Vérifier Supabase

```bash
# Test connexion
curl https://xyz.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Test auth
curl https://xyz.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Logs Render

Dashboard Render → Ton service → **Logs** (temps réel)

### 4. Logs Netlify

Dashboard Netlify → Ton site → **Deploys** → Dernière deploy → **Deploy log**

### 5. Logs Expo (mobile)

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Logs en temps réel
npx react-native log-ios
npx react-native log-android
```

---

## Contacts d'Aide

Si tu es bloqué après avoir tout essayé :

1. **Documentation officielle**
   - [Expo Docs](https://docs.expo.dev)
   - [Supabase Docs](https://supabase.com/docs)
   - [Render Docs](https://render.com/docs)

2. **Communautés**
   - [Expo Discord](https://discord.gg/expo)
   - [Supabase Discord](https://discord.supabase.com)

3. **GitHub Issues**
   - Ouvre une issue sur le repo CatDex avec :
     - Description du problème
     - Logs complets
     - Environnement (web/iOS/Android)
     - Étapes pour reproduire

---

**Bon courage !** 💪 La plupart des problèmes sont résolus en vérifiant les variables d'environnement. 🔑
