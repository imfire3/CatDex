# 📝 Aide-Mémoire Render.com - CatDex

## 🚀 Déploiement en 4 Étapes

### 1️⃣ Obtenir les Clés (5 min)

#### OpenAI
- https://platform.openai.com/api-keys
- "Create new secret key"
- Copie : `sk-proj-...`

#### Supabase
- https://supabase.com/dashboard
- "New project" → Nom: `catdex`
- Settings → API :
  - **URL** : `https://xyz.supabase.co`
  - **Anon Key** : `eyJhbGc...`
  - **JWT Secret** : (scroll en bas)

### 2️⃣ Configurer Supabase (3 min)

```sql
-- SQL Editor → Coller le contenu de supabase/schema.sql
-- Run
```

```
Storage → Create bucket
- Name: cat-photos
- Public: ✅ OUI
```

### 3️⃣ Déployer sur Render (2 min)

1. https://dashboard.render.com
2. "New +" → "Blueprint"
3. Sélectionne repo "CatDex"
4. Configure les variables :

```
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_JWT_SECRET=...
```

5. "Apply" → Attends 3-5 min ⏱️

### 4️⃣ Tester (1 min)

```bash
curl https://ton-api.onrender.com/health
# Réponse : {"ok":true,"service":"catdex-api"}
```

✅ **C'est déployé !**

---

## 📋 Variables d'Environnement

### Pour Render.com (API Backend)

| Variable | Où la trouver | Exemple |
|----------|---------------|---------|
| `OPENAI_API_KEY` | platform.openai.com/api-keys | `sk-proj-abc123...` |
| `SUPABASE_URL` | supabase.com → Settings → API | `https://xyz.supabase.co` |
| `SUPABASE_JWT_SECRET` | supabase.com → Settings → API → JWT Secret | `super-secret-key` |
| `NODE_ENV` | (auto) | `production` |
| `PORT` | (auto) | `8787` |
| `OPENAI_MODEL` | (auto) | `gpt-4o-mini` |

### Pour .env Local (App)

```env
EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=https://ton-api.onrender.com
```

---

## 🔧 Commandes Utiles

### Setup Initial

```bash
# Script interactif
./scripts/setup-render.sh

# Manuel
cp .env.example .env
nano .env
```

### Test Local

```bash
npm start              # Expo Go
npm run web            # Version web
npm run server         # API locale
```

### Déploiement

```bash
# Web
npm run web:build
npx netlify deploy --prod --dir dist

# Mobile
eas build --platform all
```

---

## ✅ Checklist de Déploiement

- [ ] Compte OpenAI créé + $5 de crédit
- [ ] Clé OpenAI obtenue
- [ ] Projet Supabase créé
- [ ] Schema SQL exécuté
- [ ] Bucket `cat-photos` créé (public)
- [ ] Clés Supabase notées
- [ ] Repo GitHub connecté à Render
- [ ] Variables configurées dans Render
- [ ] Déploiement terminé (status "Live")
- [ ] Health check OK
- [ ] `.env` local mis à jour
- [ ] App testée avec Expo Go

---

## 🐛 Dépannage Rapide

### ❌ API ne démarre pas

```bash
# Check logs Render
Dashboard → Service → Logs
```

**Causes communes** :
- `OPENAI_API_KEY` manquant/invalide
- `SUPABASE_JWT_SECRET` incorrect

### ❌ "Non autorisé" dans l'app

- Vérifie `SUPABASE_JWT_SECRET` dans Render
- C'est le **JWT Secret**, pas l'Anon Key !

### ❌ API lente (30-50s)

- Normal sur plan gratuit (cold start)
- Upgrade Render Starter ($7/mois) pour éviter

---

## 💰 Coûts

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Supabase | Free | 0€ |
| Render | Free | 0€ |
| OpenAI | Usage | 3-5€ |
| **Total** | | **3-5€** |

---

## 🔗 Liens Utiles

- **Dashboard Render** : https://dashboard.render.com
- **Dashboard Supabase** : https://supabase.com/dashboard
- **OpenAI API Keys** : https://platform.openai.com/api-keys
- **Guide complet** : `RENDER_SETUP_GUIDE.md`
- **Troubleshooting** : `docs/TROUBLESHOOTING.md`

---

## 📞 Support

- **Render Docs** : https://render.com/docs
- **Supabase Docs** : https://supabase.com/docs
- **Expo Docs** : https://docs.expo.dev

---

**Bon déploiement !** 🚀
