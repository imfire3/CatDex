# CatDex — Product Audit v1

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-08-06 |
| **Réf. technique** | `engineering-audit-v1.md` |
| **Statut** | Gelé — référence |

**Légende :** ✔ Conforme · ⚠ À améliorer · ❌ Critique

---

## Proposition de valeur

CatDex = collectionner des chats **réels** rencontrés dans le quartier (Explorer → Capture → Fiche → CatDex).

## Boucle cœur

```text
Map (envie) → Scanner (geste) → Reveal (récompense) → CatDex (possession) → Map
```

✔ La boucle existe.  
⚠ Elle est affaiblie par feedback mort (toasts), missions factices, notifs factices.

## Par écran

| Écran | Verdict | Note produit |
|-------|---------|--------------|
| Welcome / Auth | ✔ | Entrée claire |
| Intro / Permissions | ⚠ | Intro promet notifs ; permissions = GPS+caméra |
| Map | ✔ | Cœur exploration ; HUD un peu dense |
| Scanner | ✔ | Cœur MVP |
| Reveal | ✔ | Confirmation = bon levier confiance |
| CatDex | ✔ / ⚠ | Collection OK ; favoris non persistés |
| Cat detail | ✔ | Fiche utile |
| Profile | ⚠ | Un peu chargé, OK MVP |
| Missions | ❌ | UI riche ≠ système réel (`first-capture`) — **overpromise** |
| Settings notifs | ⚠ | Prefs sans push |
| Discovery | ❌ | Dead path |

## Priorités produit (hors Sprint 0)

1. Rendre la boucle collection **irrésistible** (Sprint 1 backlog).
2. Soit implémenter les missions, soit simplifier l’écran.
3. Retirer ou honorer les promesses notifications.

**Score produit : 6.5 / 10**
