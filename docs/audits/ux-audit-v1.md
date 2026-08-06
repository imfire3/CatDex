# CatDex — UX Audit v1

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-08-06 |
| **Réf.** | `engineering-audit-v1.md` Phase 8 |
| **Statut** | Gelé — référence |

**Légende :** ✔ Conforme · ⚠ À améliorer · ❌ Critique

---

## Funnel

✔ Auth → Permissions → Map → Scan → Reveal → CatDex est compréhensible.

## Feedback système

| Canal | Statut |
|-------|--------|
| Loading / Empty / Problem | ✔ |
| Haptics (map / capture) | ⚠ partiel |
| Toasts | ❌ `ToastHost` non monté — feedback silencieux |
| Offline | ❌ pas de mode dégradé clair |
| Erreur Vision | ⚠ parfois masquée par mock inventé |

## Frictions

1. Pas de confirmation visuelle d’erreur réseau (toasts morts).
2. Missions qui « ont l’air » actives mais ne le sont pas.
3. Favoris CatDex éphémères (perdus au restart).

## Sprint liés

- Sprint 0 Ticket 3 → ToastHost (bloqueur UX).
- Sprint 1 → polish boucle collection.

**Score UX : 6.0 / 10**
