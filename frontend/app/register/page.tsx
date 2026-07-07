"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { SectionTitle } from "@/components/SectionTitle";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "BUYER"
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="panel">
        <SectionTitle
          eyebrow="Inscription"
          title="Creer un compte buyer ou seller"
          description="Le compte admin est fourni par les seeds. Buyer et seller peuvent s'inscrire depuis l'interface."
        />

        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="field"
            placeholder="Prenom"
            value={form.firstName}
            onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
          />
          <input
            className="field"
            placeholder="Nom"
            value={form.lastName}
            onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
          />
          <input
            className="field md:col-span-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="field"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <select
            className="field"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="BUYER">Acheteur</option>
            <option value="SELLER">Vendeur</option>
          </select>
          {error ? <p className="text-sm text-ember md:col-span-2">{error}</p> : null}
          <button type="submit" className="primary-button md:col-span-2" disabled={loading}>
            {loading ? "Creation..." : "Creer mon compte"}
          </button>
        </form>
      </div>
    </section>
  );
}
