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

        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="register-firstname">
              Prenom
            </label>
            <input
              id="register-firstname"
              name="firstName"
              className="field"
              autoComplete="given-name"
              required
              aria-required="true"
              placeholder="Prenom"
              value={form.firstName}
              onChange={(event) =>
                setForm((current) => ({ ...current, firstName: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="register-lastname">
              Nom
            </label>
            <input
              id="register-lastname"
              name="lastName"
              className="field"
              autoComplete="family-name"
              required
              aria-required="true"
              placeholder="Nom"
              value={form.lastName}
              onChange={(event) =>
                setForm((current) => ({ ...current, lastName: event.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="register-email">
              Adresse email
            </label>
            <input
              id="register-email"
              name="email"
              className="field"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "register-error" : undefined}
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="register-password">
              Mot de passe
            </label>
            <input
              id="register-password"
              name="password"
              className="field"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              aria-describedby="register-password-hint"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <p id="register-password-hint" className="mt-1 text-xs text-ink/60">
              8 caracteres minimum, avec au moins une majuscule et un chiffre.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="register-role">
              Type de compte
            </label>
            <select
              id="register-role"
              name="role"
              className="field"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="BUYER">Acheteur</option>
              <option value="SELLER">Vendeur</option>
            </select>
          </div>
          {error ? (
            <p id="register-error" role="alert" className="text-sm text-ember md:col-span-2">
              {error}
            </p>
          ) : null}
          <button type="submit" className="primary-button md:col-span-2" disabled={loading}>
            {loading ? "Creation..." : "Creer mon compte"}
          </button>
        </form>
      </div>
    </section>
  );
}
