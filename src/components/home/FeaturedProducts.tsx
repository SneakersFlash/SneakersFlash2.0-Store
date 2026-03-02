"use client";

import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useFeaturedProducts } from "@/lib/hooks/useProducts";

export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts(8);

  return (
    <section className="container-2xl py-16 md:py-20">
      <SectionHeading
        eyebrow="Handpicked for you"
        title="Featured Drops"
        subtitle="The most hyped releases, curated by our team every week."
        viewAllHref="/products?sort=newest"
        viewAllLabel="All New Arrivals"
      />

      <ProductGrid
        products={products}
        isLoading={isLoading}
        skeletonCount={8}
        columns={4}
        priorityCount={4}
      />
    </section>
  );
}
