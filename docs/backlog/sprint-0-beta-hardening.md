# Sprint 0 — Beta Hardening

| Champ | Valeur |
|-------|--------|
| **Statut** | ✅ Complété (code) — valider manuellement device + CI verte |
| **Objectif** | Lever les **vrais bloqueurs** avant toute feature |
| **Après Sprint 0** | STOP technique → Sprint 1 core loop produit |

Réf. : `docs/audits/engineering-audit-v1.md` (H1–H7, M3)  
Lot 0 résumé : `docs/audits/engineering/lot0-security-done.md`  
Release : `docs/releases/STORE_CHECKLIST.md`

---

## Tickets

| # | Ticket | Statut |
|---|--------|--------|
| 1 | Sécuriser `/analyze-cat` | ✅ Lot 0 |
| 2 | Corriger policies Supabase | ✅ Migration `20260807_lot0_security.sql` — **appliquer en prod** |
| 3 | Monter ToastHost | ✅ `app/_layout.tsx` |
| 4 | Supprimer fichiers `* 2.*` | ✅ Aucun tracké |
| 5 | Ajouter CI GitHub | ✅ `.github/workflows/ci.yml` |
| 6 | Corriger `eas.json` | ✅ URL prod `https://catdex-api.onrender.com` |

---

## Definition of Done (sprint)

- [x] 6 tickets mergés (ou explicitement reportés)
- [ ] Capture chat OK sur device/sim (manuel)
- [ ] Appel non auth à `/analyze-cat` refusé (manuel / prod)
- [x] Toast visible (ToastHost monté)
- [x] 0 fichier `* 2.*` tracké
- [ ] CI verte sur la branche (après push)
- [x] `eas.json` sans placeholder mort

## Ops restants (hors code)

1. Appliquer `supabase/migrations/20260807_lot0_security.sql` sur le projet prod.
2. Sur Render : `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `NODE_ENV=production`.
3. Premier build : `eas build --platform ios --profile preview` puis TestFlight.
