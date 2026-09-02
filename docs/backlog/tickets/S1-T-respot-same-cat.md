# S1 — Re-spot même chat

| Champ | Valeur |
|-------|--------|
| **Sprint** | 1 — Core loop |
| **Statut** | Ready |
| **Spec** | `docs/superpowers/specs/2026-09-02-respot-same-cat-design.md` |
| **Plan** | `docs/superpowers/plans/2026-09-02-respot-same-cat.md` |

## Problème
Chaque photo crée une nouvelle fiche — impossible de « chercher encore le gris près du métro ».

## Acceptation
- [ ] Heuristique + tests verts
- [ ] Oui → même id, views+1, lastSeenAt, coords/photo
- [ ] Non → Reveal / addCat inchangé
- [ ] Claim alreadyCaptured inchangé
- [ ] Aucun auto-merge sans confirm
