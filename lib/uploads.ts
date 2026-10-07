import path from "node:path";
import { randomUUID } from "node:crypto";
import { readFile, saveFile } from "@/lib/storage";

/** Fotos enviadas pelo painel ficam no armazenamento permanente (lib/storage). */

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
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
  const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
  await saveFile(fileName, bytes, contentType);
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
  return readFile(safe);
}
