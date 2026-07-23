# Documentation API

## Base URL

- Local: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`

## Authentification

Le backend attend un header:

```http
Authorization: Bearer <jwt>
```

## Principaux endpoints

| Domaine | Methode | Endpoint | Protection | Usage |
| --- | --- | --- | --- | --- |
| Auth | POST | `/auth/register` | Public | Inscription buyer ou seller |
| Auth | POST | `/auth/login` | Public | Connexion |
| Auth | GET | `/auth/me` | JWT | Recuperer l'utilisateur courant |
| Profile | GET | `/profile` | JWT | Profil, adresses, historique |
| Addresses | POST | `/addresses` | JWT | Ajouter une adresse |
| Shops | POST | `/shops` | Seller/Admin | Creer une boutique |
| Shops | PUT | `/shops/me` | Seller/Admin | Modifier sa boutique |
| Products | GET | `/products` | Public | Catalogue + filtres + pagination |
| Products | POST | `/products` | Seller/Admin | Creer un produit |
| Products | GET | `/products/seller/mine` | Seller/Admin | Produits du vendeur |
| Cart | POST | `/cart/items` | JWT | Ajouter au panier |
| Orders | POST | `/orders/checkout` | JWT | Creer des commandes |
| Orders | GET | `/orders/my` | JWT | Historique buyer |
| Orders | GET | `/orders/received` | Seller/Admin | Historique vendeur |
| Payments | POST | `/payments/checkout-session` | JWT | Session Stripe |
| Admin | GET | `/admin/dashboard` | Admin | KPIs |
| Admin | PATCH | `/admin/shops/:shopId/status` | Admin | Valider/suspendre une boutique |
| Admin | PATCH | `/admin/products/:productId/status` | Admin | Moderation produit |

## Exemples de requetes

### Inscription

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newbuyer@marketly.dev",
  "password": "Buyer123!",
  "firstName": "Nina",
  "lastName": "Buyer",
  "role": "BUYER"
}
```

### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "buyer@marketly.dev",
  "password": "Buyer123!"
}
```

### Recherche produit

```http
GET /api/products?search=casque&minPrice=50&maxPrice=120&page=1&limit=12
```

Reponse paginee :

```json
{
  "data": [{ "id": "...", "name": "Casque Bluetooth Nova", "price": 89.9 }],
  "meta": { "page": 1, "limit": 12, "total": 16, "totalPages": 2 }
}
```

Parametres de pagination :

- `page` : numero de page, entier positif, defaut `1`
- `limit` : taille de page, entier entre `1` et `50`, defaut `12`

Une valeur hors bornes renvoie une erreur `400` de validation.

### Ajout panier

```http
POST /api/cart/items
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 1
}
```

### Checkout

```http
POST /api/orders/checkout
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "addressId": "address-id"
}
```

### Session Stripe

```http
POST /api/payments/checkout-session
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "orderIds": ["order-id-1", "order-id-2"]
}
```

## Collection Postman

Une collection d'exemples est disponible dans:

- [docs/postman/Marketly.postman_collection.json](postman/Marketly.postman_collection.json)

Variables conseillees:

- `baseUrl`: `http://localhost:4000/api`
- `token`: JWT du compte courant

## Requetes Postman recommandees pour la soutenance

1. `Auth / Login buyer`
2. `Products / List`
3. `Cart / Add item`
4. `Orders / Checkout`
5. `Payments / Create checkout session`
6. `Admin / Dashboard`
