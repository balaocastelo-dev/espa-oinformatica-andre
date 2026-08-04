import { readProducts } from "@/lib/store";
import type { Product } from "@/lib/format";

export async function getProducts(): Promise<Product[]> {
  return readProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await readProducts();
  return products.find((p) => p.slug === slug || p.id === slug) ?? null;
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const products = await readProducts();
  if (!category || category === "Todos os Produtos") return products;
  return products.filter((p) => p.category === category);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return await getProducts();
  const products = await readProducts();
  return products.filter((p) => {
    const haystack =
      `${p.name} ${p.category} ${p.description ?? ""}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await readProducts();
  return products.slice(0, limit);
}