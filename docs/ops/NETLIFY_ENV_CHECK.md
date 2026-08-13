# ✅ Checklist Variables d'Environnement Netlify

**Site:** catdex-beta.netlify.app  
**Dashboard:** https://app.netlify.com/sites/catdex-beta/configuration/env

---

## 🔑 VARIABLES REQUISES

### 1. OpenAI (pour analyse Vision)

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Où:** Netlify Dashboard → Site settings → Environment variables  
**Scope:** All scopes (Build + Functions + Runtime)  
**Critique:** ⚠️ **OBLIGATOIRE** — l'analyse échouera sans cette clé

**Tester:**
```bash
# Dans Netlify Functions logs
[analyze-cat] Vision request { model: 'gpt-4o', ... }
```

---

### 2. Supabase (auth + storage)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Où:** Netlify Dashboard → Site settings → Environment variables  
**Scope:** All scopes  
**Critique:** ⚠️ **OBLIGATOIRE** pour auth/connexion

**Trouver:**
1. https://supabase.com/dashboard/project/YOUR_PROJECT
2. Settings → API
3. Copier `URL` et `anon public`

---

### 3. API URL (optionnel si Netlify Functions)

```bash
EXPO_PUBLIC_API_URL=https://catdex-beta.netlify.app
```

**Où:** Netlify Dashboard → Site settings → Environment variables  
**Scope:** All scopes  
**Valeur:** URL du site Netlify lui-même (pour `/analyze-cat`)

**Note:** Grâce aux redirects dans `netlify.toml`, `/analyze-cat` pointe vers `/.netlify/functions/analyze-cat`

---

### 4. Auth providers (optionnel)

```bash
EXPO_PUBLIC_AUTH_GOOGLE=true
EXPO_PUBLIC_AUTH_APPLE=true
```

**Où:** Netlify Dashboard → Site settings → Environment variables  
**Scope:** All scopes  
**Critique:** ❌ Optionnel — auth email fonctionne sans

---

## 📋 PROCÉDURE DE VÉRIFICATION

### Étape 1: Accéder au Dashboard

```
https://app.netlify.com/sites/catdex-beta/configuration/env
```

### Étape 2: Vérifier les variables

Cocher:
- [ ] `OPENAI_API_KEY` présente
- [ ] `EXPO_PUBLIC_SUPABASE_URL` présente
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` présente
- [ ] `EXPO_PUBLIC_API_URL` présente (ou omise si local)

### Étape 3: Redéployer si ajout/modification

**Important:** Les changements d'env vars ne sont actifs qu'après un nouveau déploiement.

**Options:**
1. Trigger deploy: Dashboard → Deploys → Trigger deploy → Deploy site
2. Ou push un commit vide: `git commit --allow-empty -m "chore: trigger deploy" && git push`

---

## 🧪 TESTS POST-CONFIGURATION

### Test 1: Health check

```bash
curl https://catdex-beta.netlify.app/health
```

**Attendu:**
```json
{
  "ok": true,
  "service": "catdex-api",
  "version": "analyze-auth-v3"
}
```

### Test 2: Analyze-cat (avec photo)

```bash
# Via l'app web
1. Ouvrir https://catdex-beta.netlify.app/
2. Scanner → Choisir photo
3. Ouvrir DevTools Console

# Chercher dans les logs
[CATDEX ANALYSIS] Raw OpenAI response: {...}
```

**Si échec:**
- Vérifier `OPENAI_API_KEY` dans Netlify env vars
- Vérifier logs Netlify Functions: Dashboard → Functions → analyze-cat → Logs

### Test 3: Auth Supabase

```bash
# Via l'app web
1. Ouvrir https://catdex-beta.netlify.app/
2. Cliquer "Se connecter"
3. Essayer connexion email

# Si échec "Missing env var"
→ Vérifier EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🚨 PROBLÈMES COURANTS

### "OPENAI_API_KEY missing or placeholder"

**Cause:** Variable `OPENAI_API_KEY` absente ou mal formatée

**Solution:**
1. Aller sur https://platform.openai.com/api-keys
2. Créer une nouvelle clé (ou copier existante)
3. Ajouter dans Netlify: `OPENAI_API_KEY=sk-proj-xxxxx`
4. Redéployer le site

---

### "Supabase client is not initialized"

**Cause:** Variables Supabase absentes ou invalides

**Solution:**
1. Vérifier `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Format attendu:
   - URL: `https://xxx.supabase.co`
   - Key: `eyJhbGci...` (commence par eyJ)
3. Redéployer

---

### "Network request failed" sur /analyze-cat

**Cause:** Redirection `/analyze-cat` → Functions échoue

**Solution:**
1. Vérifier `netlify.toml` contient:
   ```toml
   [[redirects]]
     from = "/analyze-cat"
     to = "/.netlify/functions/analyze-cat"
     status = 200
     force = true
   ```
2. Vérifier `netlify/functions/analyze-cat.mjs` existe
3. Vérifier logs Functions dans Dashboard

---

## 📊 MONITORING

### Logs Netlify Functions

```
Dashboard → Functions → analyze-cat → Logs en temps réel
```

**Chercher:**
```
[analyze-cat] Vision request
[analyze-cat] Vision raw JSON
[analyze-cat] Mapped analysis
```

### Logs Browser Console

**Ouvrir DevTools → Console, chercher:**
```
[CATDEX ANALYSIS] Frontend received: {...}
```

---

## 🔐 SÉCURITÉ

### ⚠️ JAMAIS commiter dans Git

```bash
# ❌ INTERDIT
OPENAI_API_KEY=sk-proj-xxxxx  # dans .env
SUPABASE_ANON_KEY=eyJxxx...    # dans code source
```

### ✅ Toujours via Netlify Dashboard

Les variables sensibles doivent **uniquement** être dans:
```
Netlify Dashboard → Environment variables
```

---

## ✅ VALIDATION FINALE

Une fois toutes les variables configurées:

1. [ ] Push sur `main`
2. [ ] Netlify auto-deploy (vérifier Dashboard → Deploys)
3. [ ] Build réussi (status: Published)
4. [ ] `/health` retourne 200 OK
5. [ ] Scanner une photo → analyse fonctionne
6. [ ] Console affiche `[CATDEX ANALYSIS]` logs
7. [ ] Nom/traits/description remplis

**Si tout ✅ → Déploiement réussi!**
