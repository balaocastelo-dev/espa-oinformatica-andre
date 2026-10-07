import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/db";

/**
 * Login do painel administrativo.
 *
 * A senha vem da variável de ambiente ADMIN_PASSWORD. Sem ela, o painel fica
 * bloqueado (ninguém entra) em vez de ficar aberto.
 */

export const SESSION_COOKIE = "espaco_admin";
const SESSION_DAYS = 14;

function secret(): string {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  let stored = kvGet("auth_secret");
  if (!stored) {
    stored = randomBytes(32).toString("hex");
    kvSet("auth_secret", stored);
  }
  return stored;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
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

export function createSessionToken(): { token: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const payload = `v1.${expires}.${randomBytes(8).toString("hex")}`;
  return { token: `${payload}.${sign(payload)}`, maxAge };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !isAdminConfigured()) return false;
  const index = token.lastIndexOf(".");
  if (index <= 0) return false;
  const payload = token.slice(0, index);
  const signature = token.slice(index + 1);
  if (!safeEqual(signature, sign(payload))) return false;
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
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return null;
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
