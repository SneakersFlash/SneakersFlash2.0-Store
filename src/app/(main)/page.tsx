import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrustRow }          from "@/components/home/TrustRow";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { BrandCarousel }     from "@/components/home/BrandCarousel";
import { ProductSection }    from "@/components/home/ProductSection";
import { Suspense } from "react";
// Services
import { bannersService } from "@/lib/api/banners.service";
import { categoriesService } from "@/lib/api/categories.service";
import { productsService } from "@/lib/api/products.service";
import CampaignsService from "@/lib/api/campaigns.service";
import { EventCampaignSection } from "@/components/home/EventCampaignSection"
import VoucherClaimSection from "@/components/home/VoucherClaimSection";

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
  const [banners, apiCategories, campaigns, middleBanners] = await Promise.all([
    bannersService.getBanners("home_top").catch(() => []),
    categoriesService.getAll().catch(() => []),
    CampaignsService.getEvent().catch(() => []),
    bannersService.getBanners("home_middle").catch(() => [])
  ]);

  const sidebarBanner = middleBanners?.[0];

  const getCategoryImage = (categoryName: string) => {
    const foundCategory = (apiCategories as any[]).find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return foundCategory?.imageUrl || "/placeholder.jpg";
  };

  // Home page highlight: HANYA sepatu (type=Footwear) — tanpa apparel/bags/dll.
  //
  // Produk sengaja di-fetch DI SERVER, bukan di tiap ProductSection, supaya bisa
  // di-dedupe lintas section. Taxonomy-nya faceted (satu sepatu bisa sekaligus
  // Mens + Running + Lifestyle/Casual), jadi tanpa dedupe barang yang sama pasti
  // nongol di beberapa section. Cara lama mengakalinya dengan page:2 untuk
  // Mens/Womens — itu cuma menggeser offset dan tidak pernah menjamin apa pun.
  //
  // Tiap section diambil SECTION_SIZE item pertama yang belum dipakai section
  // sebelumnya, jadi urutan array ini menentukan siapa yang dapat duluan.
  const SECTION_SIZE = 10;
  // Buffer: ~20% hasil fetch kebuang karena stok habis, sisanya kepotong dedupe.
  const FETCH_SIZE = 40;

  const sectionDefs = [
    {
      id: "unisex",
      title: "Unisex",
      filters: { categories: ["Mens", "Womens"], type: "Footwear", limit: FETCH_SIZE, page: 1 },
      href: "/products?categories=Mens,Womens&type=Footwear",
      bgImage: getCategoryImage("Mens"),
    },
    {
      id: "mens",
      title: "Mens",
      filters: { category: "Mens", type: "Footwear", limit: FETCH_SIZE, page: 1 },
      href: "/products?category=mens&type=Footwear",
      bgImage: getCategoryImage("Mens"),
    },
    {
      id: "womens",
      title: "Womens",
      filters: { category: "Womens", type: "Footwear", limit: FETCH_SIZE, page: 1 },
      href: "/products?category=womens&type=Footwear",
      bgImage: getCategoryImage("Womens"),
    },
    {
      id: "lifestyle-casual",
      title: "Lifestyle/Casual",
      filters: { category: "Lifestyle/Casual", type: "Footwear", limit: FETCH_SIZE, page: 1 },
      href: "/products?category=lifestyle-casual&type=Footwear",
      bgImage: getCategoryImage("Lifestyle/Casual"),
    },
    {
      id: "running",
      title: "Running",
      filters: { category: "Running", type: "Footwear", limit: FETCH_SIZE, page: 1 },
      href: "/products?category=running&type=Footwear",
      bgImage: getCategoryImage("Running"),
    },
  ];

  const sectionResults = await Promise.all(
    sectionDefs.map((s) =>
      productsService.getProducts(s.filters).catch(() => ({ data: [] as any[] })),
    ),
  );

  // Produk yang stoknya habis tidak ditampilkan — percuma makan slot highlight
  // karena tetap tidak bisa dibeli. totalStock dihitung backend dari stok varian.
  const isAvailable = (p: any) => Number(p?.totalStock ?? 0) > 0;

  const takenProductIds = new Set<string>();
  const sections = sectionDefs.map((def, i) => {
    const picked = (sectionResults[i]?.data ?? [])
      .filter((p: any) => isAvailable(p) && !takenProductIds.has(String(p.id)))
      .slice(0, SECTION_SIZE);
    picked.forEach((p: any) => takenProductIds.add(String(p.id)));
    return { ...def, products: picked };
  });

  const bySectionId = (id: string) => sections.find((s) => s.id === id)!;
  const unisexGroup = [bySectionId("unisex")];
  const firstGroup = [bySectionId("mens"), bySectionId("womens")];
  const restGroup = [bySectionId("lifestyle-casual"), bySectionId("running")];

  return (
    <>
      <TrustRow />
      <HeroBanner banners={banners} />

      <div className="container mx-auto px-4 max-w-7xl mt-4">

        <Suspense fallback={<div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl" />}>
          <VoucherClaimSection />
        </Suspense>

        <EventCampaignSection campaigns={campaigns} />

        <CategoryShortcuts />
        <BrandCarousel />

        {/* UNISEX SECTION */}
        <div className="flex flex-col gap-4 pb-4">
          {unisexGroup.map((section, index) => (
            <ProductSection
              key={section.id}
              title={section.title}
              products={section.products}
              bgColor={SECTION_COLORS[index % SECTION_COLORS.length]}
              viewAllHref={section.href}
              backgroundImage={section.bgImage}
            />
          ))}
        </div>

        {/* MENS + WOMENS (dengan side banner) */}
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

          {/* MENS & WOMENS */}
          <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
            {firstGroup.map((section) => (
              <ProductSection
                key={section.id}
                title={section.title}
                products={section.products}
                viewAllHref={section.href}
                backgroundImage={section.bgImage}
              />
            ))}
          </div>
        </div>

        {/* LIFESTYLE & RUNNING */}
        {restGroup.length > 0 && (
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
            {restGroup.map((section, index) => (
              <ProductSection
                key={section.id}
                title={section.title}
                products={section.products}
                bgColor={SECTION_COLORS[index % SECTION_COLORS.length]}
                viewAllHref={section.href}
                backgroundImage={section.bgImage}
              />
            ))}
          </div>
        )}

      </div>
    </>
  );
}
