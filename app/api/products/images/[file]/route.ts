import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const TMP_DIRS = ["/tmp", process.env.TMPDIR, process.env.TEMP].filter(Boolean) as string[];
const SANITIZE_RE = /[^A-Za-z0-9_.-]/g;

function sanitize(file: string): string | null {
  if (!file) return null;
  const clean = file.replace(SANITIZE_RE, "");
  if (!clean || clean.length > 200) return null;
  if (clean.startsWith(".")) return null;
  if (!/\.(png|jpg|jpeg|webp)$/i.test(clean)) return null;
  return clean;
}

function detectContentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export async function GET(_request: NextRequest, props: { params: Promise<{ file: string }> }) {
  const { file } = await props.params;
  const safe = sanitize(file);
  if (!safe) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }

  const extension = safe.split(".").pop() || "png";

  const candidates: string[] = [];
  for (const base of TMP_DIRS) {
    candidates.push(path.join(base, "espaco-product-images", safe));
  }
  candidates.push(path.join(process.cwd(), "public", "products", safe));

  for (const candidate of candidates) {
    try {
      const buffer = await fs.readFile(candidate);
      const stat = await fs.stat(candidate);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": detectContentType(extension),
          "Content-Length": String(stat.size),
          "Cache-Control": "public, max-age=604800, immutable",
        },
      });
    } catch {
      /* continua pro proximo */
    }
  }

  return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
}
