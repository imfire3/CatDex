# Configuration rapide Supabase — CatDex

> **Repo public** : n’y mets jamais ton ID de projet réel, ni de clés.
> Utilise `.env` local (gitignoré). Voir [SECURITY.md](./SECURITY.md).

## Projet

Crée un projet sur [Supabase](https://supabase.com/dashboard), puis note
**Project URL** et **anon public** (Settings → API).

## 1. Clé anon (app)

Colle dans `.env` (jamais commit) :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Schéma SQL (tables + RLS + storage)

1. SQL Editor → New query  
2. Colle **tout** le fichier `supabase/schema.sql`  
3. **Run**

Cela crée : `profiles`, `cats`, `sightings`, `cat_analysis`, RLS, PostGIS nearby search, bucket Storage `cats`.

### Si tu vois `PGRST200` / `cat_analysis`

L’app joint `cats` → `cat_analysis`. Si la FK manque (projet créé avec un vieux schéma) :

1. SQL Editor → New query  
2. Colle **tout** `supabase/migrations/20260805_ensure_cat_analysis.sql`  
3. **Run** (recharge aussi le cache PostgREST)  
4. Recharge l’app (`r` dans Expo)

## 3. Auth e-mail

Authentication → Providers → Email : activé  

**Obligatoire (sinon « e-mail ou mot de passe incorrect ») :**  
Authentication → Providers → Email → **désactive « Confirm email »**  

Si Confirm email reste ON :
- chaque inscription envoie un e-mail (quota gratuit très bas) ;
- au-delà du quota → `email rate limit exceeded` → **le compte n’est pas créé** ;
- la connexion renvoie alors `Invalid login credentials`.

Après avoir désactivé Confirm email : recrée le compte, tu es connecté tout de suite.

Option SQL (backfill + auto-confirm) si besoin :  
`supabase/migrations/20260805_auto_confirm_email.sql` dans le SQL Editor.

### Google / Apple (sinon erreur `provider is not enabled`)

Par défaut seuls **Email** est requis. Les boutons Google/Apple sont **masqués**
tant que tu n’actives pas les flags dans `.env` :

```bash
EXPO_PUBLIC_AUTH_GOOGLE=true
EXPO_PUBLIC_AUTH_APPLE=true
```

Pour activer Google :
1. Authentication → Providers → **Google** → Enable  
2. Colle Client ID + Client Secret (Google Cloud Console) — **secrets privés**  
3. Redirect URL Supabase : `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Mets `EXPO_PUBLIC_AUTH_GOOGLE=true` et redémarre Expo

Sans OAuth, connecte-toi uniquement avec **e-mail / mot de passe**.

## 4. Redirect URLs (OAuth / web)

Authentication → URL Configuration → ajoute :
- `https://<ton-tunnel>.trycloudflare.com/auth/callback`
- `catdex://auth/callback`
- `http://localhost:8082/auth/callback`

## 5. Secrets serveur (privés)

Uniquement dans `server/.env` ou le dashboard Render — **jamais** `EXPO_PUBLIC_` :

- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Voir `server/.env.example` et [SECURITY.md](./SECURITY.md).

## 6. Redémarrer Expo

```bash
npx expo start --web --clear
```

## Vérifier

1. Créer un compte dans l’app  
2. Dashboard → Authentication → Users → l’utilisateur apparaît  
3. Scanner un chat → Table Editor → `cats` reçoit la fiche

Sans clé anon, l’app reste en **mode local** (auth mock, cats sur l’appareil).
