import { NextRequest, NextResponse } from "next/server";
import {
  readProducts,
  writeProducts,
  readCategories,
  writeCategories,
  type Category,
} from "@/lib/store";
import { slugify, uniqueSlug } from "@/lib/slug";
import { normalizePrice } from "@/lib/format";
import {
  fetchKabumGallery,
  highRes,
  kabumIdFromImage,
  kabumIdFromUrl,
  parsePriceText,
  parseTsv,
} from "@/lib/kabum";
import type { Product } from "@/lib/format";

export const runtime = "nodejs";

// O enriquecimento (baixar galeria do Kabum) é "best-effort": se demorar
// demais, os itens restantes são importados mesmo assim com a imagem original.
const ENRICH_TIMEOUT_MS = 40_000;

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

async function ensureCategories(categoryNames: string[]): Promise<void> {
  if (!categoryNames.length) return;
  const categories = await readCategories();
  const existing = new Set(categories.map((c) => c.name.toLowerCase()));
  const toAdd: Category[] = [];
  let order = categories.length
    ? Math.max(...categories.map((c) => c.displayOrder ?? 0)) + 1
    : 1;
  for (const name of categoryNames) {
    if (!name || existing.has(name.toLowerCase())) continue;
    const slugName = slugify(name) || `categoria-${order}`;
    let slug = slugName;
    let n = 1;
    while (categories.some((c) => c.slug === slug) || toAdd.some((c) => c.slug === slug)) {
      slug = `${slugName}-${++n}`;
    }
    toAdd.push({
      id: slug,
      name,
      slug,
      displayOrder: order++,
    });
    existing.add(name.toLowerCase());
  }
  if (toAdd.length) {
    await writeCategories([...categories, ...toAdd]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
    }

    const rawItems = Array.isArray(body.items)
      ? (body.items as Record<string, unknown>[])
      : parseTsv(String(body.text ?? ""));
    if (!rawItems.length) {
      return NextResponse.json(
        { error: "Nenhum item encontrado. Cole o conteúdo com as colunas: URL do produto, URL da imagem, Nome, Preço" },
        { status: 400 }
      );
    }

    const products = await readProducts();
    const existingKeys = new Set(
      products.map((p) => (p.product_url || "").trim().toLowerCase()).filter(Boolean)
    );
    const takenSlugs = new Set(products.map((p) => p.slug));

    const batchSeenUrls = new Set<string>();
    const toImport = rawItems.filter((item: Record<string, unknown>) => {
      const url = String(item?.url ?? "").trim();
      if (url) {
        const urlKey = url.toLowerCase();
        if (existingKeys.has(urlKey)) return false;
        if (batchSeenUrls.has(urlKey)) return false;
        batchSeenUrls.add(urlKey);
      }
      return true;
    });

    if (!toImport.length) {
      return NextResponse.json(
        { imported: 0, skipped: rawItems.length, error: "Todos os itens já existem no catálogo" },
        { status: 200 }
      );
    }

    const deadline = Date.now() + ENRICH_TIMEOUT_MS;

    type EnrichedItem = {
      name: string;
      image: string;
      url: string | undefined;
      priceRaw: string | number | undefined;
      info: Awaited<ReturnType<typeof fetchKabumGallery>>;
    };

    const enriched: EnrichedItem[] = await mapWithConcurrency(
      toImport,
      4,
      async (item: Record<string, unknown>) => {
        const name = String(item.name ?? "")
          .replace(/\s+/g, " ")
          .replace(/^\s*-\s*/, "")
          .trim();
        const image = String(item.image ?? "").trim();
        const url = String(item.url ?? "").trim() || undefined;
        const rawPrice = item.price;
        const priceRaw: string | number | undefined =
          typeof rawPrice === "string" || typeof rawPrice === "number" ? rawPrice : undefined;
        if (Date.now() >= deadline) return { name, image, url, priceRaw, info: null };
        const productId = kabumIdFromUrl(url || "") || kabumIdFromImage(image);
        const info = productId ? await fetchKabumGallery(productId) : null;
        return { name, image, url, priceRaw, info };
      }
    );

    const newProducts: Product[] = [];
    let enrichedCount = 0;
    const skippedItems: string[] = [];
    const categorySet = new Set<string>();

    for (let i = 0; i < toImport.length; i++) {
      const e = enriched[i];
      if (!e) continue;

      const name = e.name;
      if (!name) {
        skippedItems.push(`Linha ${i + 1}: nome vazio`);
        continue;
      }

      let price: string;
      try {
        const raw = parsePriceText(
          typeof e.priceRaw === "string" || typeof e.priceRaw === "number" ? e.priceRaw : ""
        );
        if (!raw) throw new Error("preço zero ou inválido");
        price = normalizePrice(raw);
      } catch {
        skippedItems.push(`"${name}": preço inválido`);
        continue;
      }

      const slug = uniqueSlug(slugify(name), takenSlugs);
      takenSlugs.add(slug);

      const isUsed = /usado|recondicionado|seminovo/i.test(name);
      const badge = /recondicionado/i.test(name)
        ? "Recondicionado"
        : isUsed
          ? "Seminovo"
          : undefined;

      const gallery = e.info?.gallery ?? [];
      if (gallery.length) enrichedCount++;

      const category = brandOf(name);
      categorySet.add(category);

      newProducts.push({
        id: slug,
        slug,
        name,
        price,
        image:
          gallery[0] ||
          highRes(e.image) ||
          e.image ||
          "/logo.png",
        category,
        badge,
        description: makeDescription(name),
        specs: extractSpecs(name),
        ...(gallery.length > 1 ? { image_urls: gallery } : {}),
        ...(e.url ? { product_url: e.url } : {}),
      });
    }

    const skippedCount = rawItems.length - newProducts.length;

    if (!newProducts.length) {
      return NextResponse.json(
        {
          imported: 0,
          skipped: skippedCount,
          skippedDetails: skippedItems.length ? skippedItems : undefined,
        },
        { status: 200 }
      );
    }

    await ensureCategories(Array.from(categorySet));

    products.push(...newProducts);
    await writeProducts(products);

    return NextResponse.json({
      imported: newProducts.length,
      skipped: skippedCount,
      skippedDetails: skippedItems.length ? skippedItems : undefined,
      total: products.length,
      enriched: enrichedCount,
    });
  } catch (error) {
    console.error("Erro ao importar produtos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno ao importar produtos" },
      { status: 500 }
    );
  }
}
