# Configuration rapide Supabase — CatDex

## Projet
- **URL**: https://ocmxluabuaexzsrjuwrk.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/ocmxluabuaexzsrjuwrk

## 1. Clé anon
1. Ouvre https://supabase.com/dashboard/project/ocmxluabuaexzsrjuwrk/settings/api
2. Copie **anon public** (`eyJ…`)
3. Colle dans `.env` :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://ocmxluabuaexzsrjuwrk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...ton_anon_key
```

## 2. Schéma SQL (tables + RLS + storage)
1. SQL Editor → New query  
2. Colle **tout** le fichier `supabase/schema.sql`  
3. **Run**

Cela crée : `profiles`, `cats`, `sightings`, `cat_analysis`, RLS, PostGIS nearby search, bucket Storage `cats`.

### Si tu vois `PGRST200` / `cat_analysis`
L’app joint `cats` → `cat_analysis`. Si la FK manque (projet créé avec un vieux schéma), tu auras :

`Could not find a relationship between 'cats' and 'cat_analysis'`

Fix rapide :
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

Sans ces flags (et sans provider Supabase), un clic OAuth sur le web affichait
`Unsupported provider: provider is not enabled` en JSON brut.

Pour activer Google :
1. Authentication → Providers → **Google** → Enable  
2. Colle Client ID + Client Secret (Google Cloud Console)  
3. Redirect URL Supabase : `https://ocmxluabuaexzsrjuwrk.supabase.co/auth/v1/callback`
4. Mets `EXPO_PUBLIC_AUTH_GOOGLE=true` et redémarre Expo

Sans OAuth, connecte-toi uniquement avec **e-mail / mot de passe**.

## 4. Redirect URLs (OAuth / web)
Authentication → URL Configuration → ajoute :
- `https://<ton-tunnel>.trycloudflare.com/auth/callback`
- `catdex://auth/callback`
- `http://localhost:8082/auth/callback`

## 5. Redémarrer Expo
```bash
npx expo start --web --clear
```

## Vérifier
1. Créer un compte dans l’app  
2. Dashboard → Authentication → Users → l’utilisateur apparaît  
3. Scanner un chat → Table Editor → `cats` reçoit la fiche

Sans clé anon, l’app reste en **mode local** (auth mock, cats sur l’appareil).
