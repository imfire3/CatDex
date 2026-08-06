# CatDex — UI Audit v1

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-08-06 |
| **Réf.** | `engineering-audit-v1.md` Phases 8 & 12 |
| **Statut** | Gelé — référence |

**Légende :** ✔ Conforme · ⚠ À améliorer · ❌ Critique

---

## Design system

✔ Tokens `src/theme/` (indigo, canvas `#F9F9FB`, spacing 8pt).  
⚠ Hex hors tokens (AuthShell, maps).  
⚠ Composants sous-utilisés : Skeleton, BottomSheet, PhotoCard, StatCard.

## Motion & states

| Item | Statut |
|------|--------|
| Reanimated + reduced motion | ✔ |
| PageLoading / EmptyState / ProblemState | ✔ |
| Skeleton | ⚠ non branché |
| Dark mode | ⚠ stub light-only |

## Pollution UI / repo

❌ ~30 fichiers Finder `* 2.*` (risque confusion composants).

## Sprint liés

- Sprint 0 Ticket 4 → purge `* 2.*`
- Sprint 1+ → polish reveal / map / catdex cards

**Score UI : 5.5 / 10 · Design system : 7.5 / 10**
