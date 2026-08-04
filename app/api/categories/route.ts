import { NextRequest, NextResponse } from "next/server";
import { readCategories, writeCategories } from "@/lib/store";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/store";

export async function GET() {
  const categories = await readCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome da categoria é obrigatório" }, { status: 400 });
  }

  const categories = await readCategories();
  if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: "Já existe uma categoria com esse nome" }, { status: 409 });
  }

  const maxOrder = categories.reduce((max, c) => Math.max(max, c.displayOrder), 0);
  const category: Category = {
    id: slugify(name) || `categoria-${Date.now()}`,
    name,
    slug: slugify(name),
    displayOrder: maxOrder + 1,
  };
  if (categories.some((c) => c.id === category.id)) {
    category.id = `${category.id}-${Date.now()}`;
  }

  categories.push(category);
  await writeCategories(categories);

  return NextResponse.json(category, { status: 201 });
}
