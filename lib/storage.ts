import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Camada de armazenamento do site.
 *
 * Dois modos, escolhidos automaticamente:
 *  - "blob":   Vercel Blob (quando o projeto na Vercel tem um Blob store
 *              conectado). É o modo de produção na Vercel.
 *  - "sqlite": arquivo SQLite + pasta de uploads em DATA_DIR (servidor
 *              próprio/Docker e desenvolvimento local).
 *
 * Tudo é guardado como "documentos" JSON (produtos, categorias, empresa,
 * pedidos) com controle de concorrência por ETag, mais os arquivos de imagem.
 */

export class ConflictError extends Error {}

export type DocRead<T> = { value: T | null; etag: string | null };

export type StoredFile = { buffer: Buffer; contentType: string };

interface Backend {
  readonly kind: "blob" | "sqlite";
  readonly persistent: boolean;
  read<T>(key: string): Promise<DocRead<T>>;
  /** etag === null: o documento não pode existir ainda. Lança ConflictError. */
  write(key: string, value: unknown, etag: string | null): Promise<void>;
  saveFile(name: string, bytes: Uint8Array, contentType: string): Promise<void>;
  readFile(name: string): Promise<StoredFile | null>;
}

/* ------------------------------ Vercel Blob ------------------------------ */

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function createBlobBackend(): Backend {
  const docPath = (key: string) => `dados/${key}.json`;
  const filePath = (name: string) => `uploads/${name}`;

  async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    return Buffer.from(await new Response(stream).arrayBuffer());
  }

  return {
    kind: "blob",
    persistent: true,

    async read<T>(key: string): Promise<DocRead<T>> {
      const { get } = await import("@vercel/blob");
      // useCache: false -> lê direto da origem, sempre a versão mais recente.
      const result = await get(docPath(key), { access: "private", useCache: false });
      if (!result || result.statusCode !== 200) return { value: null, etag: null };
      const text = (await streamToBuffer(result.stream)).toString("utf8");
      return { value: JSON.parse(text) as T, etag: result.blob.etag };
    },

    async write(key: string, value: unknown, etag: string | null): Promise<void> {
      const { put, BlobPreconditionFailedError } = await import("@vercel/blob");
      try {
        await put(docPath(key), JSON.stringify(value), {
          access: "private",
          contentType: "application/json",
          addRandomSuffix: false,
          cacheControlMaxAge: 60,
          ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
        });
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) throw new ConflictError();
        if (!etag) {
          // Criação recusada: se o documento já existe, foi outra requisição
          // que o criou ao mesmo tempo -> tratar como conflito e tentar de novo.
          const { get } = await import("@vercel/blob");
          const existing = await get(docPath(key), {
            access: "private",
            useCache: false,
          }).catch(() => null);
          if (existing) throw new ConflictError();
        }
        throw error;
      }
    },

    async saveFile(name: string, bytes: Uint8Array, contentType: string): Promise<void> {
      const { put } = await import("@vercel/blob");
      await put(filePath(name), Buffer.from(bytes), {
        access: "private",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    },

    async readFile(name: string): Promise<StoredFile | null> {
      const { get } = await import("@vercel/blob");
      const result = await get(filePath(name), { access: "private" });
      if (!result || result.statusCode !== 200) return null;
      return {
        buffer: await streamToBuffer(result.stream),
        contentType: result.blob.contentType,
      };
    },
  };
}

/* --------------------------------- SQLite -------------------------------- */

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

async function createSqliteBackend(): Promise<Backend> {
  const { getDb, getDbInfo, getUploadsDir } = await import("@/lib/db");
  const etagOf = (text: string) => createHash("sha1").update(text).digest("hex");

  return {
    kind: "sqlite",
    persistent: getDbInfo().persistent,

    async read<T>(key: string): Promise<DocRead<T>> {
      const row = getDb().prepare("SELECT value FROM kv WHERE key = ?").get(key) as
        | { value: string }
        | undefined;
      if (!row) return { value: null, etag: null };
      return { value: JSON.parse(row.value) as T, etag: etagOf(row.value) };
    },

    async write(key: string, value: unknown, etag: string | null): Promise<void> {
      const db = getDb();
      const text = JSON.stringify(value);
      db.exec("BEGIN IMMEDIATE");
      try {
        const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as
          | { value: string }
          | undefined;
        const current = row ? etagOf(row.value) : null;
        if (current !== etag) throw new ConflictError();
        db.prepare(
          "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
        ).run(key, text);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },

    async saveFile(name: string, bytes: Uint8Array): Promise<void> {
      await fs.writeFile(
        path.join(/* turbopackIgnore: true */ getUploadsDir(), name),
        bytes
      );
    },

    async readFile(name: string): Promise<StoredFile | null> {
      try {
        const filePath = path.join(/* turbopackIgnore: true */ getUploadsDir(), name);
        const buffer = await fs.readFile(/* turbopackIgnore: true */ filePath);
        const extension = name.split(".").pop()?.toLowerCase() ?? "";
        return {
          buffer,
          contentType: CONTENT_TYPES[extension] ?? "application/octet-stream",
        };
      } catch {
        return null;
      }
    },
  };
}

/* ------------------------------ API pública ------------------------------ */

const globalRef = globalThis as unknown as {
  __espacoBackend?: Promise<Backend>;
  __espacoDocCache?: Map<string, { value: unknown; etag: string | null; at: number }>;
};

function backend(): Promise<Backend> {
  if (!globalRef.__espacoBackend) {
    globalRef.__espacoBackend = blobConfigured()
      ? Promise.resolve(createBlobBackend())
      : createSqliteBackend();
  }
  return globalRef.__espacoBackend;
}

function cache() {
  if (!globalRef.__espacoDocCache) globalRef.__espacoDocCache = new Map();
  return globalRef.__espacoDocCache;
}

// Páginas públicas podem usar uma cópia de até 15s; o painel sempre lê "fresh".
const CACHE_TTL_MS = 15_000;

export async function readDoc<T>(
  key: string,
  options: { fresh?: boolean } = {}
): Promise<DocRead<T>> {
  const b = await backend();
  if (b.kind === "blob" && !options.fresh) {
    const hit = cache().get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return { value: hit.value as T | null, etag: hit.etag };
    }
  }
  const result = await b.read<T>(key);
  cache().set(key, { value: result.value, etag: result.etag, at: Date.now() });
  return result;
}

/**
 * Lê, altera e grava um documento com segurança contra gravações simultâneas:
 * se outra requisição gravou no meio do caminho, relê e tenta de novo.
 */
export async function updateDoc<T, R = T>(
  key: string,
  mutate: (current: T | null) => { value: T; result: R } | Promise<{ value: T; result: R }>
): Promise<R> {
  const b = await backend();
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    const current = await b.read<T>(key);
    const { value, result } = await mutate(current.value);
    try {
      await b.write(key, value, current.etag);
      cache().delete(key);
      return result;
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 40 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error("Não foi possível gravar os dados");
}

export async function writeDoc<T>(key: string, value: T): Promise<void> {
  await updateDoc<T, null>(key, () => ({ value, result: null }));
}

export async function saveFile(
  name: string,
  bytes: Uint8Array,
  contentType: string
): Promise<void> {
  await (await backend()).saveFile(name, bytes, contentType);
}

export async function readFile(name: string): Promise<StoredFile | null> {
  return (await backend()).readFile(name);
}

export async function getStorageInfo(): Promise<{
  mode: "blob" | "sqlite";
  persistent: boolean;
}> {
  const b = await backend();
  return { mode: b.kind, persistent: b.persistent };
}
