import type { Metadata } from "next";
import { TopSearchBar }     from "@/components/home/TopSearchBar";
import { TrustRow }          from "@/components/home/TrustRow";
import { HeroBanner }        from "@/components/home/HeroBanner";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { BrandGrid }         from "@/components/home/BrandGrid";
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
      <BrandGrid />

      {/* 6. Lifestyle section */}
      <ProductSection
        title="Lifestyle"
        filters={{ categorySlug: "lifestyle", limit: 8 }}
        bgColor="#4A3728"
        viewAllHref="/products?category=lifestyle"
      />

      {/* 7. Running section */}
      <ProductSection
        title="Running"
        filters={{ categorySlug: "running", limit: 8 }}
        bgColor="#1A2E1A"
        viewAllHref="/products?category=running"
      />

      {/* 8. Padel & Tennis section */}
      <ProductSection
        title="Padel & Tenis"
        filters={{ categorySlug: "padel", limit: 8 }}
        bgColor="#1A1A2E"
        viewAllHref="/products?category=padel"
      />

      {/* 9. Fixed bottom nav (mobile only) */}
      <BottomNavigation />
    </>
  );
}