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
import type { Product } from "@/lib/format";

export async function GET() {
  const products = await readProducts();
  return NextResponse.json(products);
}

async function ensureCategory(categoryName: string): Promise<void> {
  if (!categoryName) return;
  const categories = await readCategories();
  if (categories.some((c) => c.name.toLowerCase() === categoryName.toLowerCase())) return;
  const order = categories.length
    ? Math.max(...categories.map((c) => c.displayOrder ?? 0)) + 1
    : 1;
  const slugBase = slugify(categoryName) || `categoria-${order}`;
  let slug = slugBase;
  let n = 1;
  while (categories.some((c) => c.slug === slug)) {
    slug = `${slugBase}-${++n}`;
  }
  const cat: Category = { id: slug, name: categoryName, slug, displayOrder: order };
  await writeCategories([...categories, cat]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome do produto é obrigatório" }, { status: 400 });
  }

  let price: string;
  try {
    price = normalizePrice(body.price);
  } catch {
    return NextResponse.json({ error: "Preço inválido" }, { status: 400 });
  }

  const product_url_raw = String(body.product_url ?? "").trim();
  const product_url = product_url_raw || undefined;

  const products = await readProducts();

  if (product_url) {
    const duplicate = products.find(
      (p) => (p.product_url || "").trim().toLowerCase() === product_url.toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: `Já existe um produto com este link do Kabum: "${duplicate.name}"` },
        { status: 409 }
      );
    }
  }

  const taken = new Set(products.map((p) => p.slug));
  const slug = uniqueSlug(slugify(name), taken);
  const category = String(body.category ?? "").trim() || "Outras Marcas";

  const product: Product = {
    id: slug,
    slug,
    name,
    price,
    image: String(body.image ?? "").trim() || "/logo.png",
    category,
    badge: body.badge ? String(body.badge).trim() : undefined,
    description: body.description ? String(body.description).trim() : undefined,
    specs: body.specs && typeof body.specs === "object" ? body.specs : undefined,
    image_urls:
      Array.isArray(body.image_urls)
        ? body.image_urls.map((u: unknown) => String(u).trim()).filter(Boolean)
        : undefined,
    product_url,
  };

  await ensureCategory(category);

  products.push(product);
  const saved = await writeProducts(products);

  return NextResponse.json(
    {
      ...product,
      _meta: {
        storage_persisted: saved,
        storage_mode: saved ? "disk" : "memory_only",
        note: saved
          ? undefined
          : "Ambiente read-only (ex.: Vercel). Alterações ficam apenas na memória da instância atual até o próximo cold start.",
      },
    },
    { status: 201 }
  );
}
