import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link"; // Tambahkan import Link
import { TrustRow }          from "@/components/home/TrustRow";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { BrandCarousel }     from "@/components/home/BrandCarousel";
import { ProductSection }    from "@/components/home/ProductSection";
import { Suspense } from "react"; // 1. Add this import
// Services
import { bannersService } from "@/lib/api/banners.service";
import { categoriesService } from "@/lib/api/categories.service";
import CampaignsService from "@/lib/api/campaigns.service";
import { productsService } from "@/lib/api/products.service";
import { EventCampaignSection } from "@/components/home/EventCampaignSection"
import VoucherClaimSection from "@/components/home/VoucherClaimSection";
import type { Product } from "@/types/product.types";

export const metadata: Metadata = {
  title: "SneakersFlash — Premium Sneakers & Footwear",
  description:
    "Toko sneakers premium Indonesia. Nike, Adidas, New Balance dan lebih. Gratis ongkir di atas Rp 500k.",
};

export const revalidate = 60;

const SECTION_COLORS = [
  "#4A3728",
  "#1A2E1A",
  "#1A1A2E",
  "#2D2A26",
  "#3E2723",
];

export default async function HomePage() {
  // Fetch Data (Banners, Categories, Active Campaigns, & Products per section)
  const SECTION_LIMIT = 10;
  const [banners, apiCategories, campaigns, middleBanners, rawUnisex, rawMens, rawWomens, rawLifestyle, rawRunning] = await Promise.all([
    bannersService.getBanners("home_top").catch(() => []),
    categoriesService.getAll().catch(() => []),
    CampaignsService.getEvent().catch(() => []),
    bannersService.getBanners("home_middle").catch(() => []),
    productsService.getProducts({ category: "Unisex",        limit: SECTION_LIMIT }).catch(() => ({ data: [] as Product[] })),
    productsService.getProducts({ category: "Mens",          limit: SECTION_LIMIT }).catch(() => ({ data: [] as Product[] })),
    productsService.getProducts({ category: "Womens",        limit: SECTION_LIMIT }).catch(() => ({ data: [] as Product[] })),
    productsService.getProducts({ category: "Lifestyle/Casual", limit: SECTION_LIMIT }).catch(() => ({ data: [] as Product[] })),
    productsService.getProducts({ category: "Running",       limit: SECTION_LIMIT }).catch(() => ({ data: [] as Product[] })),
  ]);

  // Deduplicate: setiap section hanya boleh menampilkan produk yang belum muncul di section sebelumnya
  const seenIds = new Set<string>();
  function dedup(products: Product[]): Product[] {
    return products.filter((p) => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });
  }

  const productsUnisex    = dedup(rawUnisex.data    ?? []);
  const productsMens      = dedup(rawMens.data      ?? []);
  const productsWomens    = dedup(rawWomens.data    ?? []);
  const productsLifestyle = dedup(rawLifestyle.data ?? []);
  const productsRunning   = dedup(rawRunning.data   ?? []);

  const sidebarBanner = middleBanners?.[0];

  const getCategoryImage = (categoryName: string) => {
    const foundCategory = (apiCategories as any[]).find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return foundCategory?.imageUrl || "/placeholder.jpg";
  };

  const unisexGroup = [
    {
      id: "unisex",
      title: "Unisex",
      filters: { category: "Unisex", limit: SECTION_LIMIT },
      href: "/products?category=unisex",
      bgImage: getCategoryImage("Unisex"),
      products: productsUnisex,
    }
  ];

  const firstGroup = [
    {
      id: "mens",
      title: "Mens",
      filters: { category: "Mens", limit: SECTION_LIMIT },
      href: "/products?category=mens",
      bgImage: getCategoryImage("Mens"),
      products: productsMens,
    },
    {
      id: "womens",
      title: "Womens",
      filters: { category: "Womens", limit: SECTION_LIMIT },
      href: "/products?category=womens",
      bgImage: getCategoryImage("Womens"),
      products: productsWomens,
    }
  ];

  const restGroup = [
    {
      id: "lifestyle-casual",
      title: "Lifestyle/Casual",
      filters: { category: "Lifestyle/Casual", limit: SECTION_LIMIT },
      href: "/products?category=lifestyle-casual",
      bgImage: getCategoryImage("Lifestyle/Casual"),
      products: productsLifestyle,
    },
    {
      id: "running",
      title: "Running",
      filters: { category: "Running", limit: SECTION_LIMIT },
      href: "/products?category=running",
      bgImage: getCategoryImage("Running"),
      products: productsRunning,
    }
  ];

  return (
    <>
      <TrustRow />
      <HeroBanner banners={banners} />
      
      {/* ========================================== */}
      {/* BAGIAN EVENT / CAMPAIGN (e.g. LAST DROP)   */}
      {/* ========================================== */}
      <div className="container mx-auto px-4 max-w-7xl mt-4">

        <Suspense fallback={<div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl" />}>
          <VoucherClaimSection />
        </Suspense>

      <EventCampaignSection campaigns={campaigns} />

      <CategoryShortcuts />
      <BrandCarousel />

        {/* ========================================== */}
        {/* UNISEX SECTION (di atas side banner)       */}
        {/* ========================================== */}
        <div className="flex flex-col gap-4 pb-4">
          {unisexGroup.map((section, index) => (
            <ProductSection
              key={section.id}
              title={section.title}
              filters={section.filters}
              bgColor={SECTION_COLORS[index % SECTION_COLORS.length]}
              viewAllHref={section.href}
              backgroundImage={section.bgImage}
              products={section.products}
            />
          ))}
        </div>

        {/* ========================================== */}
        {/* KAWASAN PRODUK REGULER (Mens, Womens)      */}
        {/* ========================================== */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          
          {/* SIDE BANNER (Kiri) */}
          <div className="hidden lg:flex flex-col relative w-[280px] shrink-0 rounded-2xl overflow-hidden shadow-lg bg-[#001D4A] group">
            <Image 
              src={sidebarBanner?.imageDesktopUrl || "/images/bgcampaignsf4.png"}
              alt={sidebarBanner?.title || "Promo Sidebar"}
              fill
              className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[10px] font-bold text-[#FF6B00] tracking-widest mb-2">New Arrival</span>
              <p className="font-display font-black text-4xl leading-[0.9] tracking-tight">
                STEAL<br/>DEALS
              </p>
              <p className="mt-3 text-sm text-white/80">Temukan sepatu incaranmu dengan harga terbaik minggu ini.</p>
              <Link href="/products" className="mt-5 bg-[#FF6B00] text-center text-white text-sm font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">
                Shop Now
              </Link>
            </div>
          </div>

          {/* KUMPULAN PRODUCT SECTION (Kanan) */}
          <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
            {firstGroup.map((section) => (
              <ProductSection
                key={section.id}
                title={section.title}
                filters={section.filters}
                viewAllHref={section.href}
                backgroundImage={section.bgImage}
                products={section.products}
              />
            ))}
          </div>
        </div>

        {/* KUMPULAN PRODUCT SECTION SISANYA (Bawah) */}
        {restGroup.length > 0 && (
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
            {restGroup.map((section, index) => {
              const bgColor = SECTION_COLORS[index % SECTION_COLORS.length];
              return (
                <ProductSection
                  key={section.id}
                  title={section.title}
                  filters={section.filters}
                  bgColor={bgColor}
                  viewAllHref={section.href}
                  backgroundImage={section.bgImage}
                  products={section.products}
                />
              )
            })}
          </div>
        )}

      </div>
    </>
  );
}