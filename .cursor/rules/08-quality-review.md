# 08 - Quality Review

Toute modification CatDex doit etre revue comme un produit mobile vivant, pas seulement comme du code.

## Checklist obligatoire
- Le changement respecte la vision CatDex et la securite des chats.
- Aucun ecran ne montre une position exacte de chat.
- UI coherente avec DS, 8pt grid, Apple HIG et composants existants.
- Pas de duplication UI ou logique inutile.
- Flows simples avec etats loading, empty, error si necessaire.
- Wording francais coherent: observer/decouvrir/documenter.
- Accessibilite: labels, contraste, touch targets, reduced motion.
- Performance: pas de render couteux, listeners propres, images maitrisees.
- Tests ou verification adaptes au risque.

## Sortie de review
Lister les risques bloquants d'abord, puis ameliorations recommandees, puis validations effectuees.
