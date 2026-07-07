"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const { token, user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [addressForm, setAddressForm] = useState({
    label: "Domicile",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "France",
    isDefault: true
  });

  const loadProfile = async () => {
    if (!token) {
      return;
    }

    const data = await api.getProfile(token);
    setProfile(data);
    setProfileForm({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || ""
    });
  };

  useEffect(() => {
    void loadProfile();
  }, [token]);

  const saveProfile = async () => {
    if (!token) {
      return;
    }

    await api.updateProfile(token, profileForm);
    await refreshUser();
    await loadProfile();
    setMessage("Profil mis a jour.");
  };

  const createAddress = async () => {
    if (!token) {
      return;
    }

    await api.createAddress(token, addressForm);
    await loadProfile();
    setMessage("Adresse ajoutee.");
  };

  if (!user || !token) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="panel">
          <SectionTitle
            eyebrow="Mon espace"
            title="Connectez-vous pour gerer votre compte"
            description="Le dashboard buyer consolide profil, adresses et historique des commandes."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div className="panel">
            <SectionTitle eyebrow="Profil" title="Mettre a jour vos informations" />
            <div className="mt-6 grid gap-4">
              <input
                className="field"
                value={profileForm.firstName}
                onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))}
              />
              <input
                className="field"
                value={profileForm.lastName}
                onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))}
              />
              <input
                className="field"
                value={profileForm.phone}
                placeholder="Telephone"
                onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
              />
              {message ? <div className="rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</div> : null}
              <button type="button" className="primary-button" onClick={saveProfile}>
                Enregistrer
              </button>
            </div>
          </div>

          <div className="panel">
            <SectionTitle eyebrow="Adresses" title="Ajouter une adresse de livraison" />
            <div className="mt-6 grid gap-4">
              <input
                className="field"
                placeholder="Label"
                value={addressForm.label}
                onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
              />
              <input
                className="field"
                placeholder="Adresse"
                value={addressForm.line1}
                onChange={(event) => setAddressForm((current) => ({ ...current, line1: event.target.value }))}
              />
              <input
                className="field"
                placeholder="Complement"
                value={addressForm.line2}
                onChange={(event) => setAddressForm((current) => ({ ...current, line2: event.target.value }))}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <input
                  className="field"
                  placeholder="Ville"
                  value={addressForm.city}
                  onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Code postal"
                  value={addressForm.postalCode}
                  onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Pays"
                  value={addressForm.country}
                  onChange={(event) => setAddressForm((current) => ({ ...current, country: event.target.value }))}
                />
              </div>
              <button type="button" className="secondary-button" onClick={createAddress}>
                Ajouter l'adresse
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {profile?.addresses.map((address) => (
                <div key={address.id} className="rounded-[24px] border border-black/5 bg-sand/50 p-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-ink">{address.label}</h3>
                    {address.isDefault ? <StatusBadge status="DEFAULT" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-ink/65">
                    {address.line1}, {address.city}, {address.postalCode}, {address.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <SectionTitle
            eyebrow="Historique"
            title="Suivre les commandes buyer"
            description="Le dashboard centralise les commandes passees, leurs statuts et l'etat de paiement."
          />

          <div className="mt-8 space-y-4">
            {profile?.orderHistory.length ? (
              profile.orderHistory.map((order) => (
                <div key={order.id} className="rounded-[26px] border border-black/5 bg-sand/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-ink">{order.shop?.name || "Boutique"}</p>
                      <p className="text-sm text-ink/55">Commande {order.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-ink/65">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.name} x {item.quantity} - {item.price.toFixed(2)} EUR
                      </p>
                    ))}
                  </div>
                  <p className="mt-4 text-right text-xl font-black text-ember">{order.total.toFixed(2)} EUR</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-black/10 bg-white/60 p-8 text-center text-ink/50">
                Aucune commande pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
