import { NextRequest, NextResponse } from "next/server";
import { readProducts, writeProducts } from "@/lib/store";
import { normalizePrice, youtubeIdFromUrl } from "@/lib/format";
import type { Product } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, props: Params) {
  const { id } = await props.params;
  const body = await request.json();
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const name = String(body.name ?? products[index].name).trim();
  if (!name) {
    return NextResponse.json({ error: "Nome do produto é obrigatório" }, { status: 400 });
  }

  let price: string;
  try {
    price = normalizePrice(body.price ?? products[index].price);
  } catch {
    return NextResponse.json({ error: "Preço inválido" }, { status: 400 });
  }

  const prev = products[index];

  let installment_price: string | undefined = prev.installment_price;
  if (body.installment_price !== undefined) {
    const raw = String(body.installment_price).trim();
    if (raw === "") {
      installment_price = undefined;
    } else {
      try {
        installment_price = normalizePrice(raw);
      } catch {
        return NextResponse.json(
          { error: "Valor do parcelamento inválido" },
          { status: 400 }
        );
      }
    }
  }

  const installment_text =
    body.installment_text !== undefined
      ? String(body.installment_text).trim() || undefined
      : prev.installment_text;

  let youtube_url: string | undefined = prev.youtube_url;
  if (body.youtube_url !== undefined) {
    const raw = String(body.youtube_url).trim();
    const yid = youtubeIdFromUrl(raw);
    youtube_url = yid ? `https://www.youtube.com/watch?v=${yid}` : undefined;
  }

  const updated: Product = {
    ...prev,
    name,
    price,
    image: String(body.image ?? prev.image).trim() || "/logo.png",
    category: String(body.category ?? prev.category).trim() || "Outras Marcas",
    badge: body.badge !== undefined ? String(body.badge).trim() || undefined : prev.badge,
    description:
      body.description !== undefined
        ? String(body.description).trim() || undefined
        : prev.description,
    specs:
      body.specs !== undefined && typeof body.specs === "object"
        ? body.specs
        : prev.specs,
    image_urls:
      body.image_urls !== undefined
        ? Array.isArray(body.image_urls)
          ? body.image_urls.map((u: unknown) => String(u).trim()).filter(Boolean)
          : undefined
        : prev.image_urls,
    product_url:
      body.product_url !== undefined
        ? String(body.product_url).trim() || undefined
        : prev.product_url,
    installment_price,
    installment_text,
    youtube_url,
  };

  products[index] = updated;
  const saved = await writeProducts(products);

  return NextResponse.json({
    ...updated,
    _meta: {
      storage_persisted: saved,
      storage_mode: saved ? "disk" : "memory_only",
    },
  });
}

export async function DELETE(_request: NextRequest, props: Params) {
  const { id } = await props.params;
  const products = await readProducts();
  const filtered = products.filter((p) => p.id !== id && p.slug !== id);
  if (filtered.length === products.length) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  const saved = await writeProducts(filtered);
  return NextResponse.json({
    success: true,
    storage_persisted: saved,
    storage_mode: saved ? "disk" : "memory_only",
  });
}
