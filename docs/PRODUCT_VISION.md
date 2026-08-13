# CatDex — Product Vision

**Version :** 1.0  
**Source :** [CatDex Product Book v1.0](./CatDex-Product-Book-v1.0.pdf) · Chapitre 1 (validé)  
**Tagline :** Ton quartier. Tes chats.  
**Filtre produit :** *Est-ce que cette décision donne davantage envie d’ouvrir CatDex demain ?*  
Si non → on change la décision, pas le filtre.

---

## Phrase vision

> CatDex transforme chaque chat croisé dans ton quartier en découverte, en souvenir et en progression — pour que marcher chez soi redevienne une aventure.

---

## Pourquoi CatDex doit exister

### Le problème

Les gens croisent des chats tous les jours. Le moment est magique — et disparaît. Pas de mémoire du quartier, pas de progression, pas de « j’ai trouvé quelque chose ».

Les alternatives ratent le créneau :

| Alternative | Ce qu’elle fait | Ce qui manque |
|-------------|-----------------|---------------|
| Réseaux sociaux | Photo | Pas de jeu ni de territoire |
| Pokémon GO | Exploration + collection | Fiction, pas le réel |
| Apps animaux perdus | Utilitaire | Pas de découverte ni de fierté |

### L’opportunité

Transformer la flânerie urbaine en boucle de découverte : **réel + IA + collection + territoire**.

### Critère Bible

Si on retire « vrais chats dans ton quartier », CatDex n’existe plus.  
Tout le reste (IA, carte, missions, XP) est au service de ça.

---

## Décisions figées

| # | Décision | Choix |
|---|----------|--------|
| 1 | Émotion primaire | **Curiosité d’explorateur** |
| 2 | Irremplaçable | **Atlas local vivant** des chats (captures + quartier + temps + lieux) |
| 3 | Anti-vision | Ni réseau social chat, ni Pokémon GO animalier, ni outil lost pets |
| 4 | Phrase vision | Découverte + souvenir + progression (ci-dessus) |

### Émotions (hiérarchie)

| Rôle | Émotion | Statut |
|------|---------|--------|
| Primaire | Curiosité d’explorateur | Moteur |
| Secondaire | Fierté de collection | Soutien |
| Sauce | Tendresse du quotidien | Pas moteur |

### Histoire après une semaine (cible)

> « J’ai commencé à vraiment voir les chats de mon quartier. J’en ai 12. Il y a un gris près du métro que je cherche encore. »

- **Gagné** si l’histoire parle de quartier / lieux / « mon » chat.  
- **Raté** si elle parle surtout de l’IA.

---

## Cinq piliers

| Pilier | Signifie | Refuse |
|--------|----------|--------|
| **Réel** | Photo de rue, chat rencontré | Créatures virtuelles |
| **Territoire** | Le quartier est le plateau | Monde ouvert générique |
| **Découverte** | Chaque chat est un événement | Feed passif |
| **Collection** | Identité + progression | Stats vides |
| **Léger** | Sessions de 30–90 s dehors | Sessions longues obligatoires |

---

## Comment on joue

### Fantasy

Capturer des chats **réels**, remplir un CatDex de quartier — un Pokédex ancré dans ta rue, pas dans un monde inventé.

### Boucle cœur

```text
Map (envie) → Scanner (geste) → Reveal (récompense) → CatDex (possession) → Map
```

1. **Carte** — envie d’explorer ; pins des chats déjà croisés ; recentrage GPS.  
2. **Scanner** — photo (caméra ou galerie) d’un chat réel.  
3. **Analyse** — l’IA propose une fiche (observations d’abord, race seulement avec preuves).  
4. **Reveal** — nom, rareté, édition éventuelle, confirmation honnête.  
5. **CatDex** — la capture devient possession ; retour à la carte pour « encore un ».

### Règles du jeu (produit)

1. **Pas de chat virtuel** — toute entrée du CatDex part d’une photo réelle.  
2. **Le quartier est le plateau** — la carte locale prime sur un feed global.  
3. **Observer avant de déduire** — l’IA décrit ce qu’elle voit ; la race n’est pas un ornement.  
4. **Le joueur confirme** — la fiche est proposable / éditable avant d’entrer en collection.  
5. **Récompense = découverte** — XP, badges et missions servent la boucle ; ils ne la remplacent pas.  
6. **Léger dehors** — une capture réussie doit tenir en une courte sortie (≈ 30–90 s).  
7. **Filtre d’ouverture** — toute feature hors boucle Map → Scan → Reveal → CatDex attend que cette boucle soit irrésistible.

### Ce que ce n’est pas (anti-vision)

- Un réseau social de photos de chats  
- Un Pokémon GO animalier générique  
- Un outil d’animaux perdus / signalement utilitaire  

---

## Vision à 5 ans

CatDex est le réflexe des gens qui marchent en ville : la façon dont on se souvient d’un quartier, à travers les vies animales qu’on y croise. Toujours **hyperlocal**.

---

## Succès mesurable (90 jours)

| Signal | Intention |
|--------|-----------|
| Rétention D1 | Seuil à fixer (ex. > 40 %) |
| Captures / user / semaine | Au moins 1 |
| Interviews S1 | Histoire = quartier / « mon » chat (pas l’IA) |

Métriques de boucle (suivi produit) :

- Temps Map → 1ʳᵉ capture  
- % Reveal validés sans retake  
- Captures / session  
- Retour Map dans les 60 s après ajout CatDex  

---

## Méthode (rappel Product Book)

1. Comprendre — nommer le vrai problème  
2. Explorer — plusieurs solutions  
3. Choisir — une option dominante  
4. Justifier — sert l’ouverture demain  
5. Mesurer — critères de réussite  

**Règle MVP :** chaque fonctionnalité est classée MVP / V1 / V2 / Plus tard. Aucune n’entre sans cette étape.

---

## Prochaines étapes Product Book

1. ~~Figer Chapitre 1 — Vision~~ → ce document  
2. Chapitre 2 — Utilisateurs  
3. Chapitre 3 — Boucle de gameplay (détail systèmes)  
4. Chapitre 4 — MVP  
