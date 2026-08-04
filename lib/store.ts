import { promises as fs } from "node:fs";
import path from "node:path";
import type { Product } from "@/lib/format";

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");

export const FALLBACK_CATEGORY = "Outras Marcas";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "apple", name: "Apple", slug: "apple", displayOrder: 1 },
  { id: "dell", name: "Dell", slug: "dell", displayOrder: 2 },
  { id: "hp", name: "HP", slug: "hp", displayOrder: 3 },
  { id: "lenovo", name: "Lenovo", slug: "lenovo", displayOrder: 4 },
  { id: "outras-marcas", name: "Outras Marcas", slug: "outras-marcas", displayOrder: 5 },
];

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function readProducts(): Promise<Product[]> {
  return readJson<Product[]>(PRODUCTS_FILE, []);
}

export function writeProducts(products: Product[]): Promise<void> {
  return writeJson(PRODUCTS_FILE, products);
}

export async function readCategories(): Promise<Category[]> {
  const categories = await readJson<Category[]>(CATEGORIES_FILE, []);
  if (categories.length === 0) return DEFAULT_CATEGORIES;
  return categories;
}

export function writeCategories(categories: Category[]): Promise<void> {
  return writeJson(CATEGORIES_FILE, categories);
}
