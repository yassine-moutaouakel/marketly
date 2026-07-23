# Architecture logicielle

## Vue d'ensemble

Marketly suit une architecture separee en trois blocs:

1. `frontend/`: application Next.js en charge du parcours utilisateur.
2. `backend/`: API REST Express securisee, documentee et testee.
3. `postgres`: base relationnelle pour les comptes, boutiques, produits, paniers et commandes.

## Architecture cible

```text
Navigateur
   |
   v
Next.js + Tailwind
   |
   v
Express API + JWT + Zod + Swagger
   |
   v
Prisma ORM
   |
   v
PostgreSQL
```

## Couches backend

### Presentation

- Routes Express
- Controllers
- Swagger/OpenAPI

### Application

- Services metier
- Regles d'autorisation
- Transformation des donnees

### Infrastructure

- Prisma Client
- PostgreSQL
- Stripe SDK

## Frontend

### Pages principales

- `/`: catalogue et filtres
- `/login`, `/register`: authentification
- `/cart`: panier et checkout
- `/dashboard`: profil buyer
- `/dashboard/seller`: boutique, produits, commandes vendeur
- `/dashboard/admin`: moderation et KPIs admin

### Etat et appels API

- `AuthProvider` pour JWT et utilisateur courant
- `lib/api.ts` pour centraliser les appels REST
- composants client pour chaque workflow metier

## Securite

- JWT signe avec secret configurable
- Hash du mot de passe avec bcrypt
- Middlewares `authenticate` et `authorize`
- Validation Zod sur les corps de requete
- `helmet` pour les entetes HTTP
- `express-rate-limit` global, complete par un limiteur strict sur `/auth/*`
- Gestion centralisee des erreurs
- Garde de concurrence sur le stock au checkout (`updateMany` conditionnel)
- Refus de demarrage en production avec des secrets par defaut
- Verification de signature des webhooks Stripe

## Flux metier principal

### Achat

1. Le buyer s'authentifie.
2. Il parcourt le catalogue public.
3. Il ajoute des produits a son panier.
4. Il valide le panier avec une adresse.
5. Le backend cree une commande par boutique.
6. Stripe Checkout est cree.
7. Le webhook marque les commandes en `PAID`.

### Vente

1. Le seller cree une boutique.
2. L'admin valide la boutique.
3. Le seller cree des produits.
4. L'admin peut modrer/suspendre les produits.
5. Le seller suit les commandes recues et met a jour leur statut.

### Administration

1. L'admin consulte les KPIs.
2. Il valide ou suspend les boutiques.
3. Il publie, suspend ou remet en brouillon les produits.

## Conteneurisation

- `postgres`: base de donnees
- `backend`: API avec `prisma db push` et `seed`
- `frontend`: build Next.js production

## Integration continue

Le pipeline `.github/workflows/ci.yml` enchaine trois jobs :

1. `backend` : `npm ci`, `prisma generate`, `prisma migrate deploy` sur un
   service PostgreSQL, `npm run build` puis `npm test -- --coverage`.
2. `frontend` : `npm ci` puis `next build`.
3. `docker` : construction des images backend et frontend.

## Migrations de base de donnees

Le schema est versionne dans `backend/prisma/migrations`. Le conteneur backend
execute `prisma migrate deploy` au demarrage, garantissant un historique de
schema reproductible entre les environnements.

## Choix d'architecture

- Monorepo simple a lire pour une soutenance
- Separation frontend/backend pour montrer la conception full stack
- Prisma pour accelerer le mapping base / code
- Next.js pour un front moderne et presentable
- Docker Compose pour la reproductibilite locale
