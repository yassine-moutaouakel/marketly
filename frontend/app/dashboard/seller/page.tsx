"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Category, Order, Product, Shop } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

export default function SellerDashboardPage() {
  const { token, user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [shopForm, setShopForm] = useState({
    name: "Studio Marketly",
    description: "Boutique de demonstration pour le Bloc 02",
    logoUrl: "",
    bannerUrl: ""
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "49.90",
    stock: "10",
    imageUrls: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  });

  const loadSellerData = async () => {
    if (!token) {
      return;
    }

    const [categoriesData, productsData, ordersData] = await Promise.all([
      api.getCategories(),
      api.getSellerProducts(token),
      api.getSellerOrders(token)
    ]);

    setCategories(categoriesData);
    setProducts(productsData);
    setOrders(ordersData);

    try {
      const shopData = await api.getSellerShop(token);
      setShop(shopData);
      setShopForm({
        name: shopData.name,
        description: shopData.description || "",
        logoUrl: shopData.logoUrl || "",
        bannerUrl: shopData.bannerUrl || ""
      });
    } catch {
      setShop(null);
    }
  };

  useEffect(() => {
    void loadSellerData();
  }, [token]);

  const saveShop = async () => {
    if (!token) {
      return;
    }

    const shopData = shop
      ? await api.updateSellerShop(token, shopForm)
      : await api.createSellerShop(token, shopForm);

    setShop(shopData);
    setMessage(shop ? "Boutique mise a jour." : "Boutique creee.");
    await loadSellerData();
  };

  const createProduct = async () => {
    if (!token) {
      return;
    }

    await api.createProduct(token, {
      name: productForm.name,
      description: productForm.description,
      categoryId: productForm.categoryId,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      imageUrls: productForm.imageUrls.split(",").map((value) => value.trim()).filter(Boolean)
    });

    setProductForm({
      name: "",
      description: "",
      categoryId: categories[0]?.id || "",
      price: "49.90",
      stock: "10",
      imageUrls: ""
    });
    setMessage("Produit cree.");
    await loadSellerData();
  };

  const deleteProduct = async (productId: string) => {
    if (!token) {
      return;
    }

    await api.deleteProduct(token, productId);
    setMessage("Produit supprime.");
    await loadSellerData();
  };

  const updateOrderStatus = async (orderId: string, status: "SHIPPED" | "DELIVERED" | "CANCELLED") => {
    if (!token) {
      return;
    }

    await api.updateOrderStatus(token, orderId, { status });
    setMessage("Statut de commande mis a jour.");
    await loadSellerData();
  };

  if (!user || !token || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="panel">
          <SectionTitle
            eyebrow="Espace vendeur"
            title="Acces reserve aux vendeurs"
            description="Connectez-vous avec un compte seller ou admin pour administrer une boutique."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <div className="panel">
            <SectionTitle
              eyebrow="Boutique"
              title={shop ? "Modifier la boutique" : "Creer votre boutique"}
              description="La boutique demarre en attente de validation admin, puis permet de publier les produits."
            />
            {message ? <div className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</div> : null}
            <div className="mt-6 grid gap-4">
              <input
                className="field"
                placeholder="Nom de la boutique"
                value={shopForm.name}
                onChange={(event) => setShopForm((current) => ({ ...current, name: event.target.value }))}
              />
              <textarea
                className="field min-h-32"
                placeholder="Description"
                value={shopForm.description}
                onChange={(event) => setShopForm((current) => ({ ...current, description: event.target.value }))}
              />
              <input
                className="field"
                placeholder="Logo URL"
                value={shopForm.logoUrl}
                onChange={(event) => setShopForm((current) => ({ ...current, logoUrl: event.target.value }))}
              />
              <input
                className="field"
                placeholder="Banniere URL"
                value={shopForm.bannerUrl}
                onChange={(event) => setShopForm((current) => ({ ...current, bannerUrl: event.target.value }))}
              />
              {shop ? <StatusBadge status={shop.status} /> : null}
              <button type="button" className="primary-button" onClick={saveShop}>
                {shop ? "Mettre a jour la boutique" : "Creer la boutique"}
              </button>
            </div>
          </div>

          <div className="panel">
            <SectionTitle eyebrow="Produits" title="Ajouter un nouveau produit" />
            <div className="mt-6 grid gap-4">
              <input
                className="field"
                placeholder="Nom du produit"
                value={productForm.name}
                onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              />
              <textarea
                className="field min-h-32"
                placeholder="Description complete"
                value={productForm.description}
                onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <select
                  className="field"
                  value={productForm.categoryId}
                  onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}
                >
                  <option value="">Choisir une categorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  placeholder="Prix"
                  value={productForm.price}
                  onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                />
              </div>
              <textarea
                className="field min-h-28"
                placeholder="URLs d'images, separees par des virgules"
                value={productForm.imageUrls}
                onChange={(event) => setProductForm((current) => ({ ...current, imageUrls: event.target.value }))}
              />
              <button type="button" className="secondary-button" onClick={createProduct}>
                Creer le produit
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="panel">
            <SectionTitle eyebrow="Catalogue vendeur" title="Produits publies et brouillons" />
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-4 rounded-[26px] border border-black/5 bg-sand/50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-ink">{product.name}</p>
                    <p className="mt-2 text-sm text-ink/60">{product.category?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={product.status} />
                    <span className="text-sm font-semibold text-ink/65">{product.price.toFixed(2)} EUR</span>
                    <button type="button" className="secondary-button" onClick={() => deleteProduct(product.id)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <SectionTitle eyebrow="Commandes recues" title="Suivi des commandes par vendeur" />
            <div className="mt-6 space-y-4">
              {orders.length ? (
                orders.map((order) => (
                  <div key={order.id} className="rounded-[26px] border border-black/5 bg-sand/50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold">Commande {order.id}</p>
                        <p className="text-sm text-ink/55">
                          Total: {order.total.toFixed(2)} EUR · Paiement {order.paymentStatus}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" className="secondary-button" onClick={() => updateOrderStatus(order.id, "SHIPPED")}>
                        Marquer expediee
                      </button>
                      <button type="button" className="secondary-button" onClick={() => updateOrderStatus(order.id, "DELIVERED")}>
                        Marquer livree
                      </button>
                      <button type="button" className="secondary-button" onClick={() => updateOrderStatus(order.id, "CANCELLED")}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-black/10 bg-white/60 p-8 text-center text-ink/55">
                  Aucune commande recue pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
