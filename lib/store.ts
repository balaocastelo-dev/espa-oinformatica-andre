import { readFileSync } from "node:fs";
import path from "node:path";
import type { Product } from "@/lib/format";
import { getStorageInfo as storageInfo, readDoc, updateDoc } from "@/lib/storage";

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export const FALLBACK_CATEGORY = "Outras Marcas";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "apple", name: "Apple", slug: "apple", displayOrder: 1 },
  { id: "dell", name: "Dell", slug: "dell", displayOrder: 2 },
  { id: "hp", name: "HP", slug: "hp", displayOrder: 3 },
  { id: "lenovo", name: "Lenovo", slug: "lenovo", displayOrder: 4 },
  { id: "outras-marcas", name: "Outras Marcas", slug: "outras-marcas", displayOrder: 5 },
];

/**
 * Catálogo inicial (data/*.json): vale enquanto nada foi gravado no
 * armazenamento. A partir da primeira alteração pelo painel, só o
 * armazenamento é usado.
 */
const seedCache = new Map<string, unknown>();

export function readSeed<T>(file: string, fallback: T): T {
  if (!seedCache.has(file)) {
    try {
      const raw = readFileSync(path.join(process.cwd(), "data", file), "utf8");
      seedCache.set(file, JSON.parse(raw));
    } catch {
      seedCache.set(file, fallback);
    }
  }
  return structuredClone(seedCache.get(file)) as T;
}

export type ReadOptions = { fresh?: boolean };

export async function readProducts(options: ReadOptions = {}): Promise<Product[]> {
  const doc = await readDoc<Product[]>("products", options);
  if (Array.isArray(doc.value)) return structuredClone(doc.value);
  return readSeed<Product[]>("products.json", []);
}

export async function writeProducts(products: Product[]): Promise<boolean> {
  await updateDoc<Product[], null>("products", () => ({ value: products, result: null }));
  return (await storageInfo()).persistent;
}

export async function readCategories(options: ReadOptions = {}): Promise<Category[]> {
  const doc = await readDoc<Category[]>("categories", options);
  const data = Array.isArray(doc.value)
    ? structuredClone(doc.value)
    : readSeed<Category[]>("categories.json", []);
  if (data.length === 0) return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  return data;
}

export async function writeCategories(categories: Category[]): Promise<boolean> {
  await updateDoc<Category[], null>("categories", () => ({
    value: categories,
    result: null,
  }));
  return (await storageInfo()).persistent;
}
