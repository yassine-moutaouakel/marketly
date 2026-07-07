"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";
import { api } from "@/lib/api";
import type { Address, Cart, Profile } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

export default function CartPage() {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCartData = async () => {
    if (!token) {
      return;
    }

    const [cartData, profileData] = await Promise.all([api.getCart(token), api.getProfile(token)]);
    setCart(cartData);
    setProfile(profileData);

    const defaultAddress = profileData.addresses.find((address) => address.isDefault) || profileData.addresses[0];
    setSelectedAddressId(defaultAddress?.id || "");
  };

  useEffect(() => {
    const paymentState = new URLSearchParams(window.location.search).get("payment");
    if (paymentState === "cancelled") {
      setMessage("Le paiement a ete annule.");
    }
  }, []);

  useEffect(() => {
    void loadCartData();
  }, [token]);

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!token) {
      return;
    }

    const data = await api.updateCartItem(token, productId, { quantity });
    setCart(data);
  };

  const removeItem = async (productId: string) => {
    if (!token) {
      return;
    }

    const data = await api.removeCartItem(token, productId);
    setCart(data);
  };

  const handleCheckout = async () => {
    if (!token || !selectedAddressId) {
      setMessage("Ajoutez puis selectionnez une adresse avant de payer.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const orders = await api.checkoutOrders(token, {
        addressId: selectedAddressId
      });
      const session = await api.createCheckoutSession(token, {
        orderIds: orders.map((order) => order.id)
      });

      if (session.url) {
        window.location.href = session.url;
        return;
      }

      setMessage("Commandes creees, mais aucune URL Stripe n'a ete retournee.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de lancer le paiement.");
    } finally {
      setBusy(false);
    }
  };

  if (!user || !token) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="panel">
          <SectionTitle
            eyebrow="Panier"
            title="Connectez-vous pour acceder a votre panier"
            description="Le panier est protege par JWT et rattache au compte buyer."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel">
          <SectionTitle
            eyebrow="Panier"
            title="Verifier vos articles avant validation"
            description="Le checkout transforme le panier en commandes par boutique, puis ouvre Stripe Checkout en mode test."
          />

          <div className="mt-8 space-y-4">
            {cart?.items.length ? (
              cart.items.map((item) => (
                <div key={item.id} className="grid gap-4 rounded-[26px] border border-black/5 bg-sand/50 p-4 md:grid-cols-[120px_1fr_auto]">
                  <img
                    src={item.product.images[0]?.url || "https://placehold.co/200x200?text=Marketly"}
                    alt={item.product.name}
                    className="h-28 w-full rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-ink">{item.product.name}</h3>
                    <p className="mt-2 text-sm text-ink/65">{item.product.description}</p>
                    <p className="mt-3 text-sm text-ink/55">{item.product.shop?.name}</p>
                  </div>
                  <div className="flex min-w-[180px] flex-col justify-between gap-3">
                    <p className="text-right text-2xl font-black text-ember">{item.subtotal.toFixed(2)} EUR</p>
                    <div className="flex items-center gap-2">
                      <input
                        className="field"
                        type="number"
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
                      />
                      <button type="button" className="secondary-button" onClick={() => removeItem(item.product.id)}>
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-black/10 bg-white/70 p-8 text-center text-ink/55">
                Votre panier est vide.
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <SectionTitle
            eyebrow="Paiement"
            title="Choisir l'adresse et payer"
            description="Le total est calcule sur le backend, puis signe via Stripe."
          />

          <div className="mt-8 space-y-4">
            <select
              className="field"
              value={selectedAddressId}
              onChange={(event) => setSelectedAddressId(event.target.value)}
            >
              <option value="">Selectionner une adresse</option>
              {profile?.addresses.map((address: Address) => (
                <option key={address.id} value={address.id}>
                  {address.label} - {address.line1}, {address.city}
                </option>
              ))}
            </select>

            <div className="rounded-[24px] bg-sand/70 p-5">
              <div className="flex items-center justify-between text-sm text-ink/60">
                <span>Articles</span>
                <span>{cart?.totals.itemCount || 0}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-ink">Total</span>
                <span className="text-3xl font-black text-ember">
                  {(cart?.totals.total || 0).toFixed(2)} EUR
                </span>
              </div>
            </div>

            {message ? <div className="rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">{message}</div> : null}
            <button type="button" className="primary-button w-full" disabled={busy || !cart?.items.length} onClick={handleCheckout}>
              {busy ? "Creation de la session Stripe..." : "Valider et payer"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
