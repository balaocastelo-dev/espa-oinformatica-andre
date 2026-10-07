import { NextRequest, NextResponse } from "next/server";
import { readImage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ file: string }> }
) {
  const { file } = await props.params;
  const image = await readImage(file);
  if (!image) {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(image.buffer), {
    status: 200,
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.buffer.length),
      "X-Content-Type-Options": "nosniff",
      // O nome do arquivo é único por upload, então pode ficar em cache.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
