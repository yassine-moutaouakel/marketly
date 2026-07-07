import Link from "next/link";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-card transition duration-300 hover:-translate-y-1">
      <div className="relative h-60 overflow-hidden bg-gradient-to-br from-mist to-white">
        <img
          src={product.images[0]?.url || "https://placehold.co/600x400?text=Marketly"}
          alt={product.images[0]?.alt || product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
          {product.category?.name || "Produit"}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-xl font-bold text-ink">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-ink/65">{product.description}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ink/40">Prix</p>
            <p className="text-2xl font-black text-ember">{product.price.toFixed(2)} EUR</p>
          </div>
          <div className="text-right text-sm text-ink/50">
            <p>Stock: {product.stock}</p>
            <p>{product.shop?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 rounded-full border border-ink/10 px-4 py-3 text-center text-sm font-semibold text-ink transition hover:bg-sand"
          >
            Voir le produit
          </Link>
          <button
            type="button"
            onClick={() => onAddToCart?.(product.id)}
            className="rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}
