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
import { InfiniteDeals88HomeSection } from "@/components/campaign/InfiniteDeals88HomeSection"
import { SKU_PAIRS, JUMLAH_SOROTAN_BERANDA } from "@/lib/campaign/infinite-deals-88"
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
  const [banners, apiCategories, campaigns, middleBanners, hasil88] = await Promise.all([
    bannersService.getBanners("home_top").catch(() => []),
    categoriesService.getAll().catch(() => []),
    CampaignsService.getEvent().catch(() => []),
    bannersService.getBanners("home_middle").catch(() => []),
    // Panel Infinite Deals 8.8 — kurasi tangan, bukan event dari admin.
    productsService
      .getProducts({ skus: SKU_PAIRS, limit: JUMLAH_SOROTAN_BERANDA, page: 1 })
      .catch(() => ({ data: [] as any[] })),
  ]);

  // Produk habis stok tidak ditampilkan di panel campaign.
  const produk88 = (hasil88?.data ?? []).filter(
    (p: any) => Number(p?.totalStock ?? 0) > 0,
  );

  const sidebarBanner = middleBanners?.[0];

  const getCategoryImage = (categoryName: string) => {
    const foundCategory = (apiCategories as any[]).find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return foundCategory?.imageUrl || "/placeholder.jpg";
  };

  // Kurasi home page: daftar KODE ARTIKEL pilihan tangan, satu daftar per
  // section. Urutan array = urutan tayang (dijaga backend lewat ?skus=).
  //
  // Menggantikan heuristik `curated`, yang menebak isi section dengan
  // mencocokkan nama produk ke daftar model hype. Heuristik itu memaksa adanya
  // dedupe antar-section karena taxonomy-nya faceted — satu sepatu bisa
  // sekaligus Mens + Running + Lifestyle/Casual, sehingga section non-Running
  // mengembalikan daftar yang praktis identik. Daftar eksplisit menghapus
  // seluruh persoalan itu: tidak ada tebakan nama, tidak ada tumpang tindih tak
  // disengaja, dan isian sheet tidak bisa lagi menggeser apa yang tampil.
  //
  // Menambah/mengurangi barang = cukup sunting daftar di bawah. Kode artikel
  // yang tidak ada di katalog SF (salah ketik, produk nonaktif, atau milik
  // platform lain) dilewati diam-diam oleh backend: section memendek, bukan
  // error. Produk yang stoknya habis juga disaring di bawah.
  const SECTION_SKUS = {
    unisex: [
      "JI3218", "1203A574001", "CT8532080", "U20026PU",
      "M1000LA", "DM0211100", "FZ2068100", "39884686",
    ],
    mens: [
      "JP7676", "1203A896750", "BB550VGC", "ML574EVW",
      "IB8182100", "553558145", "39652001", "39684101",
    ],
    womens: [
      "JS0682", "JP5330", "WL574CUL", "WRCXCS4",
      "IH7318677", "FZ5778004", "DD8959001", "39934801",
    ],
    lifestyleCasual: [
      "JQ7643", "IH4771", "1203A740101", "1203A574001",
      "M475VTH", "U200210D", "IB8174100", "FZ4110103",
    ],
    running: [
      "JH6206", "JP7149", "1147851NKV", "1147930WTTR",
      "M108014C", "MFCXCE4", "M86014G", "JH9184",
    ],
  };

  const sectionDefs = [
    {
      id: "unisex",
      title: "Unisex",
      filters: { skus: SECTION_SKUS.unisex, limit: SECTION_SKUS.unisex.length, page: 1 },
      href: "/products?categories=Mens,Womens&type=Footwear",
      bgImage: getCategoryImage("Mens"),
    },
    {
      id: "mens",
      title: "Mens",
      filters: { skus: SECTION_SKUS.mens, limit: SECTION_SKUS.mens.length, page: 1 },
      href: "/products?category=mens&type=Footwear",
      bgImage: getCategoryImage("Mens"),
    },
    {
      id: "womens",
      title: "Womens",
      filters: { skus: SECTION_SKUS.womens, limit: SECTION_SKUS.womens.length, page: 1 },
      href: "/products?category=womens&type=Footwear",
      bgImage: getCategoryImage("Womens"),
    },
    {
      id: "lifestyle-casual",
      title: "Lifestyle/Casual",
      filters: { skus: SECTION_SKUS.lifestyleCasual, limit: SECTION_SKUS.lifestyleCasual.length, page: 1 },
      // Slug katalognya "lifestylecasual" TANPA tanda hubung; bentuk
      // "lifestyle-casual" tidak cocok dengan apa pun dan menghasilkan 0 produk.
      href: "/products?category=lifestylecasual&type=Footwear",
      bgImage: getCategoryImage("Lifestyle/Casual"),
    },
    {
      id: "running",
      title: "Running",
      filters: { skus: SECTION_SKUS.running, limit: SECTION_SKUS.running.length, page: 1 },
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

  // Sengaja TIDAK ada dedupe antar-section. Dulu itu wajib karena keempat
  // section non-Running mengembalikan daftar yang nyaris sama. Sekarang isinya
  // dipilih tangan, jadi kalau satu kode artikel ditulis di dua section, memang
  // begitulah yang diinginkan.
  const sections = sectionDefs.map((def, i) => ({
    ...def,
    products: (sectionResults[i]?.data ?? []).filter(isAvailable),
  }));

  // Kalau SEMUA section kosong, penyebabnya hampir pasti backend sedang tidak
  // bisa dihubungi (deploy/restart) — bukan katalog yang benar-benar habis:
  // tiap fetch di atas punya .catch() yang mengembalikan array kosong.
  // Melempar error di sini penting: dengan ISR, render yang gagal membuat Next
  // mempertahankan halaman baik yang terakhir dan mencoba lagi nanti. Kalau
  // dibiarkan lolos, halaman kosong itu justru tersimpan di cache dan disajikan
  // ke pengunjung sampai revalidasi berikutnya berhasil.
  if (sections.every((s) => s.products.length === 0)) {
    throw new Error(
      "Home page: semua section kosong — backend produk kemungkinan tidak bisa dihubungi",
    );
  }

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

        {/* Panel event bawaan (CampaignsService) diganti sementara oleh panel
            Infinite Deals 8.8. EventCampaignSection tetap ada di repo — untuk
            mengembalikannya, tukar baris ini kembali. */}
        <InfiniteDeals88HomeSection products={produk88} />

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
