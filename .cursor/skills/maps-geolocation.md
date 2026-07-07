# Skill - Maps & Geolocation

## Quand l'utiliser
- Toute decision liee a carte, zones, localisation, permissions, markers.
- Review de securite des chats et confidentialite utilisateur.
- Design de flows d'exploration.

## Principes cles
- Ne jamais afficher la position exacte des chats.
- Utiliser zones, cellules, arrondis, proximite floue ou indices generaux.
- Demander la localisation seulement avec benefice clair.
- Separar localisation utilisateur, zones publiques et donnees sensibles.
- Prevoir degraded mode si permission refusee.

## Checklist
- Pas de coordonnees exactes exposees en UI.
- Copy explique pourquoi la localisation est utile.
- Permission refusable sans casser toute l'app.
- Markers representent des zones ou opportunites, pas un animal precis.
- Donnees sensibles non logguees inutilement.

## Erreurs a eviter
- Afficher adresse, lat/lng, precision metrique ou pin exact d'un chat.
- Inciter a suivre un chat en temps reel.
- Confondre zone publique et position source.

## Exemples CatDex
- Bon: "Zone active pres du parc".
- A eviter: "Chat vu au 12 rue X" ou pin exact sur trottoir.
