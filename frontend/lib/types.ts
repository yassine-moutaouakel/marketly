export type UserRole = "BUYER" | "SELLER" | "ADMIN";
export type ShopStatus = "PENDING" | "APPROVED" | "SUSPENDED";
export type ProductStatus = "DRAFT" | "PUBLISHED" | "SUSPENDED";
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: ShopStatus;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string | null;
  price: number;
  priceInCents: number;
  stock: number;
  isFeatured: boolean;
  status: ProductStatus;
  images: ProductImage[];
  category: Category | null;
  shop: Shop | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  subtotal: number;
  subtotalInCents: number;
  product: Product;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  totals: {
    itemCount: number;
    total: number;
    totalInCents: number;
  };
}

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  price: number;
  priceInCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  total: number;
  totalInCents: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  shippingSnapshot: Record<string, unknown>;
  notes: string | null;
  shop?: Shop;
  buyer?: User;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends User {
  addresses: Address[];
  shop: Shop | null;
  orderHistory: Order[];
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface AdminDashboard {
  userCount: number;
  shopCount: number;
  productCount: number;
  orderCount: number;
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}
