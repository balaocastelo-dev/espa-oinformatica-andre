import { promises as fs } from "node:fs";
import path from "node:path";
import { SITE_CONFIG } from "@/lib/config";

export type CompanyStat = {
  value: string;
  label: string;
};

export type CompanyService = {
  title: string;
  description: string;
};

export type CompanySettings = {
  name: string;
  tagline: string;
  logoPath: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  instagramUrl: string;
  instagramHandle: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroWhatsappLabel: string;
  heroWhatsappMessage: string;
  catalogButtonLabel: string;
  stats: CompanyStat[];
  servicesTitle: string;
  servicesDescription: string;
  services: CompanyService[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonLabel: string;
  footerDescription: string;
  weekdayHours: string;
  saturdayHours: string;
  whatsappDefaultMessage: string;
};

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: SITE_CONFIG.name,
  tagline: SITE_CONFIG.tagline,
  logoPath: "/logo.png",
  phoneDisplay: SITE_CONFIG.phone.display,
  whatsappNumber: SITE_CONFIG.whatsapp.number,
  email: SITE_CONFIG.email,
  address: SITE_CONFIG.address,
  city: SITE_CONFIG.city,
  region: SITE_CONFIG.region,
  postalCode: SITE_CONFIG.postalCode,
  instagramUrl: SITE_CONFIG.social.instagram,
  instagramHandle: "@espaco.dainformatica",
  heroBadge: "6 meses de garantia",
  heroTitle: "Notebooks seminovos com procedência, qualidade e suporte de verdade.",
  heroDescription:
    "Há mais de 15 anos a referência em Campinas para notebooks seminovos revisados, computadores, manutenção e upgrades. Compre com segurança e economize.",
  heroWhatsappLabel: "Falar no WhatsApp",
  heroWhatsappMessage:
    "Olá! Vim pelo site e quero saber mais sobre os notebooks seminovos.",
  catalogButtonLabel: "Ver catálogo",
  stats: [
    { value: "15+", label: "anos de experiência" },
    { value: "6", label: "meses de garantia" },
    { value: "100%", label: "equipamentos revisados" },
    { value: "-50%", label: "vs. preço de novo" },
  ],
  servicesTitle: "Soluções completas em informática",
  servicesDescription:
    "Venda, manutenção, suporte, upgrades e atendimento especializado para deixar seus equipamentos sempre funcionando no máximo.",
  services: [
    {
      title: "Venda",
      description:
        "Notebooks seminovos revisados, computadores e acessórios com garantia e procedência.",
    },
    {
      title: "Manutenção",
      description:
        "Reparo de computadores e notebooks com diagnóstico rápido e transparente.",
    },
    {
      title: "Upgrade",
      description:
        "Melhoria de desempenho com SSD, memória RAM e otimização geral do sistema.",
    },
    {
      title: "Suporte",
      description:
        "Auxílio técnico contínuo, presencial ou remoto, para usuários e empresas.",
    },
    {
      title: "Atendimento",
      description:
        "Atendimento especializado e humano, com suporte em cada etapa.",
    },
    {
      title: "Entrega",
      description:
        "Serviço rápido e seguro de retirada e devolução do seu equipamento.",
    },
  ],
  ctaTitle: "Precisa de um notebook ou de um reparo hoje?",
  ctaDescription:
    "Consulte disponibilidade, valores e prazos direto com nossa equipe pelo WhatsApp. Atendimento rápido em Campinas e região.",
  ctaButtonLabel: "Chamar no WhatsApp",
  footerDescription:
    "Há mais de 15 anos, referência em notebooks seminovos com procedência, qualidade e garantia de 6 meses. Venda, manutenção, upgrade e suporte técnico em Campinas.",
  weekdayHours: "Seg. a Sex. das 09h às 18h",
  saturdayHours: "Sáb. das 09h às 13h",
  whatsappDefaultMessage: SITE_CONFIG.whatsapp.messageDefault,
};

const DATA_DIR_SRC = path.join(process.cwd(), "data");
const COMPANY_FILE_SRC = path.join(DATA_DIR_SRC, "company.json");

const TMP_DIR =
  process.env.NODE_ENV === "production"
    ? ((() => {
        const candidates = ["/tmp", process.env.TMPDIR, process.env.TEMP].filter(
          Boolean
        ) as string[];
        return candidates[0] || DATA_DIR_SRC;
      })())
    : DATA_DIR_SRC;

