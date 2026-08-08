# 🔑 Les 3 Clés à Obtenir pour CatDex

## 1️⃣ OpenAI API Key

**🌐 Site** : https://platform.openai.com/api-keys

**📋 Étapes** :
1. Se connecter avec ton compte OpenAI
2. Cliquer sur **"Create new secret key"**
3. Nom : `CatDex API`
4. **Copier la clé** (commence par `sk-proj-...`)
5. ⚠️ La sauvegarder (tu ne pourras plus la voir !)

**💰 Coût** : 
- Ajouter $5-10 de crédit sur le compte
- ~$0.001 par analyse de chat
- ~3-5€/mois pour usage normal

**📝 Ta clé** :
```
OPENAI_API_KEY=sk-proj-_________________________________
```

---

## 2️⃣ Supabase Project URL

**🌐 Site** : https://supabase.com/dashboard

**📋 Étapes** :
1. Créer un nouveau projet :
   - Nom : `catdex`
   - Mot de passe DB : [choisis-en un fort]
   - Région : Paris
   - Plan : Free

2. Attendre 2-3 minutes que le projet se crée

3. Aller dans **Settings** → **API**

4. Copier **Project URL** (en haut)

**📝 Ton URL** :
```
SUPABASE_URL=https://___________________.supabase.co
```

---

## 3️⃣ Supabase Anon Key

**📍 Dans le même écran** (Settings → API)

**📋 Étapes** :
1. Section **"Project API keys"**
2. Copier **anon** / **public** key
3. (C'est une longue chaîne qui commence par `eyJhbGc...`)

**📝 Ta clé** :
```
SUPABASE_ANON_KEY=eyJhbGc______________________________
```

---

## 4️⃣ Supabase JWT Secret

**📍 Dans le même écran** (Settings → API)

**📋 Étapes** :
1. Scroller en bas jusqu'à **"JWT Settings"**
2. Section **"JWT Secret"**
3. Copier le secret (pour projets HS256)

**📝 Ton secret** :
```
SUPABASE_JWT_SECRET=_____________________________________
```

---

## ✅ Configuration Supabase Supplémentaire

### A. Créer les Tables

1. Aller dans **SQL Editor**
2. Cliquer **"New query"**
3. Copier **tout** le contenu de `supabase/schema.sql`
4. Cliquer **"Run"** (Ctrl+Enter)
5. ✅ Voir "Success. No rows returned"

### B. Créer le Bucket Photos

1. Aller dans **Storage**
2. Cliquer **"Create a new bucket"**
3. Remplir :
   - Name : `cat-photos`
   - ✅ **Public bucket** : COCHÉ (important !)
4. Cliquer **"Create bucket"**

---

## 📝 Résumé - Copier ces Valeurs

Une fois que tu as tout :

```env
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=...
```

---

## 🚀 Ensuite ?

### Étape 1 : Configure .env Local

```bash
cd /workspace
./scripts/setup-render.sh
```

### Étape 2 : Déploie sur Render

1. https://dashboard.render.com
2. "New +" → "Blueprint"
3. Sélectionne "CatDex"
4. Colle les 3 clés ci-dessus
5. "Apply"

### Étape 3 : Teste l'App

```bash
npm start
# Scanne le QR code avec Expo Go
```

---

## 📚 Guides Détaillés

- **Guide complet** : `RENDER_SETUP_GUIDE.md`
- **Aide-mémoire** : `RENDER_CHEATSHEET.md`
- **Démarrage rapide** : `QUICKSTART.md`
- **Troubleshooting** : `docs/TROUBLESHOOTING.md`

---

**Prêt ?** Commence par obtenir la clé OpenAI ! 🔑
