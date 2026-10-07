import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { UploadError, saveImage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

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

  try {
    const saved = await saveImage(file, { prefix: "product", maxBytes: 10 * 1024 * 1024 });
    return NextResponse.json({ ...saved, storage: "disk" });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Erro ao salvar imagem:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar a imagem. Tente novamente." },
      { status: 500 }
    );
  }
}
