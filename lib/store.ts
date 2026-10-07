import type { Product } from "@/lib/format";
import { getDb, getStorageInfo as dbStorageInfo, transaction } from "@/lib/db";

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

function readList<T>(table: "products" | "categories"): T[] {
  const rows = getDb()
    .prepare(`SELECT data FROM ${table} ORDER BY position ASC`)
    .all() as { data: string }[];
  const list: T[] = [];
  for (const row of rows) {
    try {
      list.push(JSON.parse(row.data) as T);
    } catch {
      /* ignora linha corrompida */
    }
  }
  return list;
}

function writeList<T extends { id: string }>(
  table: "products" | "categories",
  items: T[]
): boolean {
  try {
    transaction((db) => {
      db.exec(`DELETE FROM ${table}`);
      const insert = db.prepare(
        `INSERT OR REPLACE INTO ${table} (id, position, data) VALUES (?, ?, ?)`
      );
      items.forEach((item, index) => {
        insert.run(item.id, index, JSON.stringify(item));
      });
    });
    return dbStorageInfo().persistent;
  } catch (error) {
    console.error(`[store] falha ao gravar ${table}:`, error);
    throw error;
  }
}

export async function readProducts(): Promise<Product[]> {
  return readList<Product>("products");
}

export async function writeProducts(products: Product[]): Promise<boolean> {
  return writeList("products", products);
}

export async function readCategories(): Promise<Category[]> {
  const data = readList<Category>("categories");
  if (data.length === 0) return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  return data;
}

export async function writeCategories(categories: Category[]): Promise<boolean> {
  return writeList("categories", categories);
}

export function getStorageInfo(): { writable: boolean | null; dir: string } {
  const info = dbStorageInfo();
  return { writable: info.persistent, dir: info.dir };
}
