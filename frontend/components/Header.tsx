"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "./AuthProvider";

const navItems = [
  { href: "/", label: "Catalogue" },
  { href: "/cart", label: "Panier" },
  { href: "/dashboard", label: "Mon espace" }
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-sand/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-lg font-black text-sand shadow-card">
            M
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.3em] text-ink/60">Marketly</p>
            <p className="text-sm text-ink/70">Marketplace multi-vendeurs RNCP</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                pathname === item.href
                  ? "bg-ink text-sand"
                  : "text-ink/70 hover:bg-white hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
          {user?.role === "SELLER" || user?.role === "ADMIN" ? (
            <Link
              href="/dashboard/seller"
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                pathname === "/dashboard/seller"
                  ? "bg-pine text-white"
                  : "text-ink/70 hover:bg-white hover:text-ink"
              )}
            >
              Espace vendeur
            </Link>
          ) : null}
          {user?.role === "ADMIN" ? (
            <Link
              href="/dashboard/admin"
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                pathname === "/dashboard/admin"
                  ? "bg-ember text-white"
                  : "text-ink/70 hover:bg-white hover:text-ink"
              )}
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden rounded-full bg-white px-4 py-2 text-sm text-ink/80 shadow-sm sm:block">
                {user.firstName} {user.lastName} · {user.role}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
