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

## 3. Auth e-mail
Authentication → Providers → Email : activé  
Optionnel : désactive **Confirm email** pour tester plus vite.

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
