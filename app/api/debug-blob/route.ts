import { NextResponse } from "next/server";
import { get, head, put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORÁRIO: diagnóstico de ETag do Blob. Remover.
export async function GET() {
  const out: Record<string, unknown> = {};
  const step = async (name: string, fn: () => Promise<unknown>) => {
    try {
      out[name] = await fn();
    } catch (e) {
      out[name] = { error: (e as Error).name + ": " + (e as Error).message };
    }
  };
  const P = "dados/_probe.json";
  const body = (n: number) => JSON.stringify({ n, pad: "x".repeat(2000) });
  await step("orders_get_nocache", async () => {
    const r = await get("dados/orders.json", { access: "private", useCache: false });
    return r && { etag: r.blob.etag, hdr: r.headers.get("etag"), st: r.statusCode };
  });
  await step("orders_head", async () => (await head("dados/orders.json")).etag);
  let pe = "";
  await step("put1", async () => {
    const r = await put(P, body(1), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
    pe = r.etag;
    return r.etag;
  });
  let ge = "";
  await step("get_nocache", async () => {
    const r = await get(P, { access: "private", useCache: false });
    ge = r?.blob.etag ?? "";
    return r && { etag: r.blob.etag, hdr: r.headers.get("etag"), enc: r.headers.get("content-encoding") };
  });
  await step("get_cache", async () => {
    const r = await get(P, { access: "private" });
    return r && { etag: r.blob.etag, hdr: r.headers.get("etag") };
  });
  await step("head", async () => (await head(P)).etag);
  await step("put_ifmatch_getEtag", async () => (await put(P, body(2), { access: "private", addRandomSuffix: false, ifMatch: ge, contentType: "application/json", cacheControlMaxAge: 60 })).etag);
  await step("put_ifmatch_stale_putEtag", async () => (await put(P, body(3), { access: "private", addRandomSuffix: false, ifMatch: pe, contentType: "application/json", cacheControlMaxAge: 60 })).etag);
  await step("get_nocache_after", async () => {
    const r = await get(P, { access: "private", useCache: false });
    return r && { etag: r.blob.etag, text: (await new Response(r.stream).text()).slice(0, 8) };
  });
  return NextResponse.json(out);
}
