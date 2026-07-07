# 05 - Performance

La sensation premium depend de la fluidite mobile: interactions rapides, carte reactive, images maitrisees, animations sobres.

## Regles performance
- Eviter les re-renders inutiles sur carte, listes, sheets et composants animes.
- Memoiser seulement quand le benefice est concret et lisible.
- Charger les images avec dimensions connues et strategies progressives quand possible.
- Garder les listes lazy, paginees ou virtualisees si elles peuvent grandir.
- Ne pas executer de calcul lourd dans le render.
- Limiter les listeners geoloc et nettoyer les subscriptions.
- Tester les impacts sur FPS, temps de demarrage et fluidite de navigation.
- Respecter reduced motion pour reduire cout et inconfort.

## Signaux d'alerte
- Styles/objets recrees massivement dans des children frequents.
- Markers carte trop nombreux sans clustering ou simplification.
- Animations continues sans valeur UX.
