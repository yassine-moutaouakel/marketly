# Marketly

Marketly est une marketplace multi-vendeurs realisee pour le Bloc 02 RNCP du M2 Expert Developpement Full Stack Ynov. Le projet couvre la conception, le developpement, la securisation, les tests, la documentation et l'orchestration Docker d'une application complete buyer / seller / admin.

## Stack

- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Base de donnees: PostgreSQL + Prisma ORM
- Authentification: JWT + bcrypt
- Paiement: Stripe Checkout en mode test
- Tests: Jest + Supertest
- Documentation API: Swagger/OpenAPI sur `/api/docs`
- Conteneurisation: `docker-compose.yml`

## Structure

```text
marketly/
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
├── docs/
│   ├── rapport-bloc-02.md
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── postman/
│   │   └── Marketly.postman_collection.json
│   └── screenshots/
│       └── README.md
```

## Comptes seed

- Admin: `admin@marketly.dev` / `Admin123!`
- Seller: `seller@marketly.dev` / `Seller123!`
- Buyer: `buyer@marketly.dev` / `Buyer123!`

## Variables d'environnement

### Racine

Fichier: `.env`

```env
POSTGRES_DB=marketly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
JWT_SECRET=marketly-super-secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_change_me
STRIPE_WEBHOOK_SECRET=whsec_change_me
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Backend

Fichier: `backend/.env`

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketly?schema=public
JWT_SECRET=marketly-super-secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_change_me
STRIPE_WEBHOOK_SECRET=whsec_change_me
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:4000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Frontend

Fichier: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Installation locale

### 1. Preparer les fichiers `.env`

PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

### 2. Lancer PostgreSQL

Option simple avec Docker:

```powershell
docker compose up -d postgres
```

### 3. Installer et lancer le backend

```powershell
Set-Location backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Le backend sera disponible sur:

- API: `http://localhost:4000/api`
- Healthcheck: `http://localhost:4000/health`
- Swagger: `http://localhost:4000/api/docs`

### 4. Installer et lancer le frontend

Dans un second terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Le frontend sera disponible sur:

- Application: `http://localhost:3000`

## Lancement Docker Compose

Depuis la racine:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Services exposes:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

## Stripe test

Pour tester le webhook Stripe localement:

```powershell
stripe listen --forward-to localhost:4000/api/payments/webhook
```

Puis mettre a jour `STRIPE_WEBHOOK_SECRET` dans `backend/.env`.

## Scripts utiles

### Backend

```powershell
Set-Location backend
npm run dev
npm run build
npm test
npm run prisma:push
npm run seed
```

### Frontend

```powershell
Set-Location frontend
npm run dev
npm run build
npm run start
```

## Tests

La suite automatisee contient 19 tests Supertest/Jest couvrant:

- Authentification
- Produits
- Commandes
- Administration

Commande:

```powershell
Set-Location backend
npm test
```

## Fonctionnalites couvertes

- Authentification JWT avec roles `BUYER`, `SELLER`, `ADMIN`
- Profil utilisateur, adresses, historique des commandes
- Creation et mise a jour de boutique vendeur
- CRUD produits cote API
- Recherche, filtres, prix, stock, images produits
- Panier persistant par utilisateur
- Creation de commandes par boutique
- Session Stripe Checkout et webhook
- Dashboard admin avec moderation boutiques / produits
- Middlewares `helmet`, rate limiting, validation Zod, gestion centralisee des erreurs
- Swagger/OpenAPI
- Seed data

## Documentation

- Architecture: [docs/architecture.md](docs/architecture.md)
- API: [docs/api.md](docs/api.md)
- Base de donnees: [docs/database.md](docs/database.md)
- Rapport Bloc 02: [docs/rapport-bloc-02.md](docs/rapport-bloc-02.md)
- Collection Postman: [docs/postman/Marketly.postman_collection.json](docs/postman/Marketly.postman_collection.json)

## Verification realisee

- Backend: `npm run build`
- Backend: `npm test`
- Frontend: `npm run build`

## Pistes d'amelioration

- Gestion avancée des images via upload S3/Cloudinary
- Notifications email post-commande
- Back-office analytics avec graphiques
- Pagination et tri avance du catalogue
- Refresh token et rotation de session
