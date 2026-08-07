# S0-T1 — Sécuriser `/analyze-cat`

| Champ | Valeur |
|-------|--------|
| **Sprint** | 0 |
| **Ticket** | 1 / 6 |
| **Statut** | ✅ **FAIT** (Lot 0 — 2026-08-07) |
| **Audit** | H1, H2 |

---

## Critères d’acceptation

- [x] Requête sans Bearer → **401** (sauf bypass DEV explicite)
- [x] Flood au-delà du quota → **429**
- [x] Image trop grosse / mime invalide → **413** ou **400**
- [x] Plus de dépendance client à `EXPO_PUBLIC_API_SECRET`
- [x] Analyse authentifiée OK en happy path (Bearer session)
- [ ] lint + typecheck OK — à revalider en CI locale

## Changements

- `server/src/analyzeAuth.ts` — JWT (secret HS256 ou JWKS), rate limit, mime/size helpers
- `server/src/index.ts` — middleware auth + quotas ; mock inventé bloqué en prod sans clé
- `src/lib/api.ts` — `Authorization: Bearer <session>`
- `src/lib/apiUrl.ts` — plus de `getApiSecret`
- `.env.example` / `server/.env.example` — vars documentées

## Risques restants

- Rate limit mémoire (multi-instance) → P1
- CORS `*` → P1
- H4 mock inventé sur erreur OpenAI → hors ticket (reporté)

## STOP

Attendre **GO S0-T2** (policies Supabase — déjà partiellement livré dans Lot 0 ; confirmer / skip).
