# Lot 0 — Security hardening (done)

Date : 2026-08-07

## Livré

| Item | Statut |
|------|--------|
| `/analyze-cat` JWT Bearer + rate limit + mime/size | ✅ |
| Client Bearer session (plus de `EXPO_PUBLIC_API_SECRET`) | ✅ |
| RLS profiles : own SELECT only ; `profile_cards` sans email | ✅ |
| Storage INSERT path-scoped `{uid}/…` | ✅ |
| Feedback analyse : `user_id` obligatoire | ✅ |
| Cats UPDATE `WITH CHECK` owner | ✅ |

## Appliquer la migration

```bash
# Supabase CLI ou SQL Editor
supabase db push
# ou exécuter : supabase/migrations/20260807_lot0_security.sql
```

Configurer `server/.env` : `SUPABASE_URL`, `SUPABASE_JWT_SECRET`.  
Dev sans session : `ALLOW_UNAUTH_ANALYZE=1` (jamais en prod).

## P1 restants (hors Lot 0)

| ID | Sujet | Suite |
|----|--------|--------|
| H4 | Fallback OpenAI qui invente un chat en erreur | Ticket dédié / Lot 3 |
| CORS | `origin: '*'` sur l’API | Restreindre domaines app |
| Rate limit | In-memory (reset au restart / multi-instance) | Redis / Edge |
| Favorites / XP / badges | Client-only / éphémère | Lots 2–4 schéma |
| Capture ≠ Cat | Modèle conflated | Lot 2 data model |

## STOP

Lot 0 terminé côté code. Attendre **GO Ticket 2** (Sprint 0) ou Lot 1 structure avant la suite.
