export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  slug: string;
  description?: string;
  specs?: Record<string, string>;
  badge?: string;
  image_urls?: string[];
  product_url?: string;
  installment_price?: string;
  installment_text?: string;
  youtube_url?: string;
}

export function parsePriceToNumber(price: string): number {
  if (!price) return 0;
  const cleaned = price.replace("R$", "").replace(/\./g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function normalizePrice(input: string | number): string {
  let value: number;
  if (typeof input === "number") {
    value = input;
  } else {
    const cleaned = String(input)
      .replace(/R\$/gi, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    value = parseFloat(cleaned);
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Preço inválido");
  }
  return formatPrice(value);
}

export function youtubeIdFromUrl(input: string | undefined): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;
  const shortsMatch = raw.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shortsMatch) return shortsMatch[1];
  const embedMatch = raw.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = raw.match(/(?:youtube\.com\/(?:watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (watchMatch) return watchMatch[1];
  const maybeId = /^[A-Za-z0-9_-]{6,}$/.test(raw) ? raw : null;
  return maybeId;
}
