import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/products/images/"],
        disallow: ["/admin", "/api/", "/cart"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
