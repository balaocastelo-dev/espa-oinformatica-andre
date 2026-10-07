import { DatabaseSync } from "node:sqlite";
import { accessSync, constants, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Banco SQLite local — usado quando o site roda em servidor próprio (Docker)
 * ou em desenvolvimento. Na Vercel o armazenamento é o Vercel Blob
 * (ver lib/storage.ts).
 */

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

  // Disco somente-leitura (serverless sem armazenamento configurado):
  // funciona, mas os dados somem a cada reinício.
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

function open(): DbState {
  const { dir, persistent } = resolveDataDir();
  const uploadsDir = path.join(dir, "uploads");
  mkdirSync(uploadsDir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "loja.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS kv (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
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

export function getDbInfo(): { dir: string; persistent: boolean } {
  const s = state();
  return { dir: s.dir, persistent: s.persistent };
}
