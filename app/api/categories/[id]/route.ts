import { NextRequest, NextResponse } from "next/server";
import {
  FALLBACK_CATEGORY,
  readCategories,
  readProducts,
  writeCategories,
  writeProducts,
} from "@/lib/store";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, props: Params) {
  const { id } = await props.params;
  const body = await request.json();
  const categories = await readCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  const name = String(body.name ?? category.name).trim();
  if (!name) {
    return NextResponse.json({ error: "Nome da categoria é obrigatório" }, { status: 400 });
  }

  const duplicate = categories.find(
    (c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return NextResponse.json({ error: "Já existe uma categoria com esse nome" }, { status: 409 });
  }

  const oldName = category.name;
  const renamed: typeof category = { ...category, name, slug: slugify(name) };
  categories[categories.indexOf(category)] = renamed;
  const savedCats = await writeCategories(categories);

  let savedProducts = true;
  if (oldName !== name) {
    const products = await readProducts();
    let changed = false;
    for (const product of products) {
      if (product.category === oldName) {
        product.category = name;
        changed = true;
      }
    }
    if (changed) savedProducts = await writeProducts(products);
  }

  return NextResponse.json({
    ...renamed,
    _meta: {
      storage_persisted: savedCats && savedProducts,
      storage_mode: savedCats && savedProducts ? "disk" : "memory_only",
    },
  });
}

export async function DELETE(_request: NextRequest, props: Params) {
  const { id } = await props.params;
  const categories = await readCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  const savedCats = await writeCategories(categories.filter((c) => c.id !== id));

  const products = await readProducts();
  let changed = false;
  for (const product of products) {
    if (product.category === category.name) {
      product.category = FALLBACK_CATEGORY;
      changed = true;
    }
  }
  let savedProducts = true;
  if (changed) savedProducts = await writeProducts(products);

  return NextResponse.json({
    success: true,
    storage_persisted: savedCats && savedProducts,
    storage_mode: savedCats && savedProducts ? "disk" : "memory_only",
  });
}
