# Site — [Nom de l'association]

Site vitrine statique (HTML / CSS / JS, aucun framework, aucune dépendance de
build) : page **Accueil** et page **Contact**, avec confirmation obligatoire
avant tout appel téléphonique ou envoi d'e-mail.

## Arborescence

```
asso-site/
├── index.html              Page d'accueil
├── contact.html             Page contact (adhésion, tél, e-mail, adresse)
├── css/
│   ├── variables.css        Design tokens (couleurs, typo, espacements)
│   ├── base.css              Reset + règles typographiques + accessibilité
│   ├── layout.css            En-tête, navigation, pied de page, sections
│   ├── components.css        Boutons, cartes, modale de confirmation
│   └── pages.css             Styles propres à chaque page (hero, adhésion…)
├── js/
│   ├── main.js                Menu mobile + lien de nav actif (toutes pages)
│   ├── modal.js                Composant modale de confirmation réutilisable
│   └── contact.js              Logique tél/e-mail + copie presse-papiers
├── assets/
│   ├── favicon.svg             Favicon (placeholder à remplacer)
│   └── icons/
│       ├── logo-mark.svg       Logo d'en-tête (placeholder)
│       └── README.txt          Formats/tailles à fournir pour la version finale
└── README.md
```

Tout le texte de présentation est en *lorem ipsum* : à remplacer par les
textes réels de l'association. Les champs `[Nom de l'association]`,
`06 12 34 56 78`, `contact@nom-association.fr`, l'adresse et le montant de
25 €/an sont des **exemples** à remplacer par vos vraies coordonnées (dans
`index.html`, `contact.html`, et les attributs `data-contact-phone` /
`data-contact-email`).

### Pourquoi cette architecture

- **CSS séparé par responsabilité** (tokens / reset / layout / composants /
  pages) plutôt qu'un unique fichier : plus facile à faire évoluer sans
  régression, et réutilisable si vous ajoutez des pages plus tard.
- **JS en modules ES** (`type="module"`) : `modal.js` est un composant
  générique sans dépendance, réutilisé par `contact.js`. Aucun script inline
  dans le HTML — important pour la politique de sécurité de contenu (CSP)
  ci-dessous.
- **Interaction obligatoire tél/e-mail** : les blocs contact ne sont pas des
  liens `tel:`/`mailto:` cliquables directement, mais des `<button>` qui
  ouvrent une modale de confirmation accessible (piège à focus, fermeture au
  clavier via `Échap`, `aria-modal`) avant de déclencher l'action réelle.

---

## 1. Sécurité — à mettre en place avant mise en production

Comme c'est un site 100 % statique (pas de backend, pas de base de données,
pas de formulaire qui écrit quelque part), la surface d'attaque est déjà
réduite. Voici ce qui reste à faire, par ordre de priorité :

1. **HTTPS obligatoire partout**, avec redirection automatique HTTP → HTTPS
   et *HSTS* (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
   Chez la quasi-totalité des hébergeurs actuels (voir §3), le certificat
   TLS (Let's Encrypt) est gratuit et automatique.

2. **Content-Security-Policy (CSP) stricte**, envoyée en en-tête HTTP
   (pas en `<meta>`, moins fiable) :
   ```
   Content-Security-Policy:
     default-src 'self';
     style-src 'self' https://fonts.googleapis.com;
     font-src https://fonts.gstatic.com;
     script-src 'self';
     img-src 'self' data:;
     object-src 'none';
     base-uri 'self';
     frame-ancestors 'none';
   ```
   Le code fourni n'a **aucun script inline** exprès, pour rester compatible
   avec une CSP sans `'unsafe-inline'`.

3. **En-têtes de sécurité complémentaires** :
   `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
   `Referrer-Policy: strict-origin-when-cross-origin`,
   `Permissions-Policy: geolocation=(), microphone=(), camera=()`.

