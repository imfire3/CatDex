# Vérifier RLS Lot 0 en production

Exécuter dans le **SQL Editor** Supabase (projet prod) après
`supabase/migrations/20260807_lot0_security.sql`.

## 1. Policies profiles

```sql
select polname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by polname;
```

Attendu : `Users can view own profile` / `Users can update own profile` (pas de SELECT public sur e-mail).

## 2. Vue profile_cards

```sql
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profile_cards'
order by ordinal_position;
```

Attendu : pas de colonne `email`.

## 3. Storage INSERT path-scoped

```sql
select polname, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects' and polname ilike '%upload%';
```

Attendu : `auth.uid()::text = (storage.foldername(name))[1]`.

## 4. API analyse

```bash
# Doit renvoyer 401
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://catdex-api.onrender.com/analyze-cat \
  -H 'Content-Type: application/json' \
  -d '{"imageBase64":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","mimeType":"image/jpeg"}'
```

## 5. Suppression compte

Configurer `SUPABASE_SERVICE_ROLE_KEY` sur Render, puis depuis l’app connectée :
Paramètres → Supprimer mon compte (compte de test uniquement).
