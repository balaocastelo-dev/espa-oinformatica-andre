import { NextResponse } from "next/server";
import { getStorageInfo, readDoc } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const info = await getStorageInfo();
    await readDoc("products", { fresh: true });
    return NextResponse.json({ ok: true, storage: info.mode, persistent: info.persistent });
  } catch (error) {
    console.error("[health]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
