import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  clientIp,
  createSessionToken,
  isAdminConfigured,
  rateLimit,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Painel bloqueado: defina a variável de ambiente ADMIN_PASSWORD no servidor.",
      },
      { status: 503 }
    );
  }

  if (!rateLimit(`login:${clientIp(request)}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const { token, maxAge } = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(request, maxAge));
  return response;
}
