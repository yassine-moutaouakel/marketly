# Marketly

## 1. Page de garde

- Etablissement: Ynov Campus
- Bloc RNCP: Bloc 02 - Conception et developpement d'applications logicielles
- Formation: M2 Expert Developpement Full Stack
- Projet: Marketly, marketplace multi-vendeurs
- Auteur: A completer
- Date: A completer
- Version: 1.0

## 2. Sommaire

1. Introduction
2. Contexte du projet
3. Analyse des besoins
4. Cahier des charges
5. Architecture logicielle
6. Choix technologiques
7. Modele de donnees
8. Developpement des fonctionnalites
9. Securite
10. API REST
11. Tests
12. Deploiement
13. Difficultes rencontrees
14. Ameliorations possibles
15. Conclusion
16. Annexes

## 3. Introduction

Le projet Marketly a ete concu comme une application e-commerce multi-vendeurs permettant a plusieurs boutiques de proposer leurs produits dans un catalogue unifie. L'objectif pedagogique du Bloc 02 est de demontrer une capacite complete a analyser un besoin, concevoir une solution logicielle, produire une application maintenable, securisee, testee et documentee, puis la livrer dans un format exploitable.

Marketly a donc ete pense comme un MVP coherent de marketplace, avec trois profils distincts:

- un acheteur qui explore les produits, gere son panier et passe commande,
- un vendeur qui cree sa boutique et gere son catalogue,
- un administrateur qui supervise l'activite, modere les boutiques et les produits.

## 4. Contexte du projet

Dans les marketplaces modernes, la mutualisation du catalogue permet de centraliser l'experience utilisateur tout en laissant a chaque vendeur un espace de gestion autonome. Le besoin fonctionnel se situe a l'intersection de plusieurs sujets full stack:

- gestion d'identite et de roles,
- modelisation relationnelle,
- exposition d'une API REST,
- interface front ergonomique,
- securite des flux,
- paiements,
- qualite logicielle et tests.

Le projet repond a un contexte d'evaluation RNCP en prouvant la maitrise de la chaine complete de conception et de developpement d'une application logicielle.

## 5. Analyse des besoins

### Besoins fonctionnels

- permettre l'inscription et la connexion des utilisateurs,
- gerer les roles `BUYER`, `SELLER`, `ADMIN`,
- permettre a un vendeur de creer et administrer une boutique,
- permettre la gestion CRUD des produits,
- offrir un moteur de recherche et des filtres produits,
- proposer un panier utilisateur,
- generer des commandes avec gestion de statuts,
- integrer un paiement Stripe en mode test,
- fournir un back-office de moderation.

### Besoins non fonctionnels

- code TypeScript structure et maintenable,
- application securisee,
- documentation technique et fonctionnelle,
- tests automatiques,
- demarrage local rapide via Docker Compose,
- seed data pour la demonstration.

### Utilisateurs cibles

- buyer: client final de la marketplace,
- seller: commercant ou marque,
- admin: superviseur de la plateforme.

## 6. Cahier des charges

### Fonctionnalites prioritaires

1. Authentification JWT et mots de passe hashes.
2. Gestion des profils et des adresses.
3. Gestion d'une boutique cote vendeur.
4. Gestion des produits, categories, prix, images et stock.
5. Panier et validation de commande.
6. Paiement Stripe test avec webhook.
7. Dashboard admin avec moderation.

### Contraintes de realisation

- frontend en Next.js + TypeScript + Tailwind CSS,
- backend en Node.js + Express + TypeScript,
- PostgreSQL avec Prisma ORM,
- documentation Swagger,
- tests Jest + Supertest,
- orchestration Docker Compose.

## 7. Architecture logicielle

Le projet est organise en deux applications principales:

- `backend/` pour l'API REST et la logique metier,
- `frontend/` pour l'interface utilisateur.

Le backend suit une architecture en couches:

- routes Express pour l'exposition HTTP,
- controllers pour l'orchestration des requetes,
- services pour la logique metier,
- Prisma comme couche d'acces aux donnees.

Le frontend s'appuie sur l'App Router de Next.js. Les pages principales sont client-side pour simplifier l'usage du JWT stocke localement et permettre des interactions directes avec l'API.

### Capture suggeree 1

`docs/screenshots/capture-01-home-catalogue.png`

### Capture suggeree 2

`docs/screenshots/capture-05-admin-dashboard.png`

## 8. Choix technologiques

### Next.js

Next.js permet une structure claire de pages, une bonne experience developpeur et une interface moderne, tout en restant facilement demonstrable lors d'une soutenance.

### Express

Express reste pertinent pour construire rapidement une API REST lisible. L'empilement middleware est bien adapte aux enjeux du projet: auth, validation, rate limiting, erreurs centralisees.

### Prisma

Prisma simplifie:

- la modelisation du schema,
- la generation du client type,
- la lisibilite des requetes,
- la maintenance du projet.

### PostgreSQL

Le moteur est adapte aux relations fortes entre utilisateurs, boutiques, produits, paniers et commandes.

### Tailwind CSS

Tailwind accelere la production d'une interface propre, responsive et presentable.

### Stripe

Stripe en mode test permet d'integrer un checkout realiste sans manipuler de veritables moyens de paiement.

## 9. Modele de donnees

Le modele relationnel s'articule autour des entites suivantes:

