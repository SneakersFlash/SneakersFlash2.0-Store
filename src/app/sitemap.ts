import type { MetadataRoute } from "next";
import CampaignsService from "@/lib/api/campaigns.service";
import { productsService } from "@/lib/api/products.service";

const BASE_URL = "https://sneakersflash.com";

export const revalidate = 3600;

/** Returns a valid Date, falling back to now if the value is missing or unparseable */
function safeDate(value: string | null | undefined): Date {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,               lastModified: new Date(), priority: 1.0, changeFrequency: "daily"   },
    { url: `${BASE_URL}/products`, lastModified: new Date(), priority: 0.9, changeFrequency: "daily"   },
    { url: `${BASE_URL}/events`,   lastModified: new Date(), priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE_URL}/about`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/contact-us`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/faq`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/flash-club`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/privacy-policy`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/shipping`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/size-guide`,    lastModified: new Date(), priority: 0.5, changeFrequency: "monthly" },
  ];

  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const events = await CampaignsService.getEvent();
    eventPages = events.map((e: { slug: string; startAt: string }) => ({
      url: `${BASE_URL}/events/${e.slug}`,
      lastModified: safeDate(e.startAt),   // ← safe
      priority: 0.8,
      changeFrequency: "daily" as const,
    }));
  } catch {}

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await productsService.getSitemapSlugs();
    productPages = products.map((p: { slug: string; updatedAt: string }) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: safeDate(p.updatedAt),  // ← safe
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));
  } catch {}

  return [...staticPages, ...eventPages, ...productPages];
}