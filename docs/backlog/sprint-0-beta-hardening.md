# Sprint 0 — Beta Hardening

| Champ | Valeur |
|-------|--------|
| **Statut** | En cours — Ticket 1 ✅ ; Suite Ticket 2+ |
| **Objectif** | Lever les **vrais bloqueurs** avant toute feature |
| **Règle** | Un ticket → review → commit → STOP jusqu’au suivant |
| **Après Sprint 0** | STOP technique → Sprint 1 core loop produit |

Réf. : `docs/audits/engineering-audit-v1.md` (H1–H7, M3)  
Lot 0 résumé : `docs/audits/engineering/lot0-security-done.md`

---

## Tickets (ordre strict)

| # | Ticket | Statut |
|---|--------|--------|
| 1 | Sécuriser `/analyze-cat` | ✅ Fait (Lot 0) |
| 2 | Corriger policies Supabase | ✅ Fait (Lot 0 migration) — confirmer apply prod |
| 3 | Monter ToastHost | 🔒 Suivant — **attente GO** |
| 4 | Supprimer fichiers `* 2.*` | 🔒 Bloqué |
| 5 | Ajouter CI GitHub | 🔒 Bloqué |
| 6 | Corriger `eas.json` | 🔒 Bloqué |

Puis **STOP** → test manuel global Sprint 0.

---

## Hors scope Sprint 0

- Refactor scanner / auth god files
- Missions produit
- OTA / SecureStore
- Dual progression
- Dark mode
- « Corriger tout » l’audit

---

## Definition of Done (sprint)

- [ ] 6 tickets mergés (ou explicitement reportés avec raison)
- [ ] Capture chat OK sur device/sim
- [ ] Appel non auth à `/analyze-cat` refusé
- [ ] Toast visible
- [ ] 0 fichier `* 2.*` tracké
- [ ] CI verte sur la branche
- [ ] `eas.json` sans placeholder mort