- `User`
- `Address`
- `Shop`
- `Category`
- `Product`
- `ProductImage`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`

### Decisions de modelisation

- les prix sont stockes en centimes,
- une boutique est unique par vendeur dans cette version,
- une commande est creee par boutique lors du checkout,
- l'adresse de livraison est snapshottee dans la commande.

### Capture suggeree 3

`docs/screenshots/capture-07-docker-compose.png`

## 10. Developpement des fonctionnalites

### Authentification

Le backend propose:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Les mots de passe sont haches avec bcrypt. Le JWT contient l'identifiant, l'email et le role.

### Profil utilisateur

Le buyer peut:

- consulter son profil,
- mettre a jour ses informations,
- ajouter des adresses,
- visualiser son historique de commandes.

### Boutique vendeur

Le seller peut:

- creer sa boutique,
- modifier sa fiche boutique,
- gerer ses produits,
- consulter les commandes recues,
- faire evoluer le statut de traitement des commandes.

### Catalogue produits

Le systeme prend en charge:

- le listing public,
- la recherche textuelle,
- les filtres par categorie et prix,
- les images produits,
- le stock,
- la moderation produit.

### Panier et commandes

Le panier est rattache au compte utilisateur. Lors du checkout:

1. le backend verifie le stock,
2. les lignes sont regroupees par boutique,
3. une commande est creee pour chaque vendeur concerne,
4. le stock est decremente,
5. le panier est vide.

### Paiement

Une session Stripe Checkout est creee a partir des commandes pending. Le webhook `checkout.session.completed` met a jour le statut de paiement et le statut metier de la commande en `PAID`.

### Administration

Le dashboard admin fournit:

- nombre d'utilisateurs,
- nombre de boutiques,
- nombre de produits,
- nombre de commandes.

L'admin peut egalement:

- approuver une boutique,
- la remettre en attente,
- la suspendre,
- publier un produit,
- le suspendre,
- le remettre en brouillon.

### Captures suggerees 4 et 5

- `docs/screenshots/capture-03-buyer-dashboard.png`
- `docs/screenshots/capture-04-seller-dashboard.png`

## 11. Securite

La securite a ete traitee a plusieurs niveaux.

### Authentification et autorisation

- JWT obligatoire sur les routes privees,
- middleware `authenticate`,
- middleware `authorize` base sur les roles.

### Protection des donnees

- mots de passe haches,
- verification des proprietes cote vendeur,
- exposition de l'utilisateur sans mot de passe.

### Hardening HTTP

- `helmet`,
- `express-rate-limit`,
- validation Zod,
- gestion centralisee des erreurs.

### Limites connues

- absence de refresh token,
- stockage JWT en localStorage dans le MVP,
- webhook Stripe necessitant une configuration locale ou distante du secret.

## 12. API REST

L'API suit une structure par domaines:

- auth,
- profile,
- addresses,
- shops,
- categories,
- products,
- cart,
- orders,
- payments,
- admin.

La documentation interactive Swagger est exposee sur:

`http://localhost:4000/api/docs`

### Capture suggeree 6

`docs/screenshots/capture-06-swagger.png`

## 13. Tests

Une suite de 19 tests automatisee a ete ajoutee avec Jest et Supertest.

### Perimetre couvert

- auth: inscription, connexion, profil courant,
- produits: listing, creation, suppression, droits,
- commandes: checkout, listing, mise a jour de statut,
- admin: dashboard et moderation.

### Resultat attendu

Commande:

```powershell
Set-Location backend
npm test
```

Le resultat attendu lors de la livraison est `19 passed`.

## 14. Deploiement

Le projet peut etre demarre:

- en local, service par service,
- via `docker compose up --build`.

Les conteneurs fournis:

- `postgres`,
- `backend`,
- `frontend`.

Le backend applique le schema Prisma au demarrage avec `prisma db push`, execute les seeds, puis expose l'API.

## 15. Difficultes rencontrees

### Multi-boutiques

Le point principal a ete de concilier un panier unique et des commandes multi-vendeurs. La solution retenue consiste a regrouper les lignes par boutique au moment du checkout.

### Typage full stack

Le maintien d'une coherence de types entre Prisma, l'API et le frontend a demande un soin particulier, surtout pour les objets enrichis par relations.

### Paiement

L'integration Stripe implique un flux asynchrone et l'usage d'un webhook pour fiabiliser la confirmation du paiement.

### Docker

Le demarrage coordonne de PostgreSQL puis du backend impose une configuration claire et une seed idempotente.

## 16. Ameliorations possibles

- pagination et tri serveur sur le catalogue,
- upload media via service externe,
- gestion des promotions et coupons,
- avis clients,
- tableau de bord analytique,
- refresh tokens,
- gestion fine des remboursements et litiges,
- observabilite et logs structures.

## 17. Conclusion

Marketly repond au besoin d'une marketplace multi-vendeurs en proposant une architecture full stack complete, lisible et demonstrable. Le projet couvre l'ensemble des attendus pedagogiques du Bloc 02:

- conception fonctionnelle,
- modelisation de donnees,
- implementation backend et frontend,
- securite,
- documentation,
- tests,
- industrialisation locale via Docker.

Le resultat obtenu constitue un MVP credible, facilement presentable en soutenance et suffisamment structure pour etre etendu en projet professionnel.

## 18. Annexes

### Arborescence principale

```text
backend/
frontend/
docs/
docker-compose.yml
README.md
```

### Comptes de demonstration

- `admin@marketly.dev` / `Admin123!`
- `seller@marketly.dev` / `Seller123!`
- `buyer@marketly.dev` / `Buyer123!`

### Liens internes utiles

- [Architecture](architecture.md)
- [API](api.md)
- [Base de donnees](database.md)
- [Collection Postman](postman/Marketly.postman_collection.json)
