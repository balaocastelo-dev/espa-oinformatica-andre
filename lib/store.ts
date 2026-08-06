import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import type { Product } from "@/lib/format";

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

const DATA_DIR_SRC = path.join(process.cwd(), "data");
const PRODUCTS_FILE_SRC = path.join(DATA_DIR_SRC, "products.json");
const CATEGORIES_FILE_SRC = path.join(DATA_DIR_SRC, "categories.json");

const TMP_DIR =
  process.env.NODE_ENV === "production"
    ? (() => {
        const candidates = ["/tmp", process.env.TMPDIR, process.env.TEMP].filter(
          Boolean
        ) as string[];
        return candidates[0] || DATA_DIR_SRC;
      })()
    : DATA_DIR_SRC;

const WRITABLE_DIR = TMP_DIR || DATA_DIR_SRC;
const PRODUCTS_FILE_RW = path.join(WRITABLE_DIR, "products.json");
const CATEGORIES_FILE_RW = path.join(WRITABLE_DIR, "categories.json");

export const FALLBACK_CATEGORY = "Outras Marcas";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "apple", name: "Apple", slug: "apple", displayOrder: 1 },
  { id: "dell", name: "Dell", slug: "dell", displayOrder: 2 },
  { id: "hp", name: "HP", slug: "hp", displayOrder: 3 },
  { id: "lenovo", name: "Lenovo", slug: "lenovo", displayOrder: 4 },
  { id: "outras-marcas", name: "Outras Marcas", slug: "outras-marcas", displayOrder: 5 },
];

type MemCache<T> = {
  value: T | null;
  writtenAt: number;
  fsPath: string | null;
  fsMtime: number | null;
};

const cacheProducts: MemCache<Product[]> = {
  value: null,
  writtenAt: 0,
  fsPath: null,
  fsMtime: null,
};

const cacheCategories: MemCache<Category[]> = {
  value: null,
  writtenAt: 0,
  fsPath: null,
  fsMtime: null,
};

let filesystemWritable: boolean | null = null;

async function isFsWritable(): Promise<boolean> {
  if (filesystemWritable !== null) return filesystemWritable;
  try {
    await fs.mkdir(WRITABLE_DIR, { recursive: true });
    const probe = path.join(WRITABLE_DIR, ".write_probe");
    await fs.writeFile(probe, "ok", "utf8");
    await fs.unlink(probe);
    filesystemWritable = true;
  } catch {
    filesystemWritable = WRITABLE_DIR === DATA_DIR_SRC ? false : false;
    try {
      await fs.mkdir(WRITABLE_DIR, { recursive: true });
      const probe = path.join(WRITABLE_DIR, ".write_probe_2");
      await fs.writeFile(probe, "ok", "utf8");
      await fs.unlink(probe);
      filesystemWritable = true;
    } catch {
      filesystemWritable = false;
    }
  }
  return filesystemWritable;
}

async function getMtime(file: string): Promise<number | null> {
  try {
    const st = await fs.stat(file);
    return st.mtimeMs;
  } catch {
    return null;
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function ensureWritableBase(): Promise<void> {
  try {
    await fs.mkdir(WRITABLE_DIR, { recursive: true });
  } catch {
    /* noop */
  }
}

function syncSrcToRwPath(srcFile: string, rwFile: string): string | null {
  if (srcFile === rwFile) return null;
  return rwFile;
}

async function resolveReadFile<T>(
  srcFile: string,
  rwFile: string,
  fallback: T,
  cache: MemCache<T>
): Promise<T> {
  const tryRw = syncSrcToRwPath(srcFile, rwFile);
  let chosenPath = srcFile;
  let data: T = fallback;
  let mtime: number | null = null;
  const rwMtime = tryRw ? await getMtime(tryRw) : null;
  const srcMtime = await getMtime(srcFile);

  if (tryRw && rwMtime !== null && (srcMtime === null || rwMtime >= srcMtime)) {
    chosenPath = tryRw;
    data = await readJson<T>(tryRw, fallback);
    mtime = rwMtime;
  } else {
    chosenPath = srcFile;
    data = await readJson<T>(srcFile, fallback);
    mtime = srcMtime;
  }

  if (
    cache.value &&
    cache.fsPath === chosenPath &&
    cache.fsMtime === mtime &&
    Array.isArray(data) &&
    Array.isArray(cache.value) &&
    data.length === cache.value.length
  ) {
    return cache.value;
  }

  cache.value = data;
  cache.fsPath = chosenPath;
  cache.fsMtime = mtime;
  return data;
}

async function writeJson(file: string, data: unknown): Promise<boolean> {
  const writable = await isFsWritable();
  if (!writable) return false;
  try {
    await ensureWritableBase();
    await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function readProducts(): Promise<Product[]> {
  return resolveReadFile<Product[]>(
    PRODUCTS_FILE_SRC,
    PRODUCTS_FILE_RW,
    [],
    cacheProducts
  );
}

export async function writeProducts(products: Product[]): Promise<boolean> {
  cacheProducts.value = products;
  cacheProducts.writtenAt = Date.now();
  cacheProducts.fsPath = PRODUCTS_FILE_RW;
  cacheProducts.fsMtime = Date.now();
  return writeJson(PRODUCTS_FILE_RW, products);
}

export async function readCategories(): Promise<Category[]> {
  const data = await resolveReadFile<Category[]>(
    CATEGORIES_FILE_SRC,
    CATEGORIES_FILE_RW,
    [],
    cacheCategories
  );
  if (data.length === 0) return DEFAULT_CATEGORIES;
  return data;
}

export async function writeCategories(categories: Category[]): Promise<boolean> {
  cacheCategories.value = categories;
  cacheCategories.writtenAt = Date.now();
  cacheCategories.fsPath = CATEGORIES_FILE_RW;
  cacheCategories.fsMtime = Date.now();
  return writeJson(CATEGORIES_FILE_RW, categories);
}

export function getStorageInfo(): { writable: boolean | null; dir: string } {
  return { writable: filesystemWritable, dir: WRITABLE_DIR };
}
