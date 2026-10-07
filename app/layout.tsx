import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CompanyProvider from "@/context/CompanyContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { readCompanySettings } from "@/lib/company";
import { absoluteUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const company = await readCompanySettings();
  const base = await siteUrl();
  const title = `${company.name} | Notebooks Seminovos e Assistência Técnica em ${company.city}`;
  return {
    metadataBase: new URL(base),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: company.name,
      title,
      description: company.heroDescription,
      images: [absoluteUrl(base, company.logoPath)],
    },
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
  const base = await siteUrl();

  // Dados estruturados da loja (ajuda o Google a mostrar endereço, telefone e horário).
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "ComputerStore",
    name: company.name,
    description: company.tagline,
    url: base,
    image: absoluteUrl(base, company.logoPath),
    telephone: `+${company.whatsappNumber}`,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: company.city,
      addressRegion: company.region,
      postalCode: company.postalCode,
      addressCountry: "BR",
    },
    sameAs: [company.instagramUrl].filter(Boolean),
  };

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c"),
          }}
        />
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
