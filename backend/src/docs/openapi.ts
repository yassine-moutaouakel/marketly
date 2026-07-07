import { env } from "../config/env";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Marketly API",
    version: "1.0.0",
    description:
      "API REST de la marketplace multi-vendeurs Marketly pour le Bloc 02 Ynov M2 Expert Developpement Full Stack."
  },
  servers: [
    {
      url: `${env.API_BASE_URL}/api`,
      description: "Serveur local"
    }
  ],
  tags: [
    { name: "Auth" },
    { name: "Profile" },
    { name: "Addresses" },
    { name: "Categories" },
    { name: "Shops" },
    { name: "Products" },
    { name: "Cart" },
    { name: "Orders" },
    { name: "Payments" },
    { name: "Admin" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Inscription d'un buyer ou seller",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName", "lastName"],
                properties: {
                  email: { type: "string", example: "buyer@marketly.dev" },
                  password: { type: "string", example: "Buyer123!" },
                  firstName: { type: "string", example: "Bianca" },
                  lastName: { type: "string", example: "Buyer" },
                  role: { type: "string", enum: ["BUYER", "SELLER"] }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Utilisateur cree" }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Connexion utilisateur",
        responses: {
          "200": { description: "Connexion reussie" }
        }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Recuperer l'utilisateur connecte",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profil courant" }
        }
      }
    },
    "/profile": {
      get: {
        tags: ["Profile"],
        summary: "Profil, adresses et historique de commandes",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profil detaille" }
        }
      },
      put: {
        tags: ["Profile"],
        summary: "Mettre a jour le profil",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profil mis a jour" }
        }
      }
    },
    "/addresses": {
      get: {
        tags: ["Addresses"],
        summary: "Lister les adresses",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Liste des adresses" }
        }
      },
      post: {
        tags: ["Addresses"],
        summary: "Ajouter une adresse",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Adresse creee" }
        }
      }
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Lister les categories",
        responses: {
          "200": { description: "Liste des categories" }
        }
      }
    },
    "/shops": {
      post: {
        tags: ["Shops"],
        summary: "Creer une boutique vendeur",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Boutique creee" }
        }
      }
    },
    "/shops/me": {
      get: {
        tags: ["Shops"],
        summary: "Recuperer la boutique du vendeur",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Boutique vendeur" }
        }
      },
      put: {
        tags: ["Shops"],
        summary: "Modifier la boutique du vendeur",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Boutique mise a jour" }
        }
      }
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "Recherche et filtres produits",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } }
        ],
        responses: {
          "200": { description: "Catalogue produits" }
        }
      },
      post: {
        tags: ["Products"],
        summary: "Creer un produit",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Produit cree" }
        }
      }
    },
    "/products/seller/mine": {
      get: {
        tags: ["Products"],
        summary: "Lister les produits du vendeur",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Produits du vendeur" }
        }
      }
    },
    "/products/{productId}": {
      get: {
        tags: ["Products"],
        summary: "Recuperer un produit",
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Produit" }
        }
      },
      put: {
        tags: ["Products"],
        summary: "Modifier un produit",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Produit mis a jour" }
        }
      },
      delete: {
        tags: ["Products"],
        summary: "Supprimer un produit",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Produit supprime" }
        }
      }
    },
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Recuperer le panier courant",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Panier courant" }
        }
      }
    },
    "/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Ajouter un produit au panier",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Panier mis a jour" }
        }
      }
    },
    "/orders/checkout": {
      post: {
        tags: ["Orders"],
        summary: "Transformer le panier en commandes",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Commandes creees" }
        }
      }
    },
    "/orders/my": {
      get: {
        tags: ["Orders"],
        summary: "Historique des commandes acheteur",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Commandes acheteur" }
        }
      }
    },
    "/orders/received": {
      get: {
        tags: ["Orders"],
        summary: "Commandes recues par le vendeur",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Commandes vendeur" }
        }
      }
    },
    "/payments/checkout-session": {
      post: {
        tags: ["Payments"],
        summary: "Creer une session Stripe test",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Session Stripe" }
        }
      }
    },
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard de pilotage admin",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "KPIs admin" }
        }
      }
    }
  }
};
