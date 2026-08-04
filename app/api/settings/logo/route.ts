import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { readCompanySettings, writeCompanySettings } from "@/lib/company";

export const runtime = "nodejs";

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("logo");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Selecione um arquivo de logo" }, { status: 400 });
  }

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Formato inválido. Use PNG, JPG ou WEBP" },
      { status: 400 }
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "O logo deve ter no máximo 5 MB" }, { status: 400 });
  }

  const fileName = `logo.${extension}`;
  const publicDir = path.join(process.cwd(), "public");
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, fileName), Buffer.from(await file.arrayBuffer()));

  const current = await readCompanySettings();
  const settings = { ...current, logoPath: `/${fileName}` };
  await writeCompanySettings(settings);

  return NextResponse.json(settings);
}
