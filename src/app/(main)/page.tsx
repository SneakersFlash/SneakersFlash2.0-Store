import type { Metadata } from "next";
import Image from "next/image";
import { TrustRow }          from "@/components/home/TrustRow";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { BrandCarousel }     from "@/components/home/BrandCarousel";
import { ProductSection }    from "@/components/home/ProductSection";


// Import service Anda di sini
import { categoriesService } from "@/lib/api/categories.service";
import { bannersService } from "@/lib/api/banners.service";

export const metadata: Metadata = {
  title: "SNKRS Flash — Premium Sneakers & Footwear",
  description:
    "Toko sneakers premium Indonesia. Nike, Adidas, New Balance dan lebih. Gratis ongkir di atas Rp 500k.",
};

// Seluruh halaman ini akan di-cache dan direvalidasi setiap 60 detik
export const revalidate = 60;

const SECTION_COLORS = [
  "#4A3728",
  "#1A2E1A",
  "#1A1A2E",
  "#2D2A26",
  "#3E2723",
];

export default async function HomePage() {
  const [categories, banners] = await Promise.all([
    categoriesService.getAll().catch(() => []),
    bannersService.getBanners("home_top").catch(() => []),
  ]);
  
  const displayCategories = categories.slice(0, 5);
  const firstGroup = displayCategories.slice(0, 2); // 3 kategori pertama yang akan didampingi Side Banner
  const restGroup = displayCategories.slice(3);
  return (
    <>
      <TrustRow />
      <HeroBanner banners={banners} />
      <CategoryShortcuts />
      <BrandCarousel />

      {/* --- KAWASAN PRODUK UTAMA --- */}
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* LAYOUT PC: SIDE BANNER DI KIRI, PRODUCT SECTION DI KANAN */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* SIDE BANNER */}
          <div className="hidden lg:flex flex-col relative w-[280px] shrink-0 rounded-2xl overflow-hidden shadow-lg bg-[#001D4A] group">            <Image 
              src="/placeholder.jpg" // Ganti dengan path banner vertikal Anda
              alt="Promo Sidebar"
              fill
              className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest mb-2">Special Offer</span>
              <h3 className="font-display font-black text-4xl uppercase leading-[0.9] tracking-tight">
                GASPOL<br/>GAJIAN
              </h3>
              <p className="mt-3 text-sm text-white/80">Discount Up To 60% Off. Shop your favorite sneakers now.</p>
              <button className="mt-5 bg-[#FF6B00] text-white text-sm font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">
                Shop Now
              </button>
            </div>
          </div>

          {/* KUMPULAN PRODUCT SECTION (Kanan) - Pakai headerStyle="clean" */}
          <div className="flex-1 flex flex-col gap-10 w-full min-w-0">
            {firstGroup.map((category: any) => (
              <ProductSection
                key={category.id || category.slug}
                title={category.name}
                filters={{ categoryName: category.name, limit: 8 }}
                viewAllHref={`/products?category=${category.slug}`}
              />
            ))}
          </div>

        </div>

        {/* KUMPULAN PRODUCT SECTION SISANYA (Bawah, Full Width) - Pakai headerStyle="banner" */}
        {restGroup.length > 0 && (
          <div className="flex flex-col gap-12 mt-16 pt-16 border-t border-gray-200">
            {restGroup.map((category: any, index: number) => {
               const bgColor = SECTION_COLORS[(firstGroup.length + index) % SECTION_COLORS.length];
               return (
                <ProductSection
                  key={category.id || category.slug}
                  title={category.name}
                  filters={{ categoryName: category.name, limit: 8 }}
                  bgColor={bgColor}
                  viewAllHref={`/products?category=${category.slug}`}
                  backgroundImage={category.imageUrl}
                />
               )
            })}
          </div>
        )}
      </div>
    </>
  );
}