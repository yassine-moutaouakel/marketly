import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketly",
  description: "Marketplace multi-vendeurs realisee pour le Bloc 02 Ynov."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-sand">
            <a
              href="#contenu-principal"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-sand"
            >
              Aller au contenu principal
            </a>
            <Header />
            <main id="contenu-principal">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
