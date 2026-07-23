"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { api, type PaginationMeta } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const loadInitialData = async () => {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);

      setProducts(productsData.data);
      setMeta(productsData.meta);
      setCategories(categoriesData);
      setLoading(false);
    };

    void loadInitialData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      try {
        const productsData = await api.getProducts({
          search: deferredSearch,
          categoryId,
          minPrice: priceMin,
          maxPrice: priceMax,
          page
        });
        setProducts(productsData.data);
        setMeta(productsData.meta);
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [categoryId, deferredSearch, page, priceMax, priceMin]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, deferredSearch, priceMax, priceMin]);

  const handleAddToCart = async (productId: string) => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await api.addCartItem(token, {
        productId,
        quantity: 1
      });
      setFeedback("Produit ajoute au panier.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible d'ajouter ce produit.");
    }
  };

  return (
    <div className="pb-20">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[36px] bg-ink px-8 py-10 text-sand shadow-card">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.36em] text-gold">
              Bloc 02 Ynov
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              La marketplace multi-vendeurs qui melange catalogue, boutique et pilotage admin.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-sand/75 sm:text-lg">
              Marketly centralise le parcours buyer, seller et admin avec authentification JWT,
              commandes multi-boutiques, paiements Stripe test et supervision metier.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catalogue" className="rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink">
                Explorer le catalogue
              </a>
              <a href="/dashboard" className="rounded-full border border-sand/15 px-5 py-3 text-sm font-semibold">
                Voir mon espace
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { label: "Utilisateurs", value: "3 roles" },
              { label: "Paniers et commandes", value: "Flux complet" },
              { label: "Paiement test", value: "Stripe Checkout" }
            ].map((item, index) => (
              <div
                key={item.label}
                className="animate-reveal rounded-[30px] border border-black/5 bg-white p-6 shadow-card"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className="text-sm uppercase tracking-[0.24em] text-ink/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-pine">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="panel">
          <SectionTitle
            eyebrow="Catalogue"
            title="Recherche, filtres et produits vedettes"
            description="Le buyer peut consulter les produits publics, filtrer par categorie ou budget et envoyer des articles dans son panier."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <input
              id="catalogue-search"
              name="search"
              type="search"
              aria-label="Rechercher un produit"
              className="field md:col-span-2"
              placeholder="Rechercher un produit, une ambiance, une categorie..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              id="catalogue-category"
              name="categoryId"
              aria-label="Filtrer par categorie"
              className="field"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">Toutes les categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                id="catalogue-price-min"
                name="minPrice"
                type="number"
                min="0"
                aria-label="Prix minimum en euros"
                className="field"
                placeholder="Min"
                value={priceMin}
                onChange={(event) => setPriceMin(event.target.value)}
              />
              <input
                id="catalogue-price-max"
                name="maxPrice"
                type="number"
                min="0"
                aria-label="Prix maximum en euros"
                className="field"
                placeholder="Max"
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
              />
            </div>
          </div>

          {feedback ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine"
            >
              {feedback}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[420px] animate-pulse rounded-[28px] bg-white/60" />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 ? (
            <nav
              className="mt-10 flex items-center justify-center gap-4"
              aria-label="Pagination du catalogue"
            >
              <button
                type="button"
                className="secondary-button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={meta.page <= 1 || loading}
              >
                Page precedente
              </button>
              <p aria-live="polite" className="text-sm text-ink/70">
                Page {meta.page} sur {meta.totalPages} — {meta.total} produits
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
                disabled={meta.page >= meta.totalPages || loading}
              >
                Page suivante
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </div>
  );
}
