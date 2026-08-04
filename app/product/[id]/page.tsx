import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, ExternalLink, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { getProductBySlug, getProductsByCategory } from "@/lib/products";
import { parsePriceToNumber } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";
import { readCompanySettings } from "@/lib/company";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = await getProductBySlug(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  const company = await readCompanySettings();
  const price = parsePriceToNumber(product.price);
  const related = (await getProductsByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#E60012]">
          Início
        </Link>
        <ChevronRight size={12} />
        <Link
          href={`/?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[#E60012]"
        >
          {product.category}
        </Link>
        <ChevronRight size={12} />
        <span className="min-w-0 max-w-full line-clamp-1 text-slate-800">
          {product.name}
        </span>
      </nav>

      <div className="mt-6 grid gap-6 sm:gap-8 lg:grid-cols-2">
        <div>
          <ProductGallery product={product} />

          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#E60012]"
            >
              <ExternalLink size={14} />
              Ver anúncio original do produto
            </a>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E60012]">
            {product.category}
          </span>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">
              {product.price}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              ou 10x de R$ {(price / 10).toFixed(2)} sem juros
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              Garantia de {product.specs?.["Garantia"] ?? "6 meses"}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Equipamento revisado e testado
            </li>
            <li className="flex items-center gap-2">
              <Truck size={16} className="text-emerald-600" />
              Retirada na loja ou entrega em Campinas e região
            </li>
          </ul>

          <ProductActions product={product} />

          <a
            href={`https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(
              `Olá! Tenho interesse no produto: ${product.name} (${product.price})`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#128C7E]"
          >
            <MessageCircle size={18} />
            Comprar pelo WhatsApp
          </a>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
          <h2 className="text-lg font-black">Especificações</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {Object.entries(product.specs).map(([key, value]) => (
              <div
                key={key}
                className="flex min-w-0 justify-between gap-4 border-b border-slate-100 pb-2"
              >
                <dt className="text-sm text-slate-500">{key}</dt>
                <dd className="min-w-0 break-words text-right text-sm font-semibold text-slate-800">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-black">Produtos relacionados</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
