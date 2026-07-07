# Marketly

Marketly is a multi-vendor marketplace built for the Bloc 02 RNCP evaluation in the Ynov M2 Expert Developpement Full Stack program.

The project includes:

- a `Next.js` frontend for buyers, sellers, and admins
- an `Express` API with `TypeScript`
- a `PostgreSQL` database with `Prisma`
- `JWT` authentication and role-based access control
- `Stripe` test checkout and webhook handling
- automated tests with `Jest` and `Supertest`
- API documentation with `Swagger`
- local orchestration with `Docker Compose`

## Tech Stack

- Frontend: `Next.js 14`, `TypeScript`, `Tailwind CSS`
- Backend: `Node.js`, `Express`, `TypeScript`
- Database: `PostgreSQL`, `Prisma ORM`
- Auth: `JWT`, `bcrypt`
- Payments: `Stripe Checkout` in test mode
- Testing: `Jest`, `Supertest`
- API docs: `Swagger/OpenAPI`
- Containers: `Docker Compose`

## Features

- User registration and login
- Roles: `BUYER`, `SELLER`, `ADMIN`
- User profile, addresses, and order history
- Seller shop creation and management
- Product CRUD, categories, images, price, and stock
- Product search and filtering
- Persistent cart per user
- Multi-shop order creation
- Stripe checkout session creation
- Stripe webhook payment update
- Admin dashboard and moderation
- Rate limiting, `helmet`, validation, centralized error handling
- Seed data for demo accounts and catalog

## Project Structure

```text
marketly/
|-- backend/
|-- frontend/
|-- docs/
|   |-- architecture.md
|   |-- api.md
|   |-- database.md
|   |-- rapport-bloc-02.md
|   `-- postman/
|-- docker-compose.yml
`-- README.md
```

## Demo Accounts

- Admin: `admin@marketly.dev` / `Admin123!`
- Seller: `seller@marketly.dev` / `Seller123!`
- Buyer: `buyer@marketly.dev` / `Buyer123!`

## Quick Start With Docker

### 1. Create env files

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

### 2. Build and start the full stack

```powershell
docker compose up --build
```

### 3. Open the app

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`
- Healthcheck: `http://localhost:4000/health`

## Local Development

### Root env

File: `.env`

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

### Backend env

File: `backend/.env`

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

### Frontend env

File: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Start PostgreSQL only

```powershell
docker compose up -d postgres
```

### Start backend locally

```powershell
Set-Location backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

### Start frontend locally

```powershell
Set-Location frontend
npm install
npm run dev
```

## Useful Commands

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

## Stripe Test Webhook

```powershell
stripe listen --forward-to localhost:4000/api/payments/webhook
```

Then update `STRIPE_WEBHOOK_SECRET` in `backend/.env`.

## Automated Tests

The backend test suite currently includes `19` automated tests covering:

- authentication
- products
- orders
- admin flows

Run:

```powershell
Set-Location backend
npm test
```

## Documentation

- Architecture: [docs/architecture.md](docs/architecture.md)
- API: [docs/api.md](docs/api.md)
- Database: [docs/database.md](docs/database.md)
- Bloc 02 report: [docs/rapport-bloc-02.md](docs/rapport-bloc-02.md)
- Postman collection: [docs/postman/Marketly.postman_collection.json](docs/postman/Marketly.postman_collection.json)

## Validation Already Performed

- Backend build: `npm run build`
- Backend tests: `npm test`
- Frontend build: `npm run build`
- Docker image build: `docker compose build backend frontend`

## Possible Improvements

- cloud image upload with S3 or Cloudinary
- email notifications after order creation
- analytics dashboard with charts
- pagination and advanced sorting
- refresh tokens and session rotation
- production deployment pipeline
