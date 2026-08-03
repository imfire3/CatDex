# Configuration rapide pour votre projet Supabase

## ⚡ Votre projet
- **URL**: https://ocmxluabuaexzsrjuwrk.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/ocmxluabuaexzsrjuwrk

## 🔑 Étape 1 : Récupérer votre clé anon

1. Allez sur https://supabase.com/dashboard/project/ocmxluabuaexzsrjuwrk/settings/api
2. Copiez la clé **anon public** (elle commence par `eyJ...` et fait ~300 caractères)
3. Collez-la dans le fichier `.env` à la racine du projet :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://ocmxluabuaexzsrjuwrk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Votre clé ici
```

## 🗄️ Étape 2 : Créer les tables

1. Allez sur https://supabase.com/dashboard/project/ocmxluabuaexzsrjuwrk/sql/new
2. Copiez le contenu du fichier `supabase/schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (en bas à droite)

Cela va créer :
- ✅ Tables (profiles, cats, sightings, cat_analysis)
- ✅ Indexes pour la performance
- ✅ Row Level Security
- ✅ Fonctions (recherche de chats à proximité)

## 📦 Étape 3 : Configurer le Storage

1. Allez sur https://supabase.com/dashboard/project/ocmxluabuaexzsrjuwrk/storage/buckets
2. Cliquez sur **New bucket**
3. Nom : `cats`
4. Cochez **Public bucket**
5. Cliquez sur **Create bucket**

## 🔄 Étape 4 : Rebuild l'application

```bash
# Dans le terminal du projet
rm -rf dist/
npx expo export --platform web

# L'app va maintenant utiliser Supabase au lieu du mode mock
```

## ✅ Vérifier que ça marche

Après avoir configuré :
1. Rechargez l'application web
2. Essayez de créer un compte avec email/mot de passe
3. Vérifiez dans Supabase Dashboard → Authentication → Users

## 📚 Guide complet

Pour plus de détails (OAuth Google/Apple, etc.), consultez `supabase/README.md`

---

**Note** : L'app fonctionne déjà sans Supabase (mode mock). Configurez Supabase uniquement si vous voulez :
- Authentification réelle
- Stockage cloud des données
- Upload de photos
- Partage entre utilisateurs
