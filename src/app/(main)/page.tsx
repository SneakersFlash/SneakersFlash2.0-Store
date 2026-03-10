import type { Metadata } from "next";
import { TopSearchBar }      from "@/components/home/TopSearchBar";
import { TrustRow }          from "@/components/home/TrustRow";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { BrandCarousel }     from "@/components/home/BrandCarousel";
import { ProductSection }    from "@/components/home/ProductSection";
import { BottomNavigation }  from "@/components/home/BottomNavigation";

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
  return (
    <>
      <TrustRow />
      <HeroBanner banners={banners} />
      <CategoryShortcuts />
      <BrandCarousel />

      {displayCategories.length > 0 ? (
        displayCategories.map((category: any, index: any) => {
          const bgColor = SECTION_COLORS[index % SECTION_COLORS.length];

          return (
            <ProductSection
              key={category.id || category.slug}
              title={category.name}
              filters={{ categoryName: category.name, limit: 8 }}
              bgColor={bgColor}
              viewAllHref={`/products?category=${category.slug}`}
              backgroundImage={category.imageUrl}
            />
          );
        })
      ) : (
        <ProductSection
          title="Featured Products"
          filters={{ limit: 8 }}
          bgColor="#1A1A2E"
          viewAllHref="/products"
        />
      )}
    </>
  );
}