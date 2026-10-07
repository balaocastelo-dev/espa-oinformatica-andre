import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { readDoc, updateDoc } from "@/lib/storage";

/**
 * Login do painel administrativo.
 *
 * A senha vem da variável de ambiente ADMIN_PASSWORD. Sem ela, o painel fica
 * bloqueado (ninguém entra) em vez de ficar aberto.
 */

export const SESSION_COOKIE = "espaco_admin";
const SESSION_DAYS = 14;

let cachedSecret: string | null = null;

/** Chave que assina o cookie de sessão: AUTH_SECRET ou uma gerada e guardada. */
async function secret(): Promise<string> {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (cachedSecret) return cachedSecret;
  const existing = (await readDoc<{ secret?: string }>("auth", { fresh: true })).value;
  if (existing?.secret) {
    cachedSecret = existing.secret;
    return cachedSecret;
  }
  cachedSecret = await updateDoc<{ secret: string }, string>("auth", (current) => {
    const value = current?.secret ? current : { secret: randomBytes(32).toString("hex") };
    return { value, result: value.secret };
  });
  return cachedSecret;
}

async function sign(payload: string): Promise<string> {
  // A senha entra na assinatura: trocar a senha encerra todas as sessões.
  const key = `${await secret()}:${process.env.ADMIN_PASSWORD?.trim() ?? ""}`;
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const db = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, db);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export async function createSessionToken(): Promise<{ token: string; maxAge: number }> {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const payload = `v1.${expires}.${randomBytes(8).toString("hex")}`;
  return { token: `${payload}.${await sign(payload)}`, maxAge };
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token || !isAdminConfigured()) return false;
  const index = token.lastIndexOf(".");
  if (index <= 0) return false;
  const payload = token.slice(0, index);
  const signature = token.slice(index + 1);
  if (!safeEqual(signature, await sign(payload))) return false;
  const [version, expires] = payload.split(".");
  if (version !== "v1") return false;
  const exp = Number(expires);
  return Number.isFinite(exp) && exp > Date.now() / 1000;
}

/** Para Server Components (ex.: a página /admin). */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Para rotas de API: devolve uma resposta 401 quando não há login válido. */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return null;
  return NextResponse.json(
    { error: "Acesso restrito. Faça login no painel administrativo." },
    { status: 401 }
  );
}

export function sessionCookieOptions(request: NextRequest, maxAge: number) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const secure =
    forwardedProto === "https" || request.nextUrl.protocol === "https:";
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge,
  };
}

/* ---------- limite de tentativas (memória do processo) ---------- */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "desconhecido";
}

/** Retorna true se a ação ainda é permitida para a chave informada. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}
