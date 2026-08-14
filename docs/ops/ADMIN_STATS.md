# CatDex — Stats admin (usage + photos)

Page privée pour voir si des gens utilisent l’app et uploadent des photos.

## Accès

1. Sur **Render** → le service **live** (ex. `catdex-api-xsnh`, pas un autre clone) → **Environment**, définis :
   - `ADMIN_STATS_SECRET` = un long secret aléatoire
   - `SUPABASE_URL` = URL du **même** projet Supabase que l’app
   - `SUPABASE_SERVICE_ROLE_KEY` = clé **service_role** (Settings → API), **pas** la clé `anon`
2. **Save** + attends le redeploy **Live**
3. Ouvre dans le navigateur (utilise l’URL **Primary** du service) :

```text
https://catdex-api-xsnh.onrender.com/admin?key=TON_ADMIN_STATS_SECRET
```

Si les cards Profils / Chats affichent `—` ou une erreur rouge : la service_role key manque ou pointe vers le mauvais projet.

JSON brut :

```text
https://catdex-api.onrender.com/admin?key=…   → HTML
https://catdex-api.onrender.com/admin/stats?key=…
# ou header : x-admin-secret: TON_SECRET
```

Sans le bon secret → 401.

## Ce que tu vois

### Produit (Supabase — durable)

| Card | Signification |
|------|----------------|
| Profils | Comptes créés |
| Nouveaux 7j | Inscriptions sur 7 jours |
| Chats | Captures totales |
| Avec photo | Captures avec `photo_url` |
| Captures 24h / 7j | Activité récente |
| Sauvage / Domestique | Split `lifestyle` (après migration) |
| Sightings / Analyses DB | Tables liées |

**Nouveaux utilisateurs** : 20 derniers profils (`display_name`, email, date).  
**Dernières captures** : 20 chats récents avec miniature, nom, type, owner, date.

### API analyse (ce process)

Volume / erreurs / latence **depuis le dernier démarrage** du dyno Render (le free plan reset au sleep). Pour l’usage produit, regarde surtout les cards Supabase.

## Migration lifestyle

Pour les compteurs Domestique / Sauvage, applique dans Supabase SQL Editor :

[`supabase/migrations/20260814_cat_lifestyle.sql`](../../supabase/migrations/20260814_cat_lifestyle.sql)

Sans cette colonne, les cards lifestyle peuvent rester vides (`—`) ; le reste du dashboard fonctionne.

## Local

```bash
# server/.env
ADMIN_STATS_SECRET=dev-secret
SUPABASE_URL=…
SUPABASE_SERVICE_ROLE_KEY=…

cd server && npm run dev
# → http://localhost:8787/admin?key=dev-secret
```
