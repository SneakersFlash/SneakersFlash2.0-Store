import type { MetadataRoute } from "next";
import CampaignsService from "@/lib/api/campaigns.service";
import { productsService } from "@/lib/api/products.service";

const BASE_URL = "https://sneakersflash.com";

// Rebuild sitemap setiap 1 jam tanpa perlu redeploy
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── Static pages ──
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,               lastModified: new Date(), priority: 1.0, changeFrequency: "daily"   },
    { url: `${BASE_URL}/products`, lastModified: new Date(), priority: 0.9, changeFrequency: "daily"   },
    { url: `${BASE_URL}/events`,   lastModified: new Date(), priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE_URL}/about`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
  ];

  // ── Dynamic: Events (pakai findActiveEvents yang sudah ada di backend) ──
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const events = await CampaignsService.getEvent();
    eventPages = events.map((e: { slug: string; startAt: string }) => ({
        url: `${BASE_URL}/events/${e.slug}`,
        lastModified: new Date(e.startAt),
        priority: 0.8,
        changeFrequency: "daily" as const,
    }));
  } catch {}

  // ── Dynamic: Products (pakai endpoint /products/sitemap — ringan, semua slug) ──
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await productsService.getSitemapSlugs();
    productPages = products.map((p: { slug: string; updatedAt: string }) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));
  } catch {}

  return [...staticPages, ...eventPages, ...productPages];
}