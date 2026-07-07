"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { AdminDashboard, Product, Shop } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

type AdminShop = Shop & {
  owner?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  productCount: number;
};

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");

  const loadAdminData = async () => {
    if (!token) {
      return;
    }

    const [dashboardData, shopsData, productsData] = await Promise.all([
      api.getAdminDashboard(token),
      api.getAdminShops(token),
      api.getAdminProducts(token)
    ]);

    setDashboard(dashboardData);
    setShops(shopsData as AdminShop[]);
    setProducts(productsData);
  };

  useEffect(() => {
    void loadAdminData();
  }, [token]);

  const updateShopStatus = async (shopId: string, status: "APPROVED" | "SUSPENDED" | "PENDING") => {
    if (!token) {
      return;
    }

    await api.updateAdminShopStatus(token, shopId, { status });
    setMessage("Statut boutique mis a jour.");
    await loadAdminData();
  };

  const updateProductStatus = async (productId: string, status: "PUBLISHED" | "SUSPENDED" | "DRAFT") => {
    if (!token) {
      return;
    }

    await api.updateAdminProductStatus(token, productId, { status });
    setMessage("Moderation produit mise a jour.");
    await loadAdminData();
  };

  if (!user || !token || user.role !== "ADMIN") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="panel">
          <SectionTitle
            eyebrow="Admin"
            title="Acces reserve a l'administration"
            description="Le dashboard admin pilote les comptes, les boutiques, les produits et les commandes."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="panel">
          <SectionTitle
            eyebrow="Pilotage"
            title="Vue d'ensemble de la marketplace"
            description="L'admin valide ou suspend les boutiques, modere les produits et suit les indicateurs de volumetrie."
          />
          {message ? <div className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</div> : null}
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { label: "Utilisateurs", value: dashboard?.userCount ?? 0 },
              { label: "Boutiques", value: dashboard?.shopCount ?? 0 },
              { label: "Produits", value: dashboard?.productCount ?? 0 },
              { label: "Commandes", value: dashboard?.orderCount ?? 0 }
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] bg-sand/70 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-ink/45">{item.label}</p>
                <p className="mt-3 text-4xl font-black text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <div className="panel">
            <SectionTitle eyebrow="Boutiques" title="Validation et suspension" />
            <div className="mt-6 space-y-4">
              {shops.map((shop) => (
                <div key={shop.id} className="rounded-[26px] border border-black/5 bg-sand/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-ink">{shop.name}</p>
                      <p className="text-sm text-ink/60">
                        {shop.owner?.firstName} {shop.owner?.lastName} · {shop.owner?.email}
                      </p>
                      <p className="text-sm text-ink/55">{shop.productCount} produit(s)</p>
                    </div>
                    <StatusBadge status={shop.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" className="secondary-button" onClick={() => updateShopStatus(shop.id, "APPROVED")}>
                      Approuver
                    </button>
                    <button type="button" className="secondary-button" onClick={() => updateShopStatus(shop.id, "SUSPENDED")}>
                      Suspendre
                    </button>
                    <button type="button" className="secondary-button" onClick={() => updateShopStatus(shop.id, "PENDING")}>
                      Remettre en attente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <SectionTitle eyebrow="Produits" title="Moderation du catalogue" />
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-[26px] border border-black/5 bg-sand/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-ink">{product.name}</p>
                      <p className="text-sm text-ink/60">
                        {product.shop?.name} · {product.category?.name}
                      </p>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" className="secondary-button" onClick={() => updateProductStatus(product.id, "PUBLISHED")}>
                      Publier
                    </button>
                    <button type="button" className="secondary-button" onClick={() => updateProductStatus(product.id, "SUSPENDED")}>
                      Suspendre
                    </button>
                    <button type="button" className="secondary-button" onClick={() => updateProductStatus(product.id, "DRAFT")}>
                      Brouillon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
