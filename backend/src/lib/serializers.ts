import type {
  Address,
  Cart,
  CartItem,
  Category,
  Order,
  OrderItem,
  Product,
  ProductImage,
  ProductStatus,
  Role,
  Shop,
  ShopStatus,
  User
} from "@prisma/client";

const centsToPrice = (value: number) => Number((value / 100).toFixed(2));

type SerializedUser = Omit<User, "password">;

export const serializeUser = (user: User): SerializedUser => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const serializeAddress = (address: Address) => address;

export const serializeCategory = (category: Category) => category;

export const serializeShop = (
  shop: Shop & {
    owner?: User;
  }
) => ({
  id: shop.id,
  name: shop.name,
  slug: shop.slug,
  description: shop.description,
  logoUrl: shop.logoUrl,
  bannerUrl: shop.bannerUrl,
  status: shop.status as ShopStatus,
  owner: shop.owner ? serializeUser(shop.owner) : undefined,
  createdAt: shop.createdAt,
  updatedAt: shop.updatedAt
});

export const serializeProduct = (
  product: Product & {
    images?: ProductImage[];
    category?: Category | null;
    shop?: Shop | null;
  }
) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  sku: product.sku,
  price: centsToPrice(product.priceInCents),
  priceInCents: product.priceInCents,
  stock: product.stock,
  isFeatured: product.isFeatured,
  status: product.status as ProductStatus,
  images:
    product.images?.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder
    })) ?? [],
  category: product.category ? serializeCategory(product.category) : null,
  shop: product.shop ? serializeShop(product.shop) : null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

export const serializeCart = (
  cart:
    | (Cart & {
        items: Array<
          CartItem & {
            product: Product & {
              images: ProductImage[];
              category: Category;
              shop: Shop;
            };
          }
        >;
      })
    | null
) => {
  if (!cart) {
    return {
      id: null,
      items: [],
      totals: {
        itemCount: 0,
        total: 0,
        totalInCents: 0
      }
    };
  }

  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
  const totalInCents = cart.items.reduce(
    (total, item) => total + item.product.priceInCents * item.quantity,
    0
  );

  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      subtotal: centsToPrice(item.product.priceInCents * item.quantity),
      subtotalInCents: item.product.priceInCents * item.quantity,
      product: serializeProduct(item.product)
    })),
    totals: {
      itemCount,
      total: centsToPrice(totalInCents),
      totalInCents
    }
  };
};

export const serializeOrder = (
  order: Order & {
    shop?: Shop;
    items?: Array<OrderItem>;
    buyer?: User;
  }
) => ({
  id: order.id,
  total: centsToPrice(order.totalInCents),
  totalInCents: order.totalInCents,
  status: order.status,
  paymentStatus: order.paymentStatus,
  stripeCheckoutSessionId: order.stripeCheckoutSessionId,
  stripePaymentIntentId: order.stripePaymentIntentId,
  shippingSnapshot: order.shippingSnapshot,
  notes: order.notes,
  shop: order.shop ? serializeShop(order.shop) : undefined,
  buyer: order.buyer ? serializeUser(order.buyer) : undefined,
  items:
    order.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.nameSnapshot,
      sku: item.skuSnapshot,
      imageUrl: item.imageUrlSnapshot,
      price: centsToPrice(item.priceInCents),
      priceInCents: item.priceInCents,
      quantity: item.quantity
    })) ?? [],
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

export const serializeAuthPayload = (user: User, token: string) => ({
  token,
  user: serializeUser(user)
});

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrateur",
  BUYER: "Acheteur",
  SELLER: "Vendeur"
};
