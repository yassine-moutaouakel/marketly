import type {
  Address,
  Category,
  Order,
  OrderItem,
  PaymentStatus,
  Product,
  ProductImage,
  ProductStatus,
  Role,
  Shop,
  ShopStatus,
  User
} from "@prisma/client";
import { signToken } from "../../lib/jwt";

export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  email: "buyer@marketly.dev",
  password: "hashed-password",
  firstName: "Bianca",
  lastName: "Buyer",
  phone: null,
  role: "BUYER" satisfies Role,
  isActive: true,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides
});

export const buildAddress = (overrides: Partial<Address> = {}): Address => ({
  id: "address-1",
  userId: "user-1",
  label: "Domicile",
  line1: "12 rue du Commerce",
  line2: null,
  city: "Paris",
  postalCode: "75010",
  country: "France",
  isDefault: true,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides
});

export const buildShop = (overrides: Partial<Shop> = {}): Shop => ({
  id: "shop-1",
  ownerId: "seller-1",
  name: "Studio Marketly",
  slug: "studio-marketly",
  description: "Boutique de demonstration",
  logoUrl: null,
  bannerUrl: null,
  status: "APPROVED" satisfies ShopStatus,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides
});

export const buildCategory = (overrides: Partial<Category> = {}): Category => ({
  id: "category-1",
  name: "Electronique",
  slug: "electronique",
  description: "Tech",
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides
});

export const buildProductImage = (overrides: Partial<ProductImage> = {}): ProductImage => ({
  id: "image-1",
  productId: "product-1",
  url: "https://example.com/product.jpg",
  alt: "Produit",
  sortOrder: 0,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides
});

export const buildProduct = (
  overrides: Partial<Product> = {},
  relations?: {
    shop?: Shop;
    category?: Category;
    images?: ProductImage[];
  }
) => ({
  id: "product-1",
  shopId: relations?.shop?.id ?? "shop-1",
  categoryId: relations?.category?.id ?? "category-1",
  name: "Casque Bluetooth Nova",
  slug: "casque-bluetooth-nova",
  description: "Casque sans fil",
  sku: "NOVA-HEADSET",
  priceInCents: 8990,
  stock: 12,
  isFeatured: false,
  status: "PUBLISHED" satisfies ProductStatus,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides,
  shop: relations?.shop ?? buildShop(),
  category: relations?.category ?? buildCategory(),
  images: relations?.images ?? [buildProductImage()]
});

export const buildOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  id: "order-item-1",
  orderId: "order-1",
  productId: "product-1",
  nameSnapshot: "Casque Bluetooth Nova",
  skuSnapshot: "NOVA-HEADSET",
  imageUrlSnapshot: "https://example.com/product.jpg",
  priceInCents: 8990,
  quantity: 1,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides
});

export const buildOrder = (
  overrides: Partial<Order> = {},
  relations?: {
    shop?: Shop;
    buyer?: User;
    items?: OrderItem[];
  }
) => ({
  id: "order-1",
  buyerId: relations?.buyer?.id ?? "buyer-1",
  shopId: relations?.shop?.id ?? "shop-1",
  totalInCents: 8990,
  status: "PENDING",
  paymentStatus: "PENDING" satisfies PaymentStatus,
  stripeCheckoutSessionId: null,
  stripePaymentIntentId: null,
  shippingSnapshot: {
    label: "Domicile",
    line1: "12 rue du Commerce",
    city: "Paris",
    postalCode: "75010",
    country: "France"
  },
  notes: null,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  ...overrides,
  shop: relations?.shop ?? buildShop(),
  buyer: relations?.buyer ?? buildUser(),
  items: relations?.items ?? [buildOrderItem()]
});

export const authHeaderForRole = (role: Role, overrides: Partial<User> = {}) => {
  const user = buildUser({
    id: `${role.toLowerCase()}-1`,
    email: `${role.toLowerCase()}@marketly.dev`,
    role,
    ...overrides
  });

  return `Bearer ${signToken({
    sub: user.id,
    email: user.email,
    role: user.role
  })}`;
};
