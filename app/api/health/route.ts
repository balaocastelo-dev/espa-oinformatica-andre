import { NextResponse } from "next/server";
import { getDb, getStorageInfo } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    getDb().prepare("SELECT 1").get();
    return NextResponse.json({ ok: true, persistent: getStorageInfo().persistent });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
