"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { SectionTitle } from "@/components/SectionTitle";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "buyer@marketly.dev",
    password: "Buyer123!"
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="panel">
        <SectionTitle
          eyebrow="Connexion"
          title="Acceder a votre espace Marketly"
          description="Utilisez les comptes de seed pour demontrer les parcours buyer, seller et admin."
        />

        <div className="mt-8 rounded-[24px] bg-sand/80 p-5 text-sm text-ink/70">
          <p>Buyer: `buyer@marketly.dev / Buyer123!`</p>
          <p>Seller: `seller@marketly.dev / Seller123!`</p>
          <p>Admin: `admin@marketly.dev / Admin123!`</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="field"
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
          {error ? <p className="text-sm text-ember">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </section>
  );
}
