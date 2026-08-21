Emplacement des icônes du site.

Fichiers à remplacer par les visuels définitifs de l'association :
- favicon.svg           -> favicon du site (référencé dans le <head> des pages HTML)
- icons/logo-mark.svg   -> logo utilisé dans l'en-tête (.brand__mark)
- icons/phone.svg, icons/mail.svg, icons/*.svg -> pictogrammes utilisés dans les
  cartes "Nos actions" et "Contact" (actuellement des SVG inline dans le HTML,
  à externaliser ici si besoin de les réutiliser ailleurs)

Formats recommandés : SVG (vectoriel, léger) pour tout sauf le favicon .ico
de secours (voir ci-dessous).

Pour une compatibilité maximale (anciens navigateurs, iOS, Android),
prévoir en complément dans /assets/ :
- favicon.ico (32x32 et 16x16 multi-résolution)
- apple-touch-icon.png (180x180)
- icon-192.png et icon-512.png (si mise en place d'un manifest PWA)
