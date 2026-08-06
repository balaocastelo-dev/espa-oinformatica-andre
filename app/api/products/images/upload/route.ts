import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function extensionFromName(name: string): string | undefined {
  const extension = name.toLowerCase().split(".").pop();
  return extension === "png" || extension === "jpg" || extension === "jpeg" || extension === "webp"
    ? extension === "jpeg"
      ? "jpg"
      : extension
    : undefined;
}

function hasValidSignature(extension: string, bytes: Uint8Array): boolean {
  if (extension === "png") {
    return (
      bytes.length >= 8 &&
      bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index])
    );
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

export async function POST(request: NextRequest) {
  let file: File | null = null;
  try {
    const formData = await request.formData();
    const value = formData.get("image");
    file = value && typeof value !== "string" ? value : null;
  } catch {
    return NextResponse.json(
      { error: "Envie a imagem pelo campo de arquivo do formulário" },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "Selecione um arquivo de imagem" }, { status: 400 });
  }

  const extension = EXTENSIONS[file.type] ?? extensionFromName(file.name);
  if (!extension) {
    return NextResponse.json(
      { error: "Formato inválido. Use PNG, JPG ou WEBP" },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "A imagem deve ter no máximo 10 MB" },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(extension, bytes)) {
    return NextResponse.json(
      { error: "O arquivo selecionado não é uma imagem válida" },
      { status: 400 }
    );
  }

  const fileSlug = randomUUID().replace(/-/g, "").slice(0, 16);
  const fileName = `product-${fileSlug}.${extension}`;
  const publicDir = path.join(process.cwd(), "public", "products");

  let url: string = `/products/${fileName}`;
  let persisted = false;
  let servedBy: "public" | "tmp_api" = "public";

  try {
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, fileName), Buffer.from(bytes));
    persisted = true;
  } catch {
    const tmpCandidates = ["/tmp", process.env.TMPDIR, process.env.TEMP].filter(Boolean) as string[];
    for (const candidate of tmpCandidates) {
      try {
        const tmpProductsDir = path.join(candidate, "espaco-product-images");
        await fs.mkdir(tmpProductsDir, { recursive: true });
        await fs.writeFile(path.join(tmpProductsDir, fileName), Buffer.from(bytes));
        persisted = true;
        servedBy = "tmp_api";
        url = `/api/products/images/${fileName}`;
        break;
      } catch {
        /* tenta próximo candidato */
      }
    }
  }

  if (!persisted) {
    return NextResponse.json(
      {
        error:
          "Não foi possível salvar a imagem no momento (ambiente read-only). Tente novamente ou use uma URL direta de imagem.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url,
    fileName,
    storage: servedBy,
    bytes: bytes.length,
  });
}
