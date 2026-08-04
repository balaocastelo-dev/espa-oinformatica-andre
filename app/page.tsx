import Link from "next/link";
import {
  Cpu,
  Download,
  Headphones,
  MonitorCheck,
  ShieldCheck,
  Truck,
  Wrench,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, searchProducts } from "@/lib/products";
import { readCategories } from "@/lib/store";
import { readCompanySettings } from "@/lib/company";

type SearchParams = Promise<{ search?: string; category?: string }>;

export async function generateMetadata() {
  return { title: "Catálogo" };
}

const serviceIcons = [
  PackageCheck,
  Wrench,
  Cpu,
  Headphones,
  MonitorCheck,
  Truck,
];

export default async function Home(props: { searchParams: SearchParams }) {
  const sp = await props.searchParams;
  const search = sp.search?.trim() ?? "";
  const category = sp.category?.trim() ?? "";
  const company = await readCompanySettings();

  let products = search
    ? await searchProducts(search)
    : await getProductsByCategory(category);
  const categories = await readCategories();
  products = products.sort(
    (a, b) =>
      Number(a.price.replace(/\D/g, "")) - Number(b.price.replace(/\D/g, ""))
  );

  const heading = search
    ? `Resultados para "${search}"`
    : category
      ? category
      : "Catálogo de Produtos";

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-14 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-300">
              <ShieldCheck size={14} />
              {company.heroBadge}
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {company.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
              {company.heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(
                  company.heroWhatsappMessage
                )}`}
                target="_blank"
                rel="noreferrer"
                className="balao-cta-pulse inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
              >
                <MessageCircle size={18} />
                {company.heroWhatsappLabel}
              </a>
              <a
                href="#catalogo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100"
              >
                {company.catalogButtonLabel}
                <Download size={16} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {company.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5"
              >
                <div className="text-2xl font-black sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="catalogo"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:py-12"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E60012]">
              Catálogo
            </span>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {products.length} produto{products.length === 1 ? "" : "s"} disponíve
              {products.length === 1 ? "l" : "is"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !category && !search
                ? "bg-[#E60012] text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#E60012]"
            }`}
          >
            Todos
          </Link>
          {categories.map((c) => {
              const active = category === c.name && !search;
              return (
                <Link
                  key={c.id}
                  href={`/?category=${encodeURIComponent(c.name)}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-[#E60012] text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#E60012]"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-16">
            <p className="text-lg font-medium text-slate-600">
              Nenhum produto encontrado.
            </p>
            <Link
              href="/"
              className="mt-3 inline-block rounded-full bg-[#E60012] px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section id="servicos" className="scroll-mt-20 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E60012]">
              Nossos serviços
            </span>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {company.servicesTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
              {company.servicesDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {company.services.map((service, index) => {
              const Icon = serviceIcons[index] ?? PackageCheck;
              return (
                <div
                  key={service.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#E60012] hover:shadow-md sm:p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#E60012]">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{service.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="rounded-3xl bg-gradient-to-r from-red-700 to-red-950 p-8 text-center text-white sm:p-10 lg:p-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            {company.ctaTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-red-100">
            {company.ctaDescription}
          </p>
          <a
            href={`https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(
              company.whatsappDefaultMessage
            )}`}
            target="_blank"
            rel="noreferrer"
            className="balao-cta-pulse mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-bold text-white"
          >
            <MessageCircle size={18} />
            {company.ctaButtonLabel}
          </a>
        </div>
      </section>
    </div>
  );
}
