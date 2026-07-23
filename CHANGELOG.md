# Journal des versions

Toutes les evolutions notables du projet Marketly sont consignees dans ce fichier.
Le format suit les principes de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet applique le [versionnage semantique](https://semver.org/lang/fr/).

## [1.1.1] - 2026-07-24

### Corrections

- Le script `start` du backend pointait vers `dist/server.js`, alors que
  `tsconfig.json` (`rootDir: "."`, necessaire pour typechecker
  `prisma/seed.ts` via `npm run build`) emet la sortie compilee dans
  `dist/src/`. Le conteneur backend crashait au demarrage
  (`MODULE_NOT_FOUND`) sans que le pipeline CI ne le detecte, le job
  `docker` se contentant de construire l'image sans la demarrer. Repere
  et corrige lors d'un `docker compose up --build` complet.

## [1.1.0] - 2026-07-23

### Securite

- Correction d'une condition de concurrence sur le stock lors du checkout : le
  decrement s'effectue desormais via un `updateMany` garde par `stock >= quantite`,
  ce qui empeche deux commandes simultanees de faire passer le stock en negatif.
  Une erreur `409 Insufficient stock` est retournee si la garde ne matche aucune ligne.
- Ajout d'un limiteur de debit dedie aux routes d'authentification
  (`/auth/login`, `/auth/register`) : dix tentatives par fenetre de quinze minutes,
  en complement du limiteur global (OWASP A07).
- Verification de la signature des webhooks Stripe encapsulee dans une erreur
  applicative `400 Invalid Stripe webhook signature` au lieu d'une erreur 500 non
  qualifiee (OWASP A08).
- Refus de demarrage en production si `JWT_SECRET`, `STRIPE_SECRET_KEY` ou
  `STRIPE_WEBHOOK_SECRET` conservent leur valeur par defaut de developpement
  (OWASP A05).

### Ajouts

- Migrations Prisma versionnees (`prisma/migrations/`) remplacant `prisma db push`.
  Le conteneur backend execute desormais `prisma migrate deploy` au demarrage,
  ce qui garantit un historique de schema reproductible et auditable.
- Pipeline d'integration continue GitHub Actions (`.github/workflows/ci.yml`) :
  trois jobs enchaines — backend (migrations, typecheck, tests, rapport de
  couverture archive), frontend (build de production) et docker (construction des
  deux images).
- Pagination cote serveur sur le catalogue : parametres `page` et `limit`
  (maximum 50, defaut 12), metadonnees `page`, `limit`, `total` et `totalPages`
  retournees dans le champ `meta` de la reponse, et controles de navigation
  accessibles cote interface.
- Catalogue de demonstration enrichi : seize produits repartis sur les trois
  categories, ce qui rend la pagination demontrable en soutenance.

### Accessibilite

- Etiquettes `label` explicites associees par `htmlFor` a tous les champs des
  formulaires de connexion et d'inscription.
- Attributs ARIA sur les champs et messages d'erreur : `aria-required`,
  `aria-invalid`, `aria-describedby` et `role="alert"` sur les messages d'erreur.
- Lien d'evitement « Aller au contenu principal » visible a la prise de focus
  clavier, cible sur la region `<main id="contenu-principal">`.
- Libelles accessibles (`aria-label`) sur les filtres du catalogue et region
  `aria-live` sur les messages de confirmation.

### Qualite

- Harnais de tests porte de 19 a 37 tests repartis sur six suites : ajout des
  suites `payments.test.ts` (session Stripe, webhook signe, signature invalide ou
  absente) et `cart-shops.test.ts` (regles du panier, unicite de boutique,
  controles de role).
- Couverture globale portee de 73 % a 81 % des instructions, la couche services
  passant de 49 % a 64 %.
- Journalisation `morgan` au format `combined` en production et `dev` en
  developpement.

## [1.0.0] - 2026-07

### Version initiale

- Authentification JWT avec hachage bcrypt et gestion des roles
  `BUYER`, `SELLER`, `ADMIN`.
- Gestion des profils, des adresses et de l'historique de commandes.
- Creation et administration de boutiques vendeur avec circuit de moderation.
- Gestion CRUD des produits : categories, prix, stock, images.
- Recherche et filtres sur le catalogue public.
- Panier persistant rattache au compte utilisateur.
- Checkout multi-boutiques avec creation d'une commande par vendeur et
  snapshots d'adresse et de produits.
- Paiement Stripe Checkout en mode test avec confirmation par webhook.
- Tableau de bord administrateur et moderation des boutiques et produits.
- Documentation interactive Swagger et collection Postman.
- Orchestration locale complete via Docker Compose.
