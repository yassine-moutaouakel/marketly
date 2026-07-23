import type {
  Address,
  AdminDashboard,
  ApiResponse,
  AuthPayload,
  Cart,
  Category,
  Order,
  Product,
  Profile,
  Shop,
  User
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
  const url = new URL(`${API_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

async function apiRequest<T>(path: string, init?: RequestInit, token?: string | null): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<ApiResponse<T>> & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload.data as T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function apiRequestWithMeta<T>(
  path: string,
  init?: RequestInit,
  token?: string | null
): Promise<{ data: T; meta?: PaginationMeta }> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<ApiResponse<T>> & {
    message?: string;
    meta?: PaginationMeta;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return { data: payload.data as T, meta: payload.meta };
}

export const api = {
  register: (body: Record<string, unknown>) =>
    apiRequest<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  login: (body: Record<string, unknown>) =>
    apiRequest<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  me: (token: string) => apiRequest<User>("/auth/me", undefined, token),

  getProducts: (params?: Record<string, string | number | boolean | undefined>) =>
    apiRequestWithMeta<Product[]>(`/products${params ? `?${new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)])
    )}` : ""}`),

  getProduct: (productId: string, token?: string | null) =>
    apiRequest<Product>(`/products/${productId}`, undefined, token),

  getCategories: () => apiRequest<Category[]>("/categories"),

  getProfile: (token: string) => apiRequest<Profile>("/profile", undefined, token),

  updateProfile: (token: string, body: Record<string, unknown>) =>
    apiRequest<User>("/profile", {
      method: "PUT",
      body: JSON.stringify(body)
    }, token),

  createAddress: (token: string, body: Record<string, unknown>) =>
    apiRequest<Address>("/addresses", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),

  getCart: (token: string) => apiRequest<Cart>("/cart", undefined, token),

  addCartItem: (token: string, body: Record<string, unknown>) =>
    apiRequest<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),

  updateCartItem: (token: string, productId: string, body: Record<string, unknown>) =>
    apiRequest<Cart>(`/cart/items/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),

  removeCartItem: (token: string, productId: string) =>
    apiRequest<Cart>(`/cart/items/${productId}`, {
      method: "DELETE"
    }, token),

  checkoutOrders: (token: string, body: Record<string, unknown>) =>
    apiRequest<Order[]>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),

  getMyOrders: (token: string) => apiRequest<Order[]>("/orders/my", undefined, token),

  getSellerOrders: (token: string) => apiRequest<Order[]>("/orders/received", undefined, token),

  updateOrderStatus: (token: string, orderId: string, body: Record<string, unknown>) =>
    apiRequest<Order>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),

  createCheckoutSession: (token: string, body: Record<string, unknown>) =>
    apiRequest<{ sessionId: string; url: string | null }>("/payments/checkout-session", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),

  getSellerShop: (token: string) => apiRequest<Shop>("/shops/me", undefined, token),

  createSellerShop: (token: string, body: Record<string, unknown>) =>
    apiRequest<Shop>("/shops", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),

  updateSellerShop: (token: string, body: Record<string, unknown>) =>
    apiRequest<Shop>("/shops/me", {
      method: "PUT",
      body: JSON.stringify(body)
    }, token),

  getSellerProducts: (token: string) =>
    apiRequest<Product[]>("/products/seller/mine", undefined, token),

  createProduct: (token: string, body: Record<string, unknown>) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(body)
    }, token),

  deleteProduct: (token: string, productId: string) =>
    apiRequest<{ deleted: boolean }>(`/products/${productId}`, {
      method: "DELETE"
    }, token),

  getAdminDashboard: (token: string) => apiRequest<AdminDashboard>("/admin/dashboard", undefined, token),

  getAdminShops: (token: string) =>
    apiRequest<Array<Shop & { owner?: User; productCount: number }>>("/admin/shops", undefined, token),

  updateAdminShopStatus: (token: string, shopId: string, body: Record<string, unknown>) =>
    apiRequest<Shop>(`/admin/shops/${shopId}/status`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token),

  getAdminProducts: (token: string) =>
    apiRequest<Product[]>("/admin/products", undefined, token),

  updateAdminProductStatus: (token: string, productId: string, body: Record<string, unknown>) =>
    apiRequest<Product>(`/admin/products/${productId}/status`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }, token)
};
