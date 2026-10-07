import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readCompanySettings, writeCompanySettings } from "@/lib/company";
import { UploadError, saveImage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  let file: File | null = null;
  try {
    const formData = await request.formData();
    const value = formData.get("logo");
    file = value && typeof value !== "string" ? value : null;
  } catch {
    return NextResponse.json(
      { error: "Envie o logo pelo campo de arquivo do formulário" },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "Selecione um arquivo de logo" }, { status: 400 });
  }

  try {
    const saved = await saveImage(file, { prefix: "logo", maxBytes: 5 * 1024 * 1024 });
    const current = await readCompanySettings();
    const settings = { ...current, logoPath: saved.url };
    const persisted = await writeCompanySettings(settings);
    return NextResponse.json({
      ...settings,
      _meta: {
        storage_persisted: persisted,
        storage_mode: persisted ? "disk" : "memory_only",
      },
    });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Erro ao salvar logo:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar o logo. Tente novamente." },
      { status: 500 }
    );
  }
}
