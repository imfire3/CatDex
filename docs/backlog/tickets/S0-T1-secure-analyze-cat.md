# S0-T1 — Sécuriser `/analyze-cat`

| Champ | Valeur |
|-------|--------|
| **Sprint** | 0 |
| **Ticket** | 1 / 6 |
| **Statut** | ⏳ **ATTENTE VALIDATION** — aucun code tant que pas de GO |
| **Audit** | H1, H2 (+ portion H4 si dans le même flux auth ; **H4 mock inventé = hors ticket sauf si tu l’inclus**) |

---

## 1. Problème

L’endpoint `POST /analyze-cat` appelle OpenAI Vision et coûte de l’argent.

Aujourd’hui :

1. Si `API_SECRET` est **absent**, le middleware **laisse passer tout le monde** (`server/src/index.ts`).
2. CORS est `origin: '*'`.
3. Pas de rate limit, pas de plafond de taille d’image.
4. Le client peut envoyer `EXPO_PUBLIC_API_SECRET` via `x-api-key` (`src/lib/api.ts`, `src/lib/apiUrl.ts`) — **ce n’est pas un secret** : il finit dans le bundle mobile.

Résultat : n’importe qui qui découvre l’URL de l’API peut brûler la clé OpenAI.

---

## 2. Risque

| Risque | Impact |
|--------|--------|
| Abus / scraping Vision | Facture OpenAI, DoS |
| Fausse sécurité `EXPO_PUBLIC_*` | On croit être protégé alors que non |
| Régression DEV local | Analyse cassée sans Supabase si on exige JWT trop tôt |

---

## 3. Fichiers concernés (uniquement ce ticket)

| Fichier | Rôle |
|---------|------|
| `server/src/index.ts` | Gate auth, rate limit, max body, CORS |
| `src/lib/api.ts` | Envoyer Bearer session au lieu de `x-api-key` public |
| `src/lib/apiUrl.ts` | Retirer / déprécier `getApiSecret` + `EXPO_PUBLIC_API_SECRET` |
| `.env.example` | Documenter nouvelles vars serveur ; retirer secret client |
| `docs/VISION_ANALYSIS.md` | Une section auth API (doc only si besoin) |

**Hors ticket :** ToastHost, RLS SQL, `* 2.*`, CI, `eas.json`, refactor scanner.

---

## 4. Plan proposé (après ton GO)

### Approche recommandée

```text
Client (session Supabase)
  → Authorization: Bearer <access_token>
  → server vérifie JWT (SUPABASE_JWT_SECRET ou JWKS)
  → rate limit par user id (mémoire)
  → max taille image + mime allowlist
  → OpenAI
```

### Étapes d’implémentation

1. **Serveur** — middleware `/analyze-cat` :
   - Exiger Bearer JWT (prod).
   - Bypass DEV uniquement si `ALLOW_UNAUTH_ANALYZE=1` (interdit si `NODE_ENV=production`).
   - Rate limit : défaut **20 req / user / heure** (env `ANALYZE_RATE_LIMIT`).
   - Max body : défaut **5 MB** décodés (env `ANALYZE_MAX_BYTES`).
   - Mime : `image/jpeg`, `image/png`, `image/webp`.
2. **Client** — lire `supabase.auth.getSession()`, envoyer `Authorization: Bearer …` ; supprimer usage `EXPO_PUBLIC_API_SECRET`.
3. **Env** — mettre à jour `.env.example` ; documenter `SUPABASE_JWT_SECRET` côté server.
4. **Vérifs** — `npm run lint`, `npm run typecheck`, smoke compile ; curl sans token → 401.

### Décisions à valider avant code

| # | Question | Défaut proposé |
|---|----------|----------------|
| A | Auth = JWT Supabase ? | **Oui** |
| B | Quota | **20 / user / heure** |
| C | Max image | **5 MB** |
| D | DEV sans Supabase | `ALLOW_UNAUTH_ANALYZE=1` only |
| E | Inclure « stop inventer un chat » (H4) dans T1 ? | **Non** — ticket séparé ou T1bis ; garde T1 focus sécurité |

---

## 5. Contraintes

- Respecter l’architecture Hono existante (pas de rewrite Edge Function dans ce ticket).
- Ne pas toucher Supabase RLS (Ticket 2).
- Ne pas monter ToastHost (Ticket 3).
- Pas de gros refactor.

---

## 6. Critères d’acceptation

- [ ] Requête sans Bearer → **401** (sauf bypass DEV explicite)
- [ ] Flood au-delà du quota → **429**
- [ ] Image trop grosse / mime invalide → **413** ou **400**
- [ ] Plus de dépendance client à `EXPO_PUBLIC_API_SECRET`
- [ ] Analyse authentifiée OK en happy path
- [ ] lint + typecheck OK

---

## 7. Tests à lancer (après implémentation)

```bash
# app
npm run lint
npm run typecheck

# server (depuis server/)
npm run start   # smoke
# curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:8787/analyze-cat -H 'Content-Type: application/json' -d '{}'
# expect 401
```

Manuel : une capture chat avec session auth.

---

## 8. Fin de ticket

Résumé changements · impacts · risques restants · **STOP** — attendre GO Ticket 2.

---

## Validation

Réponds :

- **`GO S0-T1`** — j’implémente uniquement ce ticket
- ou ajuste A–E puis `GO S0-T1`
