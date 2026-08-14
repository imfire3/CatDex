# CatDex — Stats admin (usage + photos)

Page privée pour voir si des gens utilisent l’app et uploadent des photos.

## Accès

1. Sur **Render** → service `catdex-api` → **Environment**, définis :
   - `ADMIN_STATS_SECRET` = un long secret aléatoire
   - `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (déjà requis pour l’API)
2. Ouvre dans le navigateur :

```text
https://catdex-api.onrender.com/admin?key=TON_ADMIN_STATS_SECRET
```

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

**Dernières captures** : 20 plus récentes avec miniature, nom, type, owner, date.

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
