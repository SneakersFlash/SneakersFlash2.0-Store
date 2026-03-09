import type { Metadata } from "next";
import { TopSearchBar }     from "@/components/home/TopSearchBar";
import { TrustRow }          from "@/components/home/TrustRow";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { BrandCarousel }         from "@/components/home/BrandCarousel";
import { ProductSection }    from "@/components/home/ProductSection";
import { BottomNavigation }  from "@/components/home/BottomNavigation";

export const metadata: Metadata = {
  title: "SNKRS Flash — Premium Sneakers & Footwear",
  description:
    "Toko sneakers premium Indonesia. Nike, Adidas, New Balance dan lebih. Gratis ongkir di atas Rp 500k.",
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      {/* 1. Mobile sticky search bar */}
      <TopSearchBar />

      {/* 2. Trust row */}
      <TrustRow />

      {/* 3. Hero promo banner */}
      <HeroBanner />

      {/* 4. Category shortcut pills */}
      <CategoryShortcuts />

      {/* 5. Shop by Brand */}
      <BrandCarousel />

      {/* 6. Lifestyle section */}
      <ProductSection
        title="Lifestyle"
        filters={{ categoryName: "Lifestyle/Casual", limit: 8 }}
        bgColor="#4A3728"
        viewAllHref="/products?category=Lifestyle/Casual"
      />

      {/* 7. Running section */}
      <ProductSection
        title="Running"
        filters={{ categoryName: "running", limit: 8 }}
        bgColor="#1A2E1A"
        viewAllHref="/products?category=running"
      />

      {/* 8. Padel & Tennis section */}
      <ProductSection
        title="Padel & Tenis"
        filters={{ categoryName: "padel", limit: 8 }}
        bgColor="#1A1A2E"
        viewAllHref="/products?category=padel"
      />

      {/* 9. Fixed bottom nav (mobile only) */}
      <BottomNavigation />
    </>
  );
}