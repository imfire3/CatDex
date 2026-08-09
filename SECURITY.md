# Security — CatDex (repo public)

Ce dépôt est **public**. Les secrets API ne doivent jamais y apparaître.

## Ce qui est public vs privé

| OK dans Git | Jamais dans Git |
|-------------|-----------------|
| Code app (`app/`, `src/`) | `.env`, `server/.env` |
| `.env.example` (placeholders) | `OPENAI_API_KEY` |
| Schéma SQL / migrations | `SUPABASE_SERVICE_ROLE_KEY` |
| Code API `server/` sans clés | `SUPABASE_JWT_SECRET` |
| URL API publique (`EXPO_PUBLIC_API_URL`) | Password DB Supabase |
| Anon key Supabase *dans ton `.env` local* (pas commit) | Tokens EAS / Apple / Google secrets |

L’anon key Supabase est conçue pour le client, mais **ne la committe pas** :
chaque fork / contributeur utilise la sienne via `.env`.

## Où vivent les secrets (ton côté)

1. **Machine locale** — fichiers `.env` (déjà dans `.gitignore`)
2. **Render / Railway** — Environment Variables du service API
3. **Supabase Dashboard** — Settings → API (service_role, JWT secret)
4. **EAS / stores** — secrets de build dans le dashboard Expo

Voir l’agenda : [`docs/PUBLIC_REPO_AGENDA.md`](./docs/PUBLIC_REPO_AGENDA.md).

## Configuration locale (sans exposer)

```bash
cp .env.example .env
cp server/.env.example server/.env
# Éditer en local uniquement — ne jamais git add ces fichiers
```

Valeurs attendues : voir `.env.example` et `server/.env.example`.

## Signaler un problème

Si une clé réelle a fuité (commit, screenshot, issue) :

1. **Révoquer / rotator** immédiatement (OpenAI, Supabase service_role, JWT)
2. Purger l’historique Git si besoin (`git filter-repo` / support GitHub)
3. Vérifier les dashboards (usage anormal OpenAI / Supabase)

## Contact

Ouvre une issue GitHub **sans coller de secrets**. Décris le type de fuite
et la date approximative ; les valeurs restent hors ticket.
