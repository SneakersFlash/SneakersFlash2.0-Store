import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryHighlights } from "@/components/home/CategoryHighlights";
import { BrandStrip } from "@/components/home/BrandStrip";
import { PromoStrip } from "@/components/home/PromoStrip";
import { TrustBar } from "@/components/home/TrustBar";

export const metadata: Metadata = {
  title: "SneakersFlash — Premium Sneakers & Footwear",
  description:
    "Shop Indonesia's biggest sneaker collection. Authentic Nike, Adidas, New Balance and more. Free shipping over Rp 500k.",
};

// ISR — revalidate home page every 60 seconds so featured products stay fresh
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      {/* 1. Full-screen hero with parallax + ticker */}
      <HeroSection />

      {/* 2. Trust signals */}
      <TrustBar />

      {/* 3. Featured products grid */}
      <FeaturedProducts />

      {/* 4. Promo strip */}
      <PromoStrip
        eyebrow="Limited Time"
        headline="Up to 50% off selected styles"
        sub="Sale prices applied at checkout. While stocks last."
        ctaLabel="Shop the Sale"
        ctaHref="/products?sale=true"
        variant="red"
      />

      {/* 5. Category highlights — bento grid */}
      <CategoryHighlights />

      {/* 6. Brand strip */}
      <BrandStrip />

      {/* 7. Secondary promo — dark variant */}
      <PromoStrip
        eyebrow="Members only"
        headline="New drops land every Friday"
        sub="Subscribe to our newsletter and never miss a release."
        ctaLabel="Get Early Access"
        ctaHref="#newsletter"
        variant="dark"
      />
    </>
  );
}
