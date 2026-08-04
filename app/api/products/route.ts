import { NextRequest, NextResponse } from "next/server";
import { readProducts, writeProducts } from "@/lib/store";
import { slugify, uniqueSlug } from "@/lib/slug";
import { normalizePrice } from "@/lib/format";
import type { Product } from "@/lib/format";

export async function GET() {
  const products = await readProducts();
  return NextResponse.json(products);
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

  const products = await readProducts();
  const taken = new Set(products.map((p) => p.slug));
  const slug = uniqueSlug(slugify(name), taken);

  const product: Product = {
    id: slug,
    slug,
    name,
    price,
    image: String(body.image ?? "").trim() || "/logo.png",
    category: String(body.category ?? "").trim() || "Outras Marcas",
    badge: body.badge ? String(body.badge).trim() : undefined,
    description: body.description ? String(body.description).trim() : undefined,
    specs: body.specs && typeof body.specs === "object" ? body.specs : undefined,
    image_urls:
      Array.isArray(body.image_urls)
        ? body.image_urls.map((u: unknown) => String(u).trim()).filter(Boolean)
        : undefined,
    product_url: body.product_url ? String(body.product_url).trim() || undefined : undefined,
  };

  products.push(product);
  await writeProducts(products);

  return NextResponse.json(product, { status: 201 });
}
