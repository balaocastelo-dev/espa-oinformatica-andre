import { DatabaseSync } from "node:sqlite";
import { accessSync, constants, mkdirSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Banco de dados interno do site (SQLite).
 *
 * Fica em um único arquivo dentro de DATA_DIR. Em produção (Coolify/Docker)
 * DATA_DIR aponta para um volume persistente, então produtos, pedidos,
 * configurações e fotos sobrevivem a reinícios e novos deploys.
 */

const SEED_DIR = path.join(process.cwd(), "data");

function isWritableDir(dir: string): boolean {
  try {
    mkdirSync(dir, { recursive: true });
    accessSync(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveDataDir(): { dir: string; persistent: boolean } {
  const configured = process.env.DATA_DIR?.trim();
  const preferred = configured
    ? path.resolve(configured)
    : path.join(process.cwd(), ".data");
  if (isWritableDir(preferred)) return { dir: preferred, persistent: true };

  // Hospedagem com disco somente-leitura (serverless): funciona, mas os dados
  // somem a cada reinício. Usado apenas como último recurso.
  const fallback = path.join(os.tmpdir(), "espaco-informatica-data");
  mkdirSync(fallback, { recursive: true });
  console.warn(
    `[db] "${preferred}" não é gravável. Usando "${fallback}" (NÃO persistente).`
  );
  return { dir: fallback, persistent: false };
}

type DbState = {
  db: DatabaseSync;
  dir: string;
  uploadsDir: string;
  persistent: boolean;
};

const globalRef = globalThis as unknown as { __espacoDb?: DbState };

function readSeed(file: string): string | null {
  try {
    const raw = readFileSync(path.join(SEED_DIR, file), "utf8");
    JSON.parse(raw);
    return raw;
  } catch {
    return null;
  }
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS kv (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id       TEXT PRIMARY KEY,
      position INTEGER NOT NULL,
      data     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id       TEXT PRIMARY KEY,
      position INTEGER NOT NULL,
      data     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at     TEXT NOT NULL,
      updated_at     TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'novo',
      customer_name  TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      note           TEXT NOT NULL DEFAULT '',
      items          TEXT NOT NULL,
      total_cents    INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
  `);

  // Pedidos começam em #1001 (fica mais apresentável para o cliente).
  const seq = db
    .prepare("SELECT seq FROM sqlite_sequence WHERE name = 'orders'")
    .get() as { seq: number } | undefined;
  if (!seq) {
    db.exec("INSERT INTO sqlite_sequence (name, seq) VALUES ('orders', 1000)");
  }
}

function seed(db: DatabaseSync): void {
  const seeded = db.prepare("SELECT value FROM kv WHERE key = 'seeded'").get();
  if (seeded) return;

  db.exec("BEGIN IMMEDIATE");
  try {
    const insertProduct = db.prepare(
      "INSERT OR IGNORE INTO products (id, position, data) VALUES (?, ?, ?)"
    );
    const insertCategory = db.prepare(
      "INSERT OR IGNORE INTO categories (id, position, data) VALUES (?, ?, ?)"
    );

    const productsRaw = readSeed("products.json");
    if (productsRaw) {
      const list = JSON.parse(productsRaw) as { id?: string }[];
      list.forEach((item, index) => {
        if (item && typeof item.id === "string") {
          insertProduct.run(item.id, index, JSON.stringify(item));
        }
      });
    }

    const categoriesRaw = readSeed("categories.json");
    if (categoriesRaw) {
      const list = JSON.parse(categoriesRaw) as { id?: string }[];
      list.forEach((item, index) => {
        if (item && typeof item.id === "string") {
          insertCategory.run(item.id, index, JSON.stringify(item));
        }
      });
    }

    const companyRaw = readSeed("company.json");
    if (companyRaw) {
      db.prepare("INSERT OR IGNORE INTO kv (key, value) VALUES ('company', ?)").run(
        companyRaw
      );
    }

    db.prepare("INSERT INTO kv (key, value) VALUES ('seeded', ?)").run(
      new Date().toISOString()
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function open(): DbState {
  const { dir, persistent } = resolveDataDir();
  const uploadsDir = path.join(dir, "uploads");
  mkdirSync(uploadsDir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "loja.db"));
  migrate(db);
  seed(db);
  return { db, dir, uploadsDir, persistent };
}

function state(): DbState {
  if (!globalRef.__espacoDb) globalRef.__espacoDb = open();
  return globalRef.__espacoDb;
}

export function getDb(): DatabaseSync {
  return state().db;
}

export function getUploadsDir(): string {
  return state().uploadsDir;
}

export function getStorageInfo(): { dir: string; persistent: boolean } {
  const s = state();
  return { dir: s.dir, persistent: s.persistent };
}

export function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(db);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function kvGet(key: string): string | null {
  const row = getDb().prepare("SELECT value FROM kv WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row ? row.value : null;
}

export function kvSet(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}
