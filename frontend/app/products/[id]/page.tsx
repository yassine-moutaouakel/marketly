"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusBadge";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      const data = await api.getProduct(params.id, token);
      setProduct(data);
    };

    void loadProduct();
  }, [params.id, token]);

  const handleAddToCart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await api.addCartItem(token, {
        productId: params.id,
        quantity: 1
      });
      setMessage("Produit ajoute au panier.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d'ajouter ce produit.");
    }
  };

  if (!product) {
    return <section className="mx-auto max-w-6xl px-4 py-20">Chargement du produit...</section>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-card">
          <img
            src={product.images[0]?.url || "https://placehold.co/1000x700?text=Marketly"}
            alt={product.name}
            className="h-full min-h-[420px] w-full object-cover"
          />
        </div>

        <div className="panel">
          <div className="flex items-center gap-3">
            <StatusBadge status={product.status} />
            {product.shop ? <StatusBadge status={product.shop.status} /> : null}
          </div>
          <h1 className="mt-6 text-4xl font-black text-ink">{product.name}</h1>
          <p className="mt-4 text-base text-ink/70">{product.description}</p>

          <div className="mt-8 grid gap-4 rounded-[26px] bg-sand/70 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Prix</p>
              <p className="mt-2 text-3xl font-black text-ember">{product.price.toFixed(2)} EUR</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Categorie</p>
              <p className="mt-2 text-lg font-semibold">{product.category?.name || "Non renseignee"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Stock</p>
              <p className="mt-2 text-lg font-semibold">{product.stock} unite(s)</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-sm text-ink/65">Boutique: {product.shop?.name || "Marketly"}</p>
            {message ? <div className="rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</div> : null}
            <button type="button" className="primary-button" onClick={handleAddToCart}>
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
