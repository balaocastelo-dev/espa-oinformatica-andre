import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: "Espaço da Informática | Notebooks Seminovos e Assistência Técnica em Campinas",
    template: "%s | Espaço da Informática",
  },
  description:
    "Há mais de 15 anos, referência em notebooks seminovos com procedência, qualidade e garantia de 6 meses. Venda, manutenção, upgrade e suporte técnico em Campinas - SP.",
  keywords: [
    "notebooks seminovos campinas",
    "assistência técnica informática campinas",
    "manutenção de notebook campinas",
    "upgrade ssd campinas",
    "computadores campinas",
    "espaço da informática",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <CartProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}