import { NextRequest, NextResponse } from "next/server";
import {
  mergeCompanySettings,
  readCompanySettings,
  writeCompanySettings,
} from "@/lib/company";

export async function GET() {
  return NextResponse.json(await readCompanySettings());
}

export async function PUT(request: NextRequest) {
  const current = await readCompanySettings();
  const body = await request.json();
  const settings = mergeCompanySettings(body, current);
  await writeCompanySettings(settings);
  return NextResponse.json(settings);
}