const WRITABLE_DIR = TMP_DIR || DATA_DIR_SRC;
const COMPANY_FILE_RW = path.join(WRITABLE_DIR, "company.json");

let companyCache: CompanySettings | null = null;
let companyCacheMtime: number | null = null;
let companyCachePath: string | null = null;

let companyFsWritable: boolean | null = null;

async function isCompanyFsWritable(): Promise<boolean> {
  if (companyFsWritable !== null) return companyFsWritable;
  try {
    await fs.mkdir(WRITABLE_DIR, { recursive: true });
    const probe = path.join(WRITABLE_DIR, ".company_write_probe");
    await fs.writeFile(probe, "ok", "utf8");
    await fs.unlink(probe);
    companyFsWritable = true;
  } catch {
    companyFsWritable = false;
  }
  return companyFsWritable;
}

async function getMtime(f: string): Promise<number | null> {
  try {
    const st = await fs.stat(f);
    return st.mtimeMs;
  } catch {
    return null;
  }
}

async function readJson<T>(f: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(f, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function recordOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function textOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export function mergeCompanySettings(
  input: unknown,
  base: CompanySettings = DEFAULT_COMPANY_SETTINGS
): CompanySettings {
  const source = recordOf(input);
  const next: CompanySettings = { ...base };

  for (const field of [
    "name",
    "tagline",
    "phoneDisplay",
    "whatsappNumber",
    "email",
    "address",
    "city",
    "region",
    "postalCode",
    "instagramUrl",
    "instagramHandle",
    "heroBadge",
    "heroTitle",
    "heroDescription",
    "heroWhatsappLabel",
    "heroWhatsappMessage",
    "catalogButtonLabel",
    "servicesTitle",
    "servicesDescription",
    "ctaTitle",
    "ctaDescription",
    "ctaButtonLabel",
    "footerDescription",
    "weekdayHours",
    "saturdayHours",
    "whatsappDefaultMessage",
  ] as const) {
    next[field] = textOr(source[field], base[field]);
  }

  if (typeof source.logoPath === "string" && source.logoPath.trim().startsWith("/")) {
    next.logoPath = source.logoPath.trim();
  }

  const statsInput = Array.isArray(source.stats) ? source.stats : null;
  if (statsInput) {
    next.stats = base.stats.map((stat, index) => {
      const item = recordOf(statsInput[index]);
      return {
        value: textOr(item.value, stat.value),
        label: textOr(item.label, stat.label),
      };
    });
  }

  const servicesInput = Array.isArray(source.services) ? source.services : null;
  if (servicesInput) {
    next.services = base.services.map((service, index) => {
      const item = recordOf(servicesInput[index]);
      return {
        title: textOr(item.title, service.title),
        description: textOr(item.description, service.description),
      };
    });
  }

  return next;
}

export async function readCompanySettings(): Promise<CompanySettings> {
  const rwMtime = COMPANY_FILE_RW !== COMPANY_FILE_SRC ? await getMtime(COMPANY_FILE_RW) : null;
  const srcMtime = await getMtime(COMPANY_FILE_SRC);

  let chosenPath = COMPANY_FILE_SRC;
  let chosenMtime: number | null = srcMtime;
  if (rwMtime !== null && (srcMtime === null || rwMtime >= srcMtime)) {
    chosenPath = COMPANY_FILE_RW;
    chosenMtime = rwMtime;
  }

  if (
    companyCache &&
    companyCachePath === chosenPath &&
    companyCacheMtime === chosenMtime
  ) {
    return companyCache;
  }

  const raw = (await readJson<CompanySettings>(chosenPath)) as CompanySettings | null;
  const merged = raw ? mergeCompanySettings(raw) : DEFAULT_COMPANY_SETTINGS;
  companyCache = merged;
  companyCachePath = chosenPath;
  companyCacheMtime = chosenMtime;
  return merged;
}

export async function writeCompanySettings(settings: CompanySettings): Promise<boolean> {
  companyCache = settings;
  companyCachePath = COMPANY_FILE_RW;
  companyCacheMtime = Date.now();
  const writable = await isCompanyFsWritable();
  if (!writable) return false;
  try {
    await fs.mkdir(WRITABLE_DIR, { recursive: true });
    await fs.writeFile(COMPANY_FILE_RW, JSON.stringify(settings, null, 2) + "\n", "utf8");
    return true;
  } catch {
    return false;
  }
}
