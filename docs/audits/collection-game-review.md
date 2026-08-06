# CatDex — Collection Game Review

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-08-06 |
| **Statut** | Gelé — référence produit jeu |
| **Prochain sprint dédié** | `docs/backlog/sprint-1-core-loop.md` |

---

## Fantasy

« Ton quartier. Tes chats. » — capturer des chats **réels**, remplir un Pokédex de quartier.

## Boucle de core gameplay

```text
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│   MAP   │────►│ SCANNER │────►│ REVEAL  │────►│ CATDEX  │──┐
│ désir   │     │ geste   │     │ reward  │     │ possession│  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘  │
     ▲                                                       │
     └──────────────────── « encore un » ────────────────────┘
```

| Étape | Ce qui marche | Ce qui casse l’envie |
|-------|---------------|----------------------|
| **Map** | Exploration, pins, FAB capture | HUD dense ; spawns monde non branchés |
| **Scanner** | Caméra + analyse | Échecs silencieux / faux chats mock |
| **Reveal** | Nom, édition, confirmation | Doit rester magique + honnête |
| **CatDex** | Grille collection | Favoris non persistés ; empty OK |

## Métriques désirables (plus tard)

- Temps Map → 1ère capture
- % Reveal validés sans retake
- Captures / session
- Retour Map dans les 60 s après ajout CatDex

## Règle d’or post–Sprint 0

Après le hardening technique : **ne plus ajouter de features hors boucle** tant que Map→Scan→Reveal→CatDex n’est pas irrésistible.
