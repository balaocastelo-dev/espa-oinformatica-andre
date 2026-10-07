import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getUploadsDir } from "@/lib/db";

/** Fotos enviadas pelo painel ficam no volume persistente (DATA_DIR/uploads). */

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

function extensionFromName(name: string): string | undefined {
  const extension = name.toLowerCase().split(".").pop();
  if (extension === "jpeg") return "jpg";
  return extension === "png" || extension === "jpg" || extension === "webp"
    ? extension
    : undefined;
}

function hasValidSignature(extension: string, bytes: Uint8Array): boolean {
  if (extension === "png") {
    const magic = [137, 80, 78, 71, 13, 10, 26, 10];
    return bytes.length >= 8 && magic.every((value, index) => bytes[index] === value);
  }
  if (extension === "jpg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  return (
    extension === "webp" &&
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export class UploadError extends Error {}

export async function saveImage(
  file: File,
  options: { prefix: string; maxBytes: number }
): Promise<{ url: string; fileName: string; bytes: number }> {
  const extension = MIME_EXTENSIONS[file.type] ?? extensionFromName(file.name);
  if (!extension) throw new UploadError("Formato inválido. Use PNG, JPG ou WEBP");

  if (file.size > options.maxBytes) {
    const mb = Math.round(options.maxBytes / (1024 * 1024));
    throw new UploadError(`A imagem deve ter no máximo ${mb} MB`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(extension, bytes)) {
    throw new UploadError("O arquivo selecionado não é uma imagem válida");
  }

  const id = randomUUID().replace(/-/g, "").slice(0, 16);
  const fileName = `${options.prefix}-${id}.${extension}`;
  await fs.writeFile(
    path.join(/* turbopackIgnore: true */ getUploadsDir(), fileName),
    bytes
  );
  return { url: `/api/products/images/${fileName}`, fileName, bytes: bytes.length };
}

export function sanitizeImageName(file: string): string | null {
  if (!file) return null;
  const clean = path.basename(file).replace(/[^A-Za-z0-9_.-]/g, "");
  if (!clean || clean !== file || clean.length > 200) return null;
  if (clean.startsWith(".")) return null;
  if (!/\.(png|jpg|jpeg|webp)$/i.test(clean)) return null;
  return clean;
}

export async function readImage(
  file: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const safe = sanitizeImageName(file);
  if (!safe) return null;
  const extension = safe.split(".").pop()!.toLowerCase();
  try {
    const filePath = path.join(/* turbopackIgnore: true */ getUploadsDir(), safe);
    const buffer = await fs.readFile(/* turbopackIgnore: true */ filePath);
    return { buffer, contentType: CONTENT_TYPES[extension] ?? "application/octet-stream" };
  } catch {
    /* arquivo não existe */
  }
  return null;
}
