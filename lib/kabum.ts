const KABUM_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export type TsvItem = {
  url: string;
  image: string;
  name: string;
  price: string;
};

function cleanCell(value: string | undefined): string {
  let s = String(value ?? "").trim();
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    s = s.slice(1, -1);
  }
  s = s.replace(/""/g, '"');
  return s.replace(/\s+/g, " ").trim();
}

export function parsePriceText(value: string | number): number {
  if (typeof value === "number") return value;
  const cleaned = String(value)
    .replace(/R\$/gi, "")
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function parseTsv(text: string): TsvItem[] {
  const items: TsvItem[] = [];
  const lines = String(text || "").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const cols = line.split("\t");
    if (cols.length < 4) continue;

    const url = cols[0].trim();
    if (!url.startsWith("http")) continue;

    const image = cols[1].trim();
    const price = cols[cols.length - 1];
    const nameParts = cols.slice(2, -1);
    const name = cleanCell(nameParts.length ? nameParts.join(" ") : cols[2]);
    if (!name) continue;

    items.push({ url, image, name, price: price.trim() });
  }
  return items;
}

export function kabumIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!/kabum\.com\.br$/.test(parsed.hostname)) return null;
    const m = parsed.pathname.match(/^\/produto\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function kabumIdFromImage(image: string): string | null {
  const m = image.match(/sync_mirakl\/(\d+)\//);
  return m ? m[1] : null;
}

export function highRes(image: string | undefined): string {
  if (!image) return "";
  return image.replace(/\/medium\//, "/large/");
}

export type KabumEnrich = {
  gallery: string[];
  title: string | null;
  price: number | null;
};

export async function fetchKabumGallery(productId: string): Promise<KabumEnrich | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`https://www.kabum.com.br/produto/${productId}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": KABUM_UA,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    if (res.status === 403 || res.status === 429 || !res.ok) return null;
    const html = await res.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
    );
    if (!match) return null;
    const data = JSON.parse(match[1]);
    const product = data?.props?.pageProps?.product;
    if (!product || !Array.isArray(product.medias)) return null;

    const gallery: string[] = [];
    for (const media of product.medias) {
      if (media?.type && media.type !== "image") continue;
      const imgs = media?.images || {};
      const url = imgs?.gg || imgs?.g || imgs?.m || imgs?.p;
      if (url && url.startsWith("http")) gallery.push(url);
      if (gallery.length >= 4) break;
    }

    return {
      gallery,
      title: typeof product.title === "string" ? product.title.trim() : null,
      price:
        typeof product.price === "number" && product.price > 0
          ? product.price
          : null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}