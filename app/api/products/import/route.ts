import { NextRequest, NextResponse } from "next/server";
import { readProducts, writeProducts } from "@/lib/store";
import { slugify, uniqueSlug } from "@/lib/slug";
import { formatPrice } from "@/lib/format";
import {
  fetchKabumGallery,
  highRes,
  kabumIdFromImage,
  kabumIdFromUrl,
  parsePriceText,
  parseTsv,
} from "@/lib/kabum";
import type { Product } from "@/lib/format";

const BRANDS = [
  { match: /apple|macbook/i, name: "Apple" },
  { match: /dell/i, name: "Dell" },
  { match: /hp|compaq|elitebook|zbook|pavilion/i, name: "HP" },
  { match: /lenovo|thinkpad|thinkbook|ideapad/i, name: "Lenovo" },
];

function brandOf(name: string): string {
  for (const b of BRANDS) if (b.match.test(name)) return b.name;
  return "Outras Marcas";
}

function extractSpecs(name: string): Record<string, string> {
  const specs: Record<string, string> = {};
  const storage = name.match(/SSD[\s-]*(\d+\s*(?:gb|tb)[a-z ]*)/i) || name.match(/SSD[\s-]*(\d+)/i);
  if (storage) specs["Armazenamento"] = `SSD ${storage[1].trim().replace(/\s+/g, " ").toUpperCase()}`;
  const ram =
    name.match(/(\d+)\s*(?:gb)\s*(?:ram|mem|ddr\d*|de mem|memoria)/i) ||
    name.match(/(\d+)\s*gb\s+\d+\s*(?:gb|ssd)/i);
  if (ram) specs["Memória"] = `${ram[1]}GB`;
  const tela = name.match(/Tela\s*([\d,."]+)/i);
  if (tela) specs["Tela"] = `${tela[1].replace(/["]/g, "")}"`;
  const gpu = name.match(
    /RTX\s*\d+\s*[a-z0-9]*|GTX\s*\d+\s*[a-z0-9]*|Vega\s*\d+|Radeon\s*[a-z0-9]+|Nvidia\s*[a-zA-Z0-9]+|Intel\s*[a-zA-Z0-9 ]*UHD|Iris\s*Xe/i
  );
  if (gpu) specs["Placa de Vídeo"] = gpu[0].trim();
  const cpu = name.match(/Core\s*i\d[\w-]*|Ryzen\s*\d[\w\s]*|Apple\s*M\d|Intel\s*Celeron|Core\s*[iI]-?\d/i);
  if (cpu) specs["Processador"] = cpu[0].trim();
  return specs;
}

function makeDescription(name: string): string {
  const used = /usado|recondicionado|seminovo/i.test(name);
  return used
    ? "Equipamento seminovo revisado e testado por nossa equipe, pronto para uso. Procedência verificada, garantia inclusa e suporte técnico em Campinas."
    : "Produto novo com procedência garantida. Consulte disponibilidade, retirada e entrega direto com nossa equipe em Campinas.";
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : parseTsv(String(body.text ?? ""));
  if (!rawItems.length) {
    return NextResponse.json(
      { error: "Nenhum item encontrado. Cole o conteúdo com as colunas: URL do produto, URL da imagem, Nome, Preço" },
      { status: 400 }
    );
  }

  const products = await readProducts();
  const existingKeys = new Set(products.map((p) => p.product_url || "").filter(Boolean));
  const takenSlugs = new Set(products.map((p) => p.slug));

  const toImport = rawItems.filter((item: Record<string, unknown>) => {
    const url = String(item?.url ?? "").trim();
    if (url && existingKeys.has(url)) return false;
    return true;
  });

  if (!toImport.length) {
    return NextResponse.json(
      { imported: 0, skipped: rawItems.length, error: "Todos os itens já existem no catálogo" },
      { status: 200 }
    );
  }

  const enriched = await mapWithConcurrency(toImport, 4, async (item: Record<string, unknown>) => {
    const name = String(item.name ?? "").replace(/\s+/g, " ").replace(/^\s*-\s*/, "").trim();
    const image = String(item.image ?? "").trim();
    const url = String(item.url ?? "").trim() || undefined;
    const productId = kabumIdFromUrl(url || "") || kabumIdFromImage(image);
    const info = productId ? await fetchKabumGallery(productId) : null;

    return { name, image, url, productId, info };
  });

  const newProducts: Product[] = [];
  let enrichedCount = 0;

  for (const item of toImport) {
    const name = String(item.name ?? "").replace(/\s+/g, " ").replace(/^\s*-\s*/, "").trim();
    if (!name) continue;

    const rawPrice = parsePriceText(item.price);
    if (!rawPrice) continue;

    const slug = uniqueSlug(slugify(name), takenSlugs);
    takenSlugs.add(slug);

    const isUsed = /usado|recondicionado|seminovo/i.test(name);
    const badge = /recondicionado/i.test(name)
      ? "Recondicionado"
      : isUsed
        ? "Seminovo"
        : undefined;

    const found = enriched.find((e) => e.name === name);
    const gallery = found?.info?.gallery ?? [];
    if (gallery.length) enrichedCount++;

    newProducts.push({
      id: slug,
      slug,
      name,
      price: formatPrice(rawPrice),
      image: gallery[0] || highRes(String(item.image ?? "")) || String(item.image ?? "").trim() || "/logo.png",
      category: brandOf(name),
      badge,
      description: makeDescription(name),
      specs: extractSpecs(name),
      ...(gallery.length > 1 ? { image_urls: gallery } : {}),
      ...(found?.url ? { product_url: found.url } : {}),
    });
  }

  if (!newProducts.length) {
    return NextResponse.json({ imported: 0, skipped: rawItems.length }, { status: 200 });
  }

  products.push(...newProducts);
  await writeProducts(products);

  return NextResponse.json({
    imported: newProducts.length,
    skipped: rawItems.length - newProducts.length,
    total: products.length,
    enriched: enrichedCount,
  });
}