import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CompanyProvider from "@/context/CompanyContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { readCompanySettings } from "@/lib/company";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const company = await readCompanySettings();
  return {
    title: {
      default: `${company.name} | Notebooks Seminovos e Assistência Técnica em ${company.city}`,
      template: `%s | ${company.name}`,
    },
    description: company.heroDescription,
    keywords: [
      "notebooks seminovos",
      "assistência técnica",
      "manutenção de notebook",
      "upgrade ssd",
      "computadores",
      company.name,
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const company = await readCompanySettings();

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <CompanyProvider settings={company}>
          <CartProvider>
            <Suspense fallback={null}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer company={company} />
          </CartProvider>
        </CompanyProvider>
      </body>
    </html>
  );
}