4. **Protection anti-spam/robots légère** : ajoutez un `robots.txt` simple et
   un `humans.txt` si besoin ; pas de formulaire côté serveur ici donc pas de
   risque d'injection SQL/XSS via un backend — restez vigilants si vous
   ajoutez un formulaire de contact plus tard (toujours valider et échapper
   côté serveur, jamais faire confiance au JS client).

5. **Gestion des dépendances** : les seules ressources externes sont les
   polices Google Fonts. Envisagez de les auto-héberger (`fonts-face` local)
   pour supprimer toute dépendance tierce et améliorer le RGPD/la vie privée
   des visiteurs (pas d'appel à un domaine tiers).

6. **Sauvegardes** et **contrôle de version** : hébergez le code source sur
   un dépôt Git (GitHub/GitLab, gratuit) — c'est aussi votre sauvegarde et
   votre historique de modifications, précieux pour une équipe bénévole qui
   tourne.

7. **Scan automatique** : activez un scanner gratuit type
   [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory) ou
   [securityheaders.com](https://securityheaders.com) une fois le site en
   ligne, pour vérifier les en-têtes ci-dessus.

---

## 2. Tests — unitaires, intégration, E2E

Le site étant du HTML/CSS/JS "vanilla", voici une stack de test simple et
gratuite adaptée à un projet bénévole :

| Niveau | Outil recommandé | Ce qu'on teste |
|---|---|---|
| **Unitaire** | [Vitest](https://vitest.dev) (ou Jest) + [jsdom](https://github.com/jsdom/jsdom) | Les fonctions pures de `modal.js`/`contact.js` : ouverture/fermeture de la modale, piège à focus, construction des URL `tel:`/`mailto:` |
| **Intégration** | Vitest + Testing Library (DOM) | Le comportement combiné : clic sur le bouton téléphone → la modale s'affiche avec le bon numéro → clic "Appeler" → `window.location.href` est bien mis à jour |
| **E2E** | [Playwright](https://playwright.dev) | Parcours utilisateur complet sur les 2 pages réelles dans un vrai navigateur : navigation accueil↔contact, menu mobile, confirmation tél/e-mail, focus clavier, responsive (mobile/desktop), accessibilité (`axe-core` intégrable à Playwright) |
| **Accessibilité continue** | `@axe-core/playwright` ou l'extension Lighthouse CI | Contraste, focus visible, `aria-*`, navigation clavier — à lancer en CI |
| **Qualité/CI** | GitHub Actions (gratuit pour un dépôt public/associatif) | Lance les 3 niveaux de tests + Lighthouse à chaque `push`/`pull request` |

Exemple de scénario E2E prioritaire à écrire en premier (Playwright) :
1. Ouvrir `contact.html`.
2. Cliquer sur le bloc téléphone → vérifier que la modale apparaît, contient
   le bon numéro, et que le focus clavier est dedans.
3. Appuyer sur `Échap` → la modale se ferme, le focus revient au bouton.
4. Cliquer sur "Appeler maintenant" → vérifier la redirection vers `tel:...`.
5. Répéter pour l'e-mail (`mailto:...`).
6. Vérifier le menu mobile (`<720px`) : bascule ouverture/fermeture,
   `aria-expanded` correctement mis à jour.

---

## 3. Nom de domaine et hébergement — au meilleur coût pour une association

Votre site est **100 % statique** (pas de PHP, pas de base de données) :
c'est la configuration la moins chère à héberger, et vous n'avez pas besoin
d'un serveur mutualisé classique type OVH/o2switch pour ça.

### Option la plus économique : hébergement statique gratuit + domaine payant seul

Pour un site purement statique, des hébergeurs spécialisés proposent
l'hébergement **gratuit, illimité en trafic, avec HTTPS automatique**, et
vous ne payez que le nom de domaine :

- **Cloudflare Pages** ou **GitHub Pages** ou **Netlify** (offres gratuites) :
  0 € d'hébergement, déploiement automatique depuis votre dépôt Git, HTTPS et
  CDN mondial inclus. C'est ce que choisissent la plupart des petites
  associations et projets vitrines aujourd'hui.
- Coût total : **uniquement le nom de domaine**, environ **5 à 10 €/an**
  pour un `.fr` (autour de <cite index="11-1">4,99 € HT/an soit 5,99 € TTC/an</cite> chez OVH) ou un `.org`/`.com`
  (autour de <cite index="11-1">7,99 € HT/an soit 9,59 € TTC/an</cite> pour un `.com` chez OVH).
- Limite : pas de boîte mail incluse dans l'offre gratuite — pour une adresse
  `contact@votre-association.fr`, il faudra un service mail séparé (voir
  ci-dessous).

C'est l'option que je recommande pour du bénévolat pur : **0 € d'hébergement,
~5-10 €/an de domaine, aucune maintenance serveur**.

### Option "tout-en-un" chez un hébergeur français : OVH

Si vous préférez tout centraliser chez un seul prestataire français (utile
pour avoir aussi des boîtes mail `@votre-association.fr` facilement), OVH
reste une option raisonnable :

- <cite index="3-1">Hébergement mutualisé à partir de 0,99 € HT/mois soit 1,19 € TTC/mois</cite>, avec <cite index="3-1">protection anti-DDoS incluse et trafic mensuel illimité</cite>.
- Attention au **prix de renouvellement** : plusieurs comparatifs 2026
  soulignent que <cite index="1-1">le prix affiché est un prix promotionnel et que seul le tarif de renouvellement compte sur la durée</cite>, et qu'<cite index="2-1">OVH a réalisé une restructuration de ses gammes le 1ᵉʳ mai 2026 accompagnée d'une hausse de ses tarifs</cite>.
- Budget réaliste tout compris (hébergement + domaine) chez ce type
  d'hébergeur : <cite index="1-1">entre 60 et 150 € par an pour un petit site professionnel</cite> — nettement plus que
  l'option statique gratuite ci-dessus, pour un site qui n'a pourtant pas
  besoin de PHP/MySQL.
- Un nom de domaine `.fr` chez OVH est <cite index="11-1">à 4,99 € HT/an</cite>, avec généralement une
  première année offerte si acheté avec un hébergement.

### Et AWS ?

Techniquement possible (S3 + CloudFront, quelques centimes à quelques euros
par mois pour un trafic de petite association) mais je le déconseille ici :
la **facturation à l'usage sans plafond simple** est un vrai risque pour une
structure bénévole (facture qui peut grimper en cas de pic de trafic ou de
mauvaise configuration), et la configuration (bucket, distribution CDN,
certificat ACM, DNS) est nettement plus technique à maintenir dans la durée
par des bénévoles que Cloudflare Pages/Netlify, qui sont pensés pour être
gratuits et sans surprise de facturation sur ce type de site.

### Recommandation concrète

1. **Nom de domaine** : achetez-le seul (pas lié à un pack d'hébergement),
   chez OVH ou un registrar équivalent — un `.fr` ou `.org` convient bien à
   une association (~5-10 €/an).
2. **Hébergement du site statique** : Cloudflare Pages ou Netlify (gratuit),
   déployé automatiquement depuis un dépôt Git.
3. **Boîte mail `contact@votre-association.fr`** : si vous en avez besoin,
   c'est souvent le seul poste payant restant — comptez un petit service mail
   pro à quelques euros/mois (ou une redirection simple si votre registrar de
   domaine le propose gratuitement), plutôt que de payer un hébergement web
   complet juste pour ça.

Budget annuel réaliste avec cette configuration : **environ 10 à 30 €/an**
(domaine + éventuelle boîte mail), contre 60-150 €/an pour un hébergement
mutualisé classique dont vous n'exploiteriez pas les fonctionnalités
(PHP/MySQL) sur un site purement statique.
