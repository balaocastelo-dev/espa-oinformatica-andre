import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "products.json");
const LIST = join(__dirname, "products-list.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const BRANDS = [
  { match: /apple|macbook/i, name: "Apple" },
  { match: /dell/i, name: "Dell" },
  { match: /hp|compaq|elitebook|zbook/i, name: "HP" },
  { match: /lenovo|thinkpad|thinkbook|ideapad/i, name: "Lenovo" },
];

function brandOf(name) {
  for (const b of BRANDS) if (b.match.test(name)) return b.name;
  return "Outras Marcas";
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function extractSpecs(name) {
  const specs = {};
  const storage =
    name.match(/SSD[\s-]*(\d+\s*(?:gb|tb)[a-z ]*)/i) ||
    name.match(/SSD[\s-]*(\d+)/i);
  if (storage) {
    const v = storage[1].trim().replace(/\s+/g, " ");
    specs["Armazenamento"] = `SSD ${v.toUpperCase()}`;
  }
  const hd = name.match(/\b(\d+\s*(?:tb|gb))\b.*?(?:HD|Disco)/i);
  if (hd && !specs["Armazenamento"]) specs["Armazenamento"] = hd[1].toUpperCase();
  const ram =
    name.match(/(\d+)\s*(?:gb)\s*(?:ram|mem|ddr\d*|de mem|memoria)/i) ||
    name.match(/(\d+)\s*gb\s+\d+\s*(?:gb|ssd)/i);
  if (ram) specs["Memória"] = `${ram[1]}GB`;
  const tela = name.match(/Tela\s*([\d,."]+)/i);
  if (tela) specs["Tela"] = `${tela[1].replace(/["]/g, "")}"`;
  const gpu = name.match(
    /RTX\s*\d+\s*[a-z0-9]*|GTX\s*\d+\s*[a-z0-9]*|Vega\s*\d+|Radeon\s*[a-z0-9]+|Nvidia\s*[a-zA-Z0-9]+|Intel\s*[a-zA-Z0-9 ]*UHD|Iris\s*Xe/i
  );
  if (gpu) specs["Placa de Vídeo"] = gpu[0].trim();
  const cpu = name.match(/Core\s*i\d[\w-]*|Ryzen\s*\d[\w\s]*|Apple\s*M\d|Intel\s*Celeron|Core\s*[iI]-?\d/i);
  if (cpu) specs["Processador"] = cpu[0].trim();
  return specs;
}

function makeDescription(name) {
  const used = /usado|recondicionado/i.test(name);
  return used
    ? "Equipamento seminovo revisado e testado por nossa equipe, pronto para uso. Procedência verificada, garantia inclusa e suporte técnico em Campinas."
    : "Produto novo com procedência garantida. Consulte disponibilidade, retirada e entrega direto com nossa equipe em Campinas.";
}

function highRes(image) {
  if (!image) return image;
  return image.replace(/\/medium\//, "/large/");
}

function kabumIdFromImage(image) {
  const m = image.match(/sync_mirakl\/(\d+)\//);
  return m ? m[1] : null;
}

function kabumIdFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (!/kabum\.com\.br$/.test(parsed.hostname)) return null;
    const m = parsed.pathname.match(/^\/produto\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function fetchKabumGallery(productId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`https://www.kabum.com.br/produto/${productId}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": UA,
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

    const gallery = [];
    for (const media of product.medias) {
      if (media?.type && media.type !== "image") continue;
      const imgs = media?.images || {};
      const url = imgs.gg || imgs.g || imgs.m || imgs.p;
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const hasList = existsSync(LIST);
  let raw;
  if (hasList) {
    raw = JSON.parse(readFileSync(LIST, "utf8"));
    console.log(`Usando a lista nova de scripts/products-list.json (${raw.length} itens).`);
  } else {
    raw = JSON.parse(readFileSync(OUT, "utf8")).map((p) => ({
      name: p.name,
      price: p.price,
      image: p.image,
      url: p.product_url,
    }));
    console.log(`Sem lista nova. Reenriquecendo data/products.json (${raw.length} itens).`);
  }

  const usedSlugs = new Map();
  const products = [];
  let enriched = 0;
  let skipped = 0;

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    const rawName = String(item.name ?? item.title ?? "").trim();
    if (!rawName) {
      skipped++;
      continue;
    }
    const name = rawName.replace(/\s+/g, " ").replace(/^\s*-\s*/, "").trim();
    const image = String(item.image ?? "").trim();
    const productUrl = String(item.url ?? "").trim() || undefined;

    let category = brandOf(name);
    let slug = slugify(name);
    const count = usedSlugs.get(slug) ?? 0;
    usedSlugs.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    const isUsed = /usado|recondicionado|seminovo/i.test(name);
    const badge = /recondicionado/i.test(name)
      ? "Recondicionado"
      : isUsed
        ? "Seminovo"
        : undefined;

    const productId = kabumIdFromUrl(productUrl) || kabumIdFromImage(image);
    let gallery = [];
    let info = null;

    if (productId) {
      info = await fetchKabumGallery(productId);
      if (info?.gallery?.length) {
        gallery = info.gallery;
        enriched++;
      }
    }

    const mainImage = gallery[0]?.replace(/\/large\//, "/xlarge/").replace("/xlarge/", "/xlarge/");
    const price = item.price;

    products.push({
      id: slug,
      slug,
      name,
      price:
        typeof price === "number"
          ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : /^R\$/.test(String(price))
            ? String(price)
            : `R$ ${String(price)}`,
      image: mainImage || highRes(image) || image || "/logo.png",
      category,
      badge,
      description: makeDescription(name),
      specs: extractSpecs(name),
      ...(gallery.length > 1 ? { image_urls: gallery } : {}),
      ...(productUrl ? { product_url: productUrl } : {}),
    });

    if (i % 5 === 0) console.log(`  > ${i + 1}/${raw.length} processados...`);
    await sleep(350);
  }

  writeFileSync(OUT, JSON.stringify(products, null, 2) + "\n", "utf8");
  console.log(`\nGerados ${products.length} produtos em ${OUT}`);
  console.log(`Galeria extraída para ${enriched} produtos (${skipped} pulados).`);
  const byBrand = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Por marca:", JSON.stringify(byBrand, null, 2));
  const badImages = products.filter((p) => !p.image || p.image === "/logo.png");
  if (badImages.length) console.log(`ATENÇÃO: ${badImages.length} produtos sem imagem!`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});